'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useSession } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { BookOpen, Brain, Search, TrendingUp, Loader2, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [useCase, setUseCase] = useState('');
  const [recommendations, setRecommendations] = useState<Array<{ name: string; reason: string }>>([]);

  const { data: library } = trpc.userApis.getMyLibrary.useQuery();

  const aiMutation = trpc.ai.recommendAPIs.useMutation({
    onSuccess: (data) => setRecommendations(data.recommendations ?? []),
  });

  const nearLimit = library?.filter(
    (ua) => ua.customThreshold && ua.usageCount !== null && ua.usageCount >= ua.customThreshold * 0.8
  ) ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {session?.user.name ?? session?.user.email?.split('@')[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your API usage overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> Saved APIs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{library?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Total Usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {library?.reduce((sum, ua) => sum + (ua.usageCount ?? 0), 0) ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> Near Limit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{nearLimit.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Near limit warnings */}
      {nearLimit.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-amber-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              APIs nearing usage limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nearLimit.map((ua) => (
                <div key={ua.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{ua.api?.name}</span>
                  <Badge variant="warning">
                    {ua.usageCount} / {ua.customThreshold} calls
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/apis"><Search className="h-4 w-4 mr-2" />Browse Catalog</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/library"><BookOpen className="h-4 w-4 mr-2" />My Library</Link>
        </Button>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI API Recommendations
          </CardTitle>
          <CardDescription>
            Describe your use case and get personalized API recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g. I want to build a weather dashboard that shows forecasts for multiple cities..."
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            rows={3}
          />
          <Button
            onClick={() => aiMutation.mutate({ useCase })}
            disabled={useCase.length < 10 || aiMutation.isPending}
          >
            {aiMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Thinking...</>
            ) : (
              '✨ Get Recommendations'
            )}
          </Button>

          {recommendations.length > 0 && (
            <div className="space-y-3 mt-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-3 rounded-lg border bg-muted/40">
                  <p className="font-medium text-sm">{rec.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
