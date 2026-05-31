'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from '@/lib/auth-client';
import { Zap } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Zap className="h-5 w-5 text-primary" />
          UnifyAPIs
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/apis"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Catalog
          </Link>

          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
