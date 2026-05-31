import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { userApis, usageLogs, apis } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const userApisRouter = createTRPCRouter({
  getMyLibrary: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const rows = await ctx.db.query.userApis.findMany({
      where: (ua, { eq }) => eq(ua.userId, userId),
      with: { api: true },
      orderBy: (ua, { desc }) => [desc(ua.addedAt)],
    });
    return rows;
  }),

  addToLibrary: protectedProcedure
    .input(
      z.object({
        apiId: z.string().uuid(),
        notes: z.string().optional(),
        customThreshold: z.number().int().nonnegative().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.db.query.userApis.findFirst({
        where: (ua, { eq, and }) =>
          and(eq(ua.userId, userId), eq(ua.apiId, input.apiId)),
      });

      if (existing) return existing;

      const [row] = await ctx.db
        .insert(userApis)
        .values({
          userId,
          apiId: input.apiId,
          notes: input.notes,
          customThreshold: input.customThreshold,
        })
        .returning();

      return row;
    }),

  updateUsage: protectedProcedure
    .input(
      z.object({
        userApiId: z.string().uuid(),
        callsMade: z.number().int().nonnegative(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const userApi = await ctx.db.query.userApis.findFirst({
        where: (ua, { eq, and }) =>
          and(eq(ua.id, input.userApiId), eq(ua.userId, userId)),
      });

      if (!userApi) throw new TRPCError({ code: 'NOT_FOUND', message: 'User API not found in your library' });

      await ctx.db
        .update(userApis)
        .set({
          usageCount: (userApi.usageCount ?? 0) + input.callsMade,
          lastUsed: new Date(),
        })
        .where(eq(userApis.id, input.userApiId));

      await ctx.db.insert(usageLogs).values({
        userApiId: input.userApiId,
        callsMade: input.callsMade,
        source: 'manual',
      });

      return { success: true };
    }),

  updateNotes: protectedProcedure
    .input(
      z.object({
        userApiId: z.string().uuid(),
        notes: z.string(),
        customThreshold: z.number().int().nonnegative().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.db
        .update(userApis)
        .set({ notes: input.notes, customThreshold: input.customThreshold })
        .where(
          and(eq(userApis.id, input.userApiId), eq(userApis.userId, userId))
        );
      return { success: true };
    }),

  removeFromLibrary: protectedProcedure
    .input(z.object({ userApiId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.db
        .delete(userApis)
        .where(
          and(eq(userApis.id, input.userApiId), eq(userApis.userId, userId))
        );
      return { success: true };
    }),

  exportLibrary: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const rows = await ctx.db.query.userApis.findMany({
      where: (ua, { eq }) => eq(ua.userId, userId),
      with: { api: true },
    });
    return rows;
  }),
});
