'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Navbar } from '@/components/shared/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth-client';
import {
  ExternalLink, Key, Lock, Activity, BookPlus, Code2,
  ChevronLeft, Loader2
} from 'lucide-react';
import Link from 'next/link';

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-lg bg-gray-950 text-gray-100">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <span className="text-xs text-gray-400">{language}</span>
        <button
          onClick={copy}
          className="text-xs text-gray-400 hover:text-white"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function getStaticSnippet(api: { name: string; baseUrl: string | null; exampleEndpoint: string | null }, language: string) {
  const url = `${api.baseUrl ?? 'https://api.example.com'}${api.exampleEndpoint ?? '/endpoint'}`;
  switch (language) {
    case 'javascript':
      return `const response = await fetch('${url}');\nconst data = await response.json();\nconsole.log(data);`;
    case 'python':
      return `import requests\n\nresponse = requests.get('${url}')\ndata = response.json()\nprint(data)`;
    case 'curl':
      return `curl -X GET '${url}' \\\n  -H 'Accept: application/json'`;
    default:
      return '';
  }
}

export default function ApiDetailPage() {
  const params = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const [codeLanguage, setCodeLanguage] = useState<'javascript' | 'python' | 'curl'>('javascript');
  const [aiSnippet, setAiSnippet] = useState('');

  const { data: api, isLoading } = trpc.apis.getBySlug.useQuery(
    { slug: params.slug },
    { enabled: !!params.slug }
  );

  const { data: library } = trpc.userApis.getMyLibrary.useQuery(undefined, {
    enabled: !!session,
  });

  const addMutation = trpc.userApis.addToLibrary.useMutation();
  const aiMutation = trpc.ai.generateCodeSnippet.useMutation({
    onSuccess: (data) => setAiSnippet(data.snippet),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold">API not found</h2>
          <Button asChild variant="outline"><Link href="/apis">Back to catalog</Link></Button>
        </div>
      </div>
    );
  }

  const isAdded = library?.some((ua) => ua.apiId === api.id);
  const userApiId = library?.find((ua) => ua.apiId === api.id)?.id;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/apis"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="h-4 w-4" /> Back to catalog
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{api.name}</h1>
              {api.requiresKey ? (
                <div className="flex items-center gap-1 text-amber-600 text-sm">
                  <Key className="h-4 w-4" /> Requires key
                </div>
              ) : (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <Lock className="h-4 w-4" /> No key needed
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{api.category}</Badge>
              <div className="flex items-center gap-1 text-sm">
                <Activity className="h-3.5 w-3.5 text-green-600" />
                <span className="font-medium">{api.healthScore}% health</span>
              </div>
            </div>
            <p className="text-muted-foreground">{api.description}</p>
          </div>

          <div className="flex gap-2">
            {api.docsUrl && (
              <Button variant="outline" asChild>
                <a href={api.docsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" /> Docs
                </a>
              </Button>
            )}
            {session && (
              <Button
                onClick={() => !isAdded && addMutation.mutate({ apiId: api.id })}
                disabled={isAdded}
                variant={isAdded ? 'secondary' : 'default'}
              >
                <BookPlus className="h-4 w-4 mr-1" />
                {isAdded ? 'In Library' : 'Add to Library'}
              </Button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {api.freeTier && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Free Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{api.freeTier}</p>
              </CardContent>
            </Card>
          )}
          {api.baseUrl && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Base URL</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-sm font-mono">{api.baseUrl}</code>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tags */}
        {api.tags && (api.tags as string[]).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {(api.tags as string[]).map((tag) => (
              <span key={tag} className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Code Snippets */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Code2 className="h-5 w-5" /> Code Snippets
            </h2>
            {session && userApiId && (
              <Button
                size="sm"
                variant="outline"
                disabled={aiMutation.isPending}
                onClick={() =>
                  aiMutation.mutate({ apiId: api.id, language: codeLanguage })
                }
              >
                {aiMutation.isPending ? (
                  <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Generating...</>
                ) : (
                  '✨ AI Generate'
                )}
              </Button>
            )}
          </div>

          <Tabs
            value={codeLanguage}
            onValueChange={(v) => {
              setCodeLanguage(v as typeof codeLanguage);
              setAiSnippet('');
            }}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            {(['javascript', 'python', 'curl'] as const).map((lang) => (
              <TabsContent key={lang} value={lang}>
                <CodeBlock
                  language={lang}
                  code={lang === codeLanguage && aiSnippet ? aiSnippet : getStaticSnippet(api, lang)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
