import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";

/** The caller of an API route, from their verified Firebase ID token. */
export interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  /** Firebase custom claim `admin`, set with scripts/make_admin.ts. */
  isAdmin: boolean;
}

/**
 * Verifies `Authorization: Bearer <Firebase ID token>`.
 * Returns null when the header is missing or the token is invalid or expired.
 */
export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: typeof decoded.name === "string" ? decoded.name : null,
      picture: decoded.picture ?? null,
      isAdmin: decoded.admin === true,
    };
  } catch {
    return null;
  }
}

/**
 * The signed-in caller, or a 401 response to return as is:
 *   const auth = await requireUser(request);
 *   if (auth instanceof NextResponse) return auth;
 */
export async function requireUser(request: Request): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request);
  return user ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Like requireUser, but also answers 403 when the caller is not an admin. */
export async function requireAdmin(request: Request): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "Admin privileges required" }, { status: 403 });
  return user;
}
