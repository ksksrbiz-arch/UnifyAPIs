'use client';

import dynamic from 'next/dynamic';

const LandingPageClient = dynamic(() => import('./page-client'), { ssr: false });

export default function RootPage() {
  return <LandingPageClient />;
}
