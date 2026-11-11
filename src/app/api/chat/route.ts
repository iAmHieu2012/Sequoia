import { NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { 
  streamText, 
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream
} from 'ai';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';

const ALLOWED_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
const MAX_MESSAGES = 40;
const MAX_TOTAL_CHARS = 40_000;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, modelId: requestedModelId } = await req.json();

    // Only the models offered in the UI; anything else falls back to the cheapest one.
    const modelId = ALLOWED_MODELS.includes(requestedModelId) ? requestedModelId : ALLOWED_MODELS[0];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }
    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json({ error: `Conversation too long (max ${MAX_MESSAGES} messages)` }, { status: 413 });
    }
    const totalChars = messages.reduce((sum: number, m: { parts?: { type?: string; text?: string }[] }) =>
      sum + (m.parts ?? []).reduce((s, p) => s + (p.type === 'text' && typeof p.text === 'string' ? p.text.length : 0), 0), 0);
    if (totalChars > MAX_TOTAL_CHARS) {
      return NextResponse.json({ error: `Conversation too long (max ${MAX_TOTAL_CHARS} characters)` }, { status: 413 });
    }

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    });

    const result = await streamText({
      model: google(modelId),
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 4096,
      system: `You are the SEQUOIA SYSTEM AI. You are a cyber-themed expert assistant focused on Artificial Intelligence, Machine Learning, and Coding. Keep responses concise, technical, and use markdown for formatting code and mathematics.`,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
