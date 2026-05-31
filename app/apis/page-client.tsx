'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { ApiCard } from '@/components/shared/api-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/shared/navbar';
import { useSession } from '@/lib/auth-client';
import { Search, X } from 'lucide-react';
import type { Api } from '@/types';

export default function ApisPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [requiresKey, setRequiresKey] = useState<string>('');

  const { data: session } = useSession();

  const { data: apis, isLoading } = trpc.apis.getAll.useQuery({
    category: category || undefined,
    requiresKey: requiresKey === '' ? undefined : requiresKey === 'true',
  });

  const { data: searchResults } = trpc.apis.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length >= 2 }
  );

  const { data: categories } = trpc.apis.getCategories.useQuery();

  const { data: library } = trpc.userApis.getMyLibrary.useQuery(undefined, {
    enabled: !!session,
  });

  const addMutation = trpc.userApis.addToLibrary.useMutation();

  const displayApis: Api[] = searchQuery.length >= 2
    ? (searchResults ?? [])
    : (apis ?? []);

  const savedIds = new Set(library?.map((ua) => ua.apiId) ?? []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Catalog</h1>
          <p className="text-muted-foreground">
            Discover {apis?.length ?? '...'} curated free & freemium APIs
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search APIs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={requiresKey} onValueChange={setRequiresKey}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Key required?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value="false">No key needed</SelectItem>
              <SelectItem value="true">Key required</SelectItem>
            </SelectContent>
          </Select>

          {(category || requiresKey) && (
            <Button
              variant="ghost"
              onClick={() => { setCategory(''); setRequiresKey(''); }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl border bg-muted animate-pulse" />
            ))}
          </div>
        ) : displayApis.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No APIs found. Try different filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayApis.map((api) => (
              <ApiCard
                key={api.id}
                api={api}
                showAddButton={!!session}
                isAdded={savedIds.has(api.id)}
                onAdd={() => addMutation.mutate({ apiId: api.id })}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
