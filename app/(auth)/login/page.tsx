'use client';

import dynamic from 'next/dynamic';

const LoginPageClient = dynamic(() => import('./page-client'), { ssr: false });

export default function LoginPage() {
  return <LoginPageClient />;
}
