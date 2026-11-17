import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  convertToModelMessages,
  streamText,
  toUIMessageStream,
  type ChatTransport,
  type TextStreamPart,
  type ToolSet,
  type UIMessage,
  type UIMessageChunk,
} from "ai";

/**
 * Chat transport that calls Google Gemini directly from the browser with the user's own API key.
 * The key never reaches Sequoia's servers: requests go browser -> generativelanguage.googleapis.com.
 *
 * The user picks a model group (GEMINI_MODEL_GROUPS). Within it, a failing model is skipped and the
 * next one is used; see "Cooldowns" below for which failures are remembered across messages.
 */

/**
 * Model groups the user picks from. Inside a group, models are tried in order (newest first).
 * The trailing comments are free-tier limits from Google AI Studio's rate-limit page.
 * Edit when Google changes models or limits.
 */
export const GEMINI_MODEL_GROUPS = {
  lite: {
    label: "FLASH LITE",
    models: [
      { id: "gemini-3.5-flash-lite", label: "3.5 FLASH LITE" }, // 15 RPM / 500 RPD
      { id: "gemini-3.1-flash-lite", label: "3.1 FLASH LITE" }, // 15 RPM / 500 RPD
    ],
  },
  flash: {
    label: "FLASH",
    models: [
      { id: "gemini-3.8-flash", label: "3.8 FLASH" }, //     5 RPM / 20 RPD
      { id: "gemini-3.6-flash", label: "3.6 FLASH" }, //     5 RPM / 20 RPD
    ],
  },
  hydrogen: {
    label: "HYDROGEN",
    models: [
      { id: "gemini-4-hydrogen", label: "4 HYDROGEN" }, //   5 RPM / 20 RPD
    ],
  },
} as const;

export type GeminiGroupId = keyof typeof GEMINI_MODEL_GROUPS;
export const DEFAULT_GEMINI_GROUP: GeminiGroupId = "lite";

/** Metadata attached to each assistant message. */
export type AssistantMetadata = { model: string };

const SYSTEM_PROMPT =
  "You are the SEQUOIA SYSTEM AI. You are a cyber-themed expert assistant focused on Artificial Intelligence, " +
  "Machine Learning, and Coding. Keep responses concise, technical, and use markdown for formatting code and mathematics.";

// --- Cooldowns (per browser) ------------------------------------------------
// Only quota (429) and retired (404) models are put on cooldown. Overloaded (5xx) models are not:
// that is a temporary problem on Google's side, so the next message tries them again.
// Nothing is ever retried within one message, so a message costs at most one request per model.

type CooldownReason = "quota" | "retired";
type Cooldown = { until: number; reason: CooldownReason };

const COOLDOWN_STORAGE_KEY = "sequoia_gemini_model_cooldowns";
const RETIRED_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 404: re-check after a week
const DEFAULT_RATE_LIMIT_MS = 60 * 1000;

function readCooldowns(): Record<string, Cooldown> {
  try {
    const raw = JSON.parse(window.localStorage.getItem(COOLDOWN_STORAGE_KEY) ?? "{}") as Record<string, Cooldown | number>;
    // Older entries were stored as a bare timestamp (quota).
    return Object.fromEntries(
      Object.entries(raw).map(([id, v]) => [id, typeof v === "number" ? { until: v, reason: "quota" as const } : v]),
    );
  } catch {
    return {};
  }
}

function setCooldown(modelId: string, cooldown: Cooldown) {
  try {
    const all = readCooldowns();
    all[modelId] = cooldown;
    window.localStorage.setItem(COOLDOWN_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable: the model is simply retried next time */
  }
}

// --- Errors -----------------------------------------------------------------

type ApiError = { statusCode?: number; message?: string; responseBody?: string };

function unwrap(error: unknown): ApiError {
  // streamText may wrap the real error in a RetryError.
  return ((error as { lastError?: unknown })?.lastError ?? error) as ApiError;
}

/** Wait time in ms from Google's RetryInfo `retryDelay` (e.g. "82311s"), if the error has one. */
function retryDelayMs(err: ApiError): number | null {
  const match = err.responseBody?.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/);
  return match ? Math.ceil(Number(match[1]) * 1000) : null;
}

type FailureKind = "quota" | "retired" | "overloaded" | "fatal";

function classify(error: unknown): FailureKind {
  const status = unwrap(error).statusCode;
  if (status === 429) return "quota";
  if (status === 404) return "retired";
  if (status && status >= 500) return "overloaded";
  return "fatal"; // e.g. invalid key: every model would fail the same way
}

/** Turns Gemini / network errors into a short message the user can act on. */
export function describeGeminiError(error: unknown): string {
  const err = unwrap(error);
  const status = err.statusCode;
  const text = `${err.message ?? ""} ${err.responseBody ?? ""}`;

  if (/API key not valid|API_KEY_INVALID/i.test(text)) return "API key is invalid. Check it and enter it again.";
  if (status === 401 || status === 403) return "This API key is not allowed to use Gemini (permission denied).";
  if (status === 429) return "Rate limit or quota reached.";
  if (status === 404) return "Model is no longer available.";
  if (status && status >= 500) return `Gemini is overloaded right now (${status}). Try again in a moment.`;
  if (err instanceof TypeError) return "Could not reach Gemini. Check your internet connection.";
  return err.message || "Unknown error while talking to Gemini.";
}

function formatWait(ms: number): string {
  const min = Math.ceil(ms / 60000);
  return min >= 60 ? `${Math.ceil(min / 60)}h` : `${min}m`;
}

// --- Transport --------------------------------------------------------------

type Part = TextStreamPart<ToolSet>;
type GeminiModel = { id: string; label: string };
type Attempt = { ok: true; stream: ReadableStream<Part> } | { ok: false; error: unknown };

export class BrowserGeminiTransport implements ChatTransport<UIMessage<AssistantMetadata>> {
  private apiKey: string | null = null;

  /** Update the key used for the next request. */
  setApiKey(key: string | null) {
    this.apiKey = key;
  }

  async sendMessages({
    messages,
    abortSignal,
    body,
  }: Parameters<ChatTransport<UIMessage<AssistantMetadata>>["sendMessages"]>[0]): Promise<ReadableStream<UIMessageChunk>> {
    const apiKey = this.apiKey;
    if (!apiKey) throw new Error("No Gemini API key set. Add your key to use the assistant.");

    const requested = (body as { group?: string } | undefined)?.group;
    const group = GEMINI_MODEL_GROUPS[(requested && requested in GEMINI_MODEL_GROUPS ? requested : DEFAULT_GEMINI_GROUP) as GeminiGroupId];

    const google = createGoogleGenerativeAI({ apiKey });
    const modelMessages = await convertToModelMessages(messages);
    const now = Date.now();
    const cooldowns = readCooldowns();
    const candidates = group.models.filter(m => !((cooldowns[m.id]?.until ?? 0) > now));

    if (candidates.length === 0) {
      const all = group.models.map(m => cooldowns[m.id]);
      if (all.every(c => c?.reason === "retired")) {
        throw new Error(`All ${group.label} models are no longer available. Pick another model group.`);
      }
      const next = Math.min(...all.filter(c => c?.reason === "quota").map(c => c!.until));
      throw new Error(
        `All ${group.label} models are out of quota for now (available again in about ${formatWait(next - now)}). Try another model group.`,
      );
    }

    const toUI = (stream: ReadableStream<Part>, model: GeminiModel) =>
      toUIMessageStream<ToolSet, UIMessage<AssistantMetadata>>({
        stream,
        onError: describeGeminiError,
        messageMetadata: ({ part }) => (part.type === "start" ? { model: model.label } : undefined),
      });

    let lastError: unknown = null;
    let sawOverload = false;
    // One request per model, no retries: each failure moves straight on to the next model in the group.
    for (const model of candidates) {
      const result = await this.tryModel(google, model, modelMessages, abortSignal);
      if (result.ok) return toUI(result.stream, model);

      const kind = classify(result.error);
      lastError = result.error;
      if (kind === "fatal") {
        // Same error for every model (bad key, bad request): show it instead of rotating.
        return toUI(new ReadableStream<Part>({
          start(c) { c.enqueue({ type: "error", error: result.error }); c.close(); },
        }), model);
      }
      if (kind === "overloaded") {
        sawOverload = true; // temporary: no cooldown, so the next message tries this model again
        continue;
      }
      setCooldown(model.id, {
        reason: kind,
        until: Date.now() + (kind === "retired" ? RETIRED_COOLDOWN_MS : retryDelayMs(unwrap(result.error)) ?? DEFAULT_RATE_LIMIT_MS),
      });
    }

    if (sawOverload) {
      throw new Error(`Gemini is overloaded right now (all ${group.label} models). Try again in a minute, or pick another model group.`);
    }
    throw new Error(`${describeGeminiError(lastError)} All ${group.label} models were tried. Try another model group.`);
  }

  /**
   * Starts one request and reads until the model either starts answering or fails,
   * so a failure can still be rotated to the next model before anything reaches the chat.
   */
  private async tryModel(
    google: ReturnType<typeof createGoogleGenerativeAI>,
    model: GeminiModel,
    messages: Awaited<ReturnType<typeof convertToModelMessages>>,
    abortSignal: AbortSignal | undefined,
  ): Promise<Attempt> {
    const result = streamText({
      model: google(model.id),
      system: SYSTEM_PROMPT,
      messages,
      abortSignal,
      maxOutputTokens: 4096,
      maxRetries: 0, // no retries: rotation is handled in sendMessages
      onError: () => {}, // silence the default console logging; errors arrive as stream parts below
    });

    const reader = result.stream.getReader();
    const buffered: Part[] = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value.type === "error") {
        reader.cancel().catch(() => {});
        return { ok: false, error: value.error };
      }
      buffered.push(value);
      if (value.type === "text-delta" || value.type === "reasoning-delta" || value.type === "finish") break;
    }

    const stream = new ReadableStream<Part>({
      start(controller) {
        buffered.forEach(p => controller.enqueue(p));
      },
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) controller.close();
        else controller.enqueue(value);
      },
      cancel(reason) {
        return reader.cancel(reason);
      },
    });
    return { ok: true, stream };
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    // Nothing runs on a server, so there is no stream to resume.
    return null;
  }
}
