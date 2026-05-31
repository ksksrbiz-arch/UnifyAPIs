import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { DashboardSidebar } from '@/components/shared/dashboard-sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <DashboardSidebar email={session.user.email ?? ''} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
