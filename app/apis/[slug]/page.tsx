'use client';

import dynamic from 'next/dynamic';

const ApiDetailClient = dynamic(() => import('./page-client'), { ssr: false });

export default function ApiDetailPage() {
  return <ApiDetailClient />;
}
