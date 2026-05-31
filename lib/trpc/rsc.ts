import 'server-only';
import { cache } from 'react';
import { appRouter } from '@/server/root';
import { db } from '@/db';

export const getServerTrpc = cache(() => {
  return appRouter.createCaller({ db, session: null });
});
