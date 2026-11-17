import { useCallback, useState } from "react";

const STORAGE_KEY = "sequoia_gemini_api_key";

/** Storage can throw (private mode, blocked site data); treat that as "nothing stored". */
function read(storage: () => Storage): string | null {
  try {
    return storage().getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function write(storage: () => Storage, value: string | null) {
  try {
    if (value === null) storage().removeItem(STORAGE_KEY);
    else storage().setItem(STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

const session = () => window.sessionStorage;
const local = () => window.localStorage;

/**
 * The user's own Gemini API key, kept only in this browser.
 * Default: sessionStorage (gone when the tab closes). "Remember" moves it to localStorage.
 *
 * Note: reads storage during the first render. Only use this in components that are not
 * server-rendered (the dashboard renders nothing until it has mounted).
 */
export function useGeminiApiKey() {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") return { key: null as string | null, remembered: false };
    const remembered = read(local);
    return { key: remembered ?? read(session), remembered: remembered !== null };
  });

  const save = useCallback((key: string, remember: boolean) => {
    const trimmed = key.trim();
    if (!trimmed) return;
    write(remember ? local : session, trimmed);
    write(remember ? session : local, null);
    setState({ key: trimmed, remembered: remember });
  }, []);

  const clear = useCallback(() => {
    write(local, null);
    write(session, null);
    setState({ key: null, remembered: false });
  }, []);

  return { apiKey: state.key, remembered: state.remembered, save, clear };
}
