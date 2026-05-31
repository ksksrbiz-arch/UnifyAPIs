'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc/client';
import { useSession } from '@/lib/auth-client';
import { Check, Zap } from 'lucide-react';

const PRO_FEATURES = [
  'Unlimited API library',
  'AI recommendations & code generation',
  'Advanced usage analytics',
  'Priority support',
  'Early access to new features',
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const { data: library } = trpc.userApis.getMyLibrary.useQuery();

  const handleUpgrade = async () => {
    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and subscription.</p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{session?.user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{session?.user.name ?? '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Plan</span>
            <Badge variant="secondary">Free</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">APIs saved</span>
            <span className="font-medium">{library?.length ?? 0}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pro plan */}
      <Card className="border-primary/40 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Pro Plan</CardTitle>
            <Badge className="ml-auto">$9/mo</Badge>
          </div>
          <CardDescription>Unlock the full power of UnifyAPIs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button onClick={handleUpgrade} className="w-full">
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
