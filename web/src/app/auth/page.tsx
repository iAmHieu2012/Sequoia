import { Metadata } from 'next';
import AuthClient from '@/components/auth/AuthClient';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Enter credentials to access the Sequoia Neural Cosmos Exploring Spacecraft.',
};

export default function LoginPage() {
  return <AuthClient />;
}
