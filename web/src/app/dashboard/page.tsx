import { Metadata } from 'next';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Mission control for your neural cosmos exploration.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
