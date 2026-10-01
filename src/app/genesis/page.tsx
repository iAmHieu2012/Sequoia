import { Metadata } from 'next';
import GenesisClient from '@/components/admin/GenesisClient';

export const metadata: Metadata = {
  title: 'Administrator',
  description: 'Cyberpunk World Genesis Interface',
};

export default function GenesisPage() {
  return <GenesisClient />;
}
