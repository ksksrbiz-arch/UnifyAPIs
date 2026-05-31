'use client';

import dynamic from 'next/dynamic';

const DashboardPageClient = dynamic(() => import('./page-client'), { ssr: false });

export default function DashboardPage() {
  return <DashboardPageClient />;
}
