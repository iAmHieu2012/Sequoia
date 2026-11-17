import { Metadata } from 'next';
import AuthClient from '@/components/auth/AuthClient';
import { safeNext } from '@/utils/safeNext';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Enter credentials to access the Sequoia Neural Cosmos Exploring Spacecraft.',
};

// Login error codes passed back from /auth/callback, shown in the login panel.
const ERROR_MESSAGES: Record<string, string> = {
  oauth_cancelled: 'GOOGLE_SIGN_IN_CANCELLED',
  oauth_failed: 'GOOGLE_SIGN_IN_FAILED: TRY_AGAIN',
  reset_link_invalid: 'RESET_LINK_INVALID_OR_EXPIRED: REQUEST_A_NEW_ONE',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  return (
    <AuthClient
      initialError={error ? ERROR_MESSAGES[error] ?? 'AUTHENTICATION_FAILED' : undefined}
      next={safeNext(next)}
    />
  );
}
