'use client';

import dynamic from 'next/dynamic';

const LibraryPageClient = dynamic(() => import('./page-client'), { ssr: false });

export default function LibraryPage() {
  return <LibraryPageClient />;
}
