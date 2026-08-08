import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { initializeUserRecord } from '@/lib/services/auth';

export const mapFirebaseError = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use': return 'EMAIL_ALREADY_REGISTERED';
    case 'auth/invalid-credential': return 'INVALID_CREDENTIALS';
    case 'auth/user-not-found': return 'USER_NOT_FOUND';
    case 'auth/wrong-password': return 'INVALID_PASSWORD';
    case 'auth/network-request-failed': return 'NETWORK_CONNECTION_FAILED';
    case 'auth/too-many-requests': return 'TOO_MANY_ATTEMPTS._TRY_LATER';
    case 'auth/invalid-email': return 'INVALID_EMAIL_FORMAT';
    case 'auth/weak-password': return 'PASSWORD_TOO_WEAK';
    default: return 'AUTHENTICATION_FAILED';
  }
};

export function useAuthActions() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async (isLogin: boolean, email: string, password: string, name?: string) => {
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!name?.trim()) throw new Error("DISPLAY_NAME is required for registration.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name.trim() });
        await initializeUserRecord(userCredential.user, name);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(mapFirebaseError(err.code) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await initializeUserRecord(userCredential.user, userCredential.user.displayName || '');
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError(mapFirebaseError(err.code) || err.message);
      }
    } finally {
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
      await sendPasswordResetEmail(auth, email);
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
