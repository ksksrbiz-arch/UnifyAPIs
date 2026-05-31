'use client';

import dynamic from 'next/dynamic';

const ApisPageClient = dynamic(() => import('./page-client'), { ssr: false });

export default function ApisPage() {
  return <ApisPageClient />;
}
