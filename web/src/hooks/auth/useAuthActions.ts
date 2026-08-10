import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export const mapSupabaseError = (errorMessage: string): string => {
  if (errorMessage.includes('Invalid login credentials')) return 'INVALID_CREDENTIALS';
  if (errorMessage.includes('User already registered')) return 'EMAIL_ALREADY_REGISTERED';
  return errorMessage || 'AUTHENTICATION_FAILED';
};

export function useAuthActions() {
  const [error, setError] = useState('');
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
      router.push('/dashboard');
    } catch (err: any) {
      setError(mapSupabaseError(err.message));
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
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(mapSupabaseError(err.message));
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
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setMessage("RESET_LINK_DISPATCHED_TO_EMAIL");
    } catch (err: any) {
      setError(err.message || 'FAILED_TO_DISPATCH_RESET_LINK');
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
