import { Metadata } from 'next';
import LandingClient from '@/components/LandingClient';

export const metadata: Metadata = {
  title: 'Sequoia - The Neural Cosmos',
  description: 'Traverse the neural pathways, decode complex machine learning models directly on your device, and map the unexplored sectors of artificial intelligence.',
  openGraph: {
    title: 'Sequoia - The Neural Cosmos',
    description: 'Welcome to the next evolution of AI education.',
    type: 'website',
  },
};

export default function Page() {
  return <LandingClient />;
}
