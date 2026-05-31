'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Download, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { UserApi } from '@/types';

function UsageLogDialog({
  userApi,
  open,
  onClose,
}: {
  userApi: UserApi;
  open: boolean;
  onClose: () => void;
}) {
  const [calls, setCalls] = useState('');
  const utils = trpc.useUtils();
  const mutation = trpc.userApis.updateUsage.useMutation({
    onSuccess: () => {
      utils.userApis.getMyLibrary.invalidate();
      setCalls('');
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Usage — {userApi.api?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Current usage: <strong>{userApi.usageCount ?? 0}</strong> calls
            {userApi.customThreshold && ` / ${userApi.customThreshold} limit`}
          </p>
          <div className="space-y-2">
            <Label>Calls made</Label>
            <Input
              type="number"
              min={1}
              value={calls}
              onChange={(e) => setCalls(e.target.value)}
              placeholder="e.g. 100"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!calls || mutation.isPending}
            onClick={() =>
              mutation.mutate({
                userApiId: userApi.id,
                callsMade: parseInt(calls),
              })
            }
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Log usage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditNotesDialog({
  userApi,
  open,
  onClose,
}: {
  userApi: UserApi;
  open: boolean;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(userApi.notes ?? '');
  const [threshold, setThreshold] = useState(String(userApi.customThreshold ?? ''));
  const utils = trpc.useUtils();
  const mutation = trpc.userApis.updateNotes.useMutation({
    onSuccess: () => {
      utils.userApis.getMyLibrary.invalidate();
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit — {userApi.api?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your notes about this API..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Custom usage limit (optional)</Label>
            <Input
              type="number"
              min={1}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="e.g. 1000"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate({
                userApiId: userApi.id,
                notes,
                customThreshold: threshold ? parseInt(threshold) : undefined,
              })
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function LibraryPage() {
  const [logDialogApi, setLogDialogApi] = useState<UserApi | null>(null);
  const [editDialogApi, setEditDialogApi] = useState<UserApi | null>(null);

  const utils = trpc.useUtils();
  const { data: library, isLoading } = trpc.userApis.getMyLibrary.useQuery();
  const removeMutation = trpc.userApis.removeFromLibrary.useMutation({
    onSuccess: () => utils.userApis.getMyLibrary.invalidate(),
  });
  const { data: exportData } = trpc.userApis.exportLibrary.useQuery();

  const handleExport = () => {
    if (!exportData) return;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-api-library.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Library</h1>
          <p className="text-muted-foreground mt-1">
            {library?.length ?? 0} APIs saved
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!exportData?.length}>
            <Download className="h-4 w-4 mr-1" />
            Export JSON
          </Button>
          <Button size="sm" asChild>
            <Link href="/apis">
              <Plus className="h-4 w-4 mr-1" />
              Add APIs
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !library?.length ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No APIs saved yet.</p>
          <Button asChild>
            <Link href="/apis">Browse the catalog</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {library.map((ua) => {
            const pct =
              ua.customThreshold && ua.usageCount !== null
                ? Math.min((ua.usageCount / ua.customThreshold) * 100, 100)
                : null;

            return (
              <Card key={ua.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Link
                          href={`/apis/${ua.api?.slug}`}
                          className="hover:underline"
                        >
                          {ua.api?.name}
                        </Link>
                        <Badge variant="secondary" className="text-xs">
                          {ua.api?.category}
                        </Badge>
                      </CardTitle>
                      {ua.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {ua.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {ua.api?.docsUrl && (
                        <Button variant="ghost" size="icon" asChild className="h-7 w-7">
                          <a href={ua.api.docsUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setEditDialogApi(ua)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setLogDialogApi(ua)}
                      >
                        Log usage
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() =>
                          removeMutation.mutate({ userApiId: ua.id })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Usage:{' '}
                      <strong className="text-foreground">
                        {ua.usageCount ?? 0}
                        {ua.customThreshold ? ` / ${ua.customThreshold}` : ''} calls
                      </strong>
                    </span>
                    {ua.lastUsed && (
                      <span className="text-muted-foreground text-xs">
                        Last used: {new Date(ua.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {pct !== null && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 80 ? 'bg-amber-500' : 'bg-primary'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pct.toFixed(0)}% of limit used
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {logDialogApi && (
        <UsageLogDialog
          userApi={logDialogApi}
          open={!!logDialogApi}
          onClose={() => setLogDialogApi(null)}
        />
      )}
      {editDialogApi && (
        <EditNotesDialog
          userApi={editDialogApi}
          open={!!editDialogApi}
          onClose={() => setEditDialogApi(null)}
        />
      )}
    </div>
  );
}
