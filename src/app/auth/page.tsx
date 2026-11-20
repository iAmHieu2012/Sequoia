import { Metadata } from 'next';
import AuthClient from '@/components/auth/AuthClient';
import { safeNext } from '@/utils/safeNext';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Enter credentials to access the Sequoia Neural Cosmos Exploring Spacecraft.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthClient next={safeNext(next)} />;
}
