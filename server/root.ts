import { createTRPCRouter } from '@/lib/trpc/server';
import { apisRouter } from './routers/apis';
import { userApisRouter } from './routers/userApis';
import { aiRouter } from './routers/ai';

export const appRouter = createTRPCRouter({
  apis: apisRouter,
  userApis: userApisRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
