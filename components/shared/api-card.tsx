import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Key, Lock } from 'lucide-react';
import type { Api } from '@/types';

interface ApiCardProps {
  api: Api;
  showAddButton?: boolean;
  onAdd?: () => void;
  isAdded?: boolean;
}

export function ApiCard({ api, showAddButton, onAdd, isAdded }: ApiCardProps) {
  const healthColor =
    api.healthScore && api.healthScore >= 90
      ? 'text-green-600'
      : api.healthScore && api.healthScore >= 70
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            <Link href={`/apis/${api.slug}`} className="hover:underline">
              {api.name}
            </Link>
          </CardTitle>
          <div className="flex items-center gap-1">
            {api.requiresKey ? (
              <Key className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" aria-label="Requires API key" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-green-500 flex-shrink-0" aria-label="No key required" />
            )}
            <span className={`text-xs font-semibold ${healthColor}`}>
              {api.healthScore}%
            </span>
          </div>
        </div>
        <Badge variant="secondary" className="w-fit text-xs">
          {api.category}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 py-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{api.description}</p>
        {api.freeTier && (
          <p className="text-xs text-green-700 mt-2 line-clamp-1">✓ {api.freeTier}</p>
        )}
        {api.tags && api.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(api.tags as string[]).slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/apis/${api.slug}`}>View details</Link>
        </Button>
        {showAddButton && (
          <Button
            size="sm"
            variant={isAdded ? 'secondary' : 'default'}
            onClick={onAdd}
            disabled={isAdded}
          >
            {isAdded ? 'Added' : '+ Add'}
          </Button>
        )}
        {api.docsUrl && (
          <Button variant="ghost" size="icon" asChild>
            <a href={api.docsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
