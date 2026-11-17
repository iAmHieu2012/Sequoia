import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

/**
 * Translates known Supabase error messages into uppercase error codes; unknown messages pass through.
 */
export const mapSupabaseError = (errorMessage: string): string => {
  if (errorMessage.includes('Invalid login credentials')) return 'INVALID_CREDENTIALS';
  if (errorMessage.includes('User already registered')) return 'EMAIL_ALREADY_REGISTERED';
  return errorMessage || 'AUTHENTICATION_FAILED';
};

/**
 * Supabase auth flows: email/password login and registration, Google OAuth, and password reset.
 * Manages its own loading, error, and success message states.
 *
 * `initialError`: message to show on load (e.g. a failed Google sign-in passed back by /auth/callback).
 * `next`: same-site path to go to after signing in (already validated with safeNext).
 */
export function useAuthActions({ initialError, next = '/dashboard' }: { initialError?: string; next?: string } = {}) {
  const [error, setError] = useState(initialError ?? '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleEmailAuth = async (isLogin: boolean, email: string, password: string, name?: string) => {
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (!name?.trim()) throw new Error("DISPLAY_NAME is required for registration.");
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              name: name.trim(),
              full_name: name.trim()
            }
          }
        });
        if (error) throw error;
      }
      router.push(next);
    } catch (error: unknown) {
      setError(mapSupabaseError(error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        }
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(mapSupabaseError(error instanceof Error ? error.message : String(error)));
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!email.trim()) {
      setError("ENTER_EMAIL_FIRST_TO_RESET_KEY");
      setMessage('');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Goes through the callback so the one-time code becomes a session before the new-password page.
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/auth/update-password')}`,
      });
      if (error) throw error;
      setMessage("RESET_LINK_DISPATCHED_TO_EMAIL");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'FAILED_TO_DISPATCH_RESET_LINK');
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
