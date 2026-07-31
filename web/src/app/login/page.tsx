import { Metadata } from 'next';
import AuthClient from '@/components/AuthClient';

export const metadata: Metadata = {
  title: 'Authentication | Sequoia',
  description: 'Enter credentials to access the Sequoia Neural Cosmos.',
};

export default function LoginPage() {
  return <AuthClient />;
}
