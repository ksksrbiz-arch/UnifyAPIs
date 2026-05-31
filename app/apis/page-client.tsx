'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { ApiCard } from '@/components/shared/api-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/shared/navbar';
import { useSession } from '@/lib/auth-client';
import { Search, X, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import type { Api } from '@/types';

const PAGE_SIZE = 12;

export default function ApisPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [requiresKey, setRequiresKey] = useState<string>('');
  const [page, setPage] = useState(0);

  const { data: session } = useSession();
  const utils = trpc.useUtils();

  const requiresKeyBool =
    requiresKey === '' ? undefined : requiresKey === 'true';
  const isSearching = searchQuery.trim().length >= 2;
  const hasFilters = !!category || requiresKey !== '';

  const listInput = {
    category: category || undefined,
    requiresKey: requiresKeyBool,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const searchInput = {
    query: searchQuery.trim(),
    category: category || undefined,
    requiresKey: requiresKeyBool,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const { data: apis, isLoading: apisLoading } = trpc.apis.getAll.useQuery(
    listInput,
    { enabled: !isSearching }
  );

  const { data: searchResults, isLoading: searchLoading } =
    trpc.apis.search.useQuery(searchInput, { enabled: isSearching });

  const { data: totalCount } = trpc.apis.count.useQuery({
    category: category || undefined,
    requiresKey: requiresKeyBool,
  });

  const { data: categories } = trpc.apis.getCategories.useQuery();

  const { data: popular } = trpc.apis.getPopular.useQuery(
    { limit: 6 },
    { enabled: !isSearching && !hasFilters && page === 0 }
  );

  const { data: library } = trpc.userApis.getMyLibrary.useQuery(undefined, {
    enabled: !!session,
  });

  type LibraryEntry = NonNullable<typeof library>[number];

  const addMutation = trpc.userApis.addToLibrary.useMutation({
    onMutate: async ({ apiId }) => {
      await utils.userApis.getMyLibrary.cancel();
      const previous = utils.userApis.getMyLibrary.getData();
      const target = (apis ?? searchResults ?? popular ?? []).find(
        (a) => a.id === apiId
      );
      if (target) {
        const optimistic: LibraryEntry = {
          id: `optimistic-${apiId}`,
          userId: session?.user?.id ?? '',
          apiId,
          usageCount: 0,
          customThreshold: null,
          notes: null,
          tags: [],
          addedAt: new Date(),
          lastUsed: null,
          api: target as LibraryEntry['api'],
        };
        utils.userApis.getMyLibrary.setData(undefined, [
          optimistic,
          ...(previous ?? []),
        ]);
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        utils.userApis.getMyLibrary.setData(undefined, ctx.previous);
      }
    },
    onSuccess: () => {
      utils.userApis.getMyLibrary.invalidate();
    },
  });

  const displayApis: Api[] = isSearching
    ? (searchResults ?? [])
    : (apis ?? []);
  const isLoading = isSearching ? searchLoading : apisLoading;

  const savedIds = new Set(library?.map((ua) => ua.apiId) ?? []);

  const totalPages = totalCount ? Math.ceil(totalCount / PAGE_SIZE) : 0;
  const canPrev = page > 0;
  // For search we don't have a total count, so use returned page size heuristic
  const canNext = isSearching
    ? (searchResults?.length ?? 0) === PAGE_SIZE
    : totalCount
      ? (page + 1) * PAGE_SIZE < totalCount
      : (apis?.length ?? 0) === PAGE_SIZE;

  // Reset page when filters / search change
  const resetPage = () => setPage(0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Catalog</h1>
          <p className="text-muted-foreground">
            Discover {totalCount ?? '...'} curated free & freemium APIs
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search APIs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                resetPage();
              }}
              className="pl-9"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => {
                  setSearchQuery('');
                  resetPage();
                }}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              resetPage();
            }}
          >
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

          <Select
            value={requiresKey}
            onValueChange={(v) => {
              setRequiresKey(v);
              resetPage();
            }}
          >
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
              onClick={() => {
                setCategory('');
                setRequiresKey('');
                resetPage();
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Popular APIs section (only on first page with no filters or search) */}
        {!isSearching && !hasFilters && page === 0 && popular && popular.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-semibold">Popular APIs</h2>
              <span className="text-xs text-muted-foreground">
                Most saved by the community
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popular.map((api) => (
                <ApiCard
                  key={`popular-${api.id}`}
                  api={api}
                  showAddButton={!!session}
                  isAdded={savedIds.has(api.id)}
                  onAdd={() => addMutation.mutate({ apiId: api.id })}
                />
              ))}
            </div>
          </section>
        )}

        {/* Results */}
        {!isSearching && !hasFilters && page === 0 && (
          <h2 className="text-xl font-semibold mb-4">All APIs</h2>
        )}
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
          <>
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

            {/* Pagination */}
            {(canPrev || canNext) && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canPrev}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {page + 1}
                  {!isSearching && totalPages ? ` of ${totalPages}` : ''}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
