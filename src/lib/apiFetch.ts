import { getFirebaseAuth } from "@/lib/firebase/client";

/**
 * fetch() for our own API that adds the signed-in user's Firebase ID token.
 * getIdToken() returns a cached token and refreshes it shortly before it expires,
 * so it is called on every request instead of storing the token.
 * Signed out: the request goes without a token (public routes still work).
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const user = getFirebaseAuth().currentUser;
  const headers = new Headers(init.headers);
  if (user) headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
  return fetch(input, { ...init, headers });
}
