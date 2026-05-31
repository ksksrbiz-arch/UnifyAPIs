'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, LayoutDashboard, BookOpen, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth-client';

interface DashboardSidebarProps {
  email: string;
}

export function DashboardSidebar({ email }: DashboardSidebarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-56 border-r bg-card hidden md:flex flex-col">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Zap className="h-5 w-5 text-primary" />
            UnifyAPIs
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
            { href: '/dashboard/library', icon: BookOpen, label: 'My Library' },
            { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground mb-2 truncate">{email}</div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Zap className="h-5 w-5 text-primary" />
          UnifyAPIs
        </Link>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </header>
    </>
  );
}
