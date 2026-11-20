"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onIdTokenChanged, signOut as firebaseSignOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { apiFetch } from "@/lib/apiFetch";

/** The signed-in user as the app sees it (from Firebase). */
export interface AppUser {
  id: string; // Firebase UID, also the id of the user's rows in Supabase
  email: string | null;
  name: string | null;
  photoUrl: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

/**
 * Global authentication state from Firebase.
 * isAdmin comes from the `admin` custom claim in the ID token (set with scripts/make_admin.ts).
 *
 * Listens to onIdTokenChanged rather than onAuthStateChanged so that a refreshed token also
 * refreshes the user: after registration the display name is set and the token is forced to
 * refresh, and new claims (admin) show up the next time the token renews.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Each callback gets a number; a slower, older callback (e.g. still syncing when the
    // user signs out) must not overwrite the result of a newer one.
    let latest = 0;

    return onIdTokenChanged(getFirebaseAuth(), async (fbUser) => {
      const run = ++latest;

      if (!fbUser) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Create/refresh the profile row before exposing the user, so the user's first
      // requests (streak, progress) never run before their row exists.
      try {
        await apiFetch("/api/v1/users/me", { method: "POST" });
      } catch (error) {
        console.error("Failed to sync user profile:", error);
      }

      const token = await fbUser.getIdTokenResult();
      if (run !== latest) return;

      const next: AppUser = {
        id: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName,
        photoUrl: fbUser.photoURL,
      };
      // Hourly token refreshes keep the same object, so components depending on `user`
      // do not refetch for nothing.
      setUser(prev =>
        prev && prev.id === next.id && prev.email === next.email &&
        prev.name === next.name && prev.photoUrl === next.photoUrl
          ? prev
          : next
      );
      setIsAdmin(token.claims.admin === true);
      setLoading(false);
    });
  }, []);

  const signOut = () => firebaseSignOut(getFirebaseAuth());

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
