import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';

/** Firebase Auth error codes shown as the UI's uppercase messages. */
const ERROR_CODES: Record<string, string> = {
  'auth/invalid-credential': 'INVALID_CREDENTIALS',
  'auth/wrong-password': 'INVALID_CREDENTIALS',
  'auth/user-not-found': 'INVALID_CREDENTIALS',
  'auth/invalid-email': 'INVALID_EMAIL',
  'auth/email-already-in-use': 'EMAIL_ALREADY_REGISTERED',
  'auth/weak-password': 'KEY_TOO_WEAK: MIN_6_CHARACTERS',
  'auth/too-many-requests': 'TOO_MANY_ATTEMPTS: TRY_AGAIN_LATER',
  'auth/popup-closed-by-user': 'GOOGLE_SIGN_IN_CANCELLED',
  'auth/cancelled-popup-request': 'GOOGLE_SIGN_IN_CANCELLED',
  'auth/popup-blocked': 'POPUP_BLOCKED: ALLOW_POPUPS_FOR_THIS_SITE',
  'auth/network-request-failed': 'NETWORK_ERROR: CHECK_CONNECTION',
  'auth/account-exists-with-different-credential': 'EMAIL_ALREADY_REGISTERED_WITH_ANOTHER_METHOD',
};

export const mapAuthError = (error: unknown): string => {
  if (error instanceof FirebaseError) return ERROR_CODES[error.code] ?? 'AUTHENTICATION_FAILED';
  return error instanceof Error && error.message ? error.message : 'AUTHENTICATION_FAILED';
};

/**
 * Firebase auth flows: email/password login and registration, Google sign-in, and password reset.
 * Manages its own loading, error, and success message states.
 *
 * `next`: same-site path to go to after signing in (already validated with safeNext).
 */
export function useAuthActions({ next = '/dashboard' }: { next?: string } = {}) {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const start = () => {
    setError('');
    setMessage('');
    setLoading(true);
  };

  const handleEmailAuth = async (isLogin: boolean, email: string, password: string, name?: string) => {
    start();
    try {
      const auth = getFirebaseAuth();
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!name?.trim()) throw new Error('DISPLAY_NAME is required for registration.');
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName: name.trim() });
        // New token carrying the name; AuthContext picks it up and saves it to the profile.
        await user.getIdToken(true);
      }
      router.push(next);
    } catch (err: unknown) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    start();
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      router.push(next);
    } catch (err: unknown) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!email.trim()) {
      setError('ENTER_EMAIL_FIRST_TO_RESET_KEY');
      setMessage('');
      return;
    }
    start();
    try {
      // By default the email opens Firebase's own reset page, which then links back to `url` (/auth).
      // Setting Authentication > Templates > "Customize action URL" to <site>/auth/update-password
      // sends users to our page instead. Either way the domain must be in Authorized domains.
      await sendPasswordResetEmail(getFirebaseAuth(), email, { url: `${window.location.origin}/auth` });
      setMessage('RESET_LINK_DISPATCHED_TO_EMAIL');
    } catch (err: unknown) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setMessage('');
  };

  return {
    error,
    message,
    loading,
    handleEmailAuth,
    handleGoogleSignIn,
    handleResetPassword,
    clearMessages
  };
}
