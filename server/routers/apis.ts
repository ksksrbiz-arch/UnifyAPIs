import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { apis } from '@/db/schema';
import { eq, ilike, or, sql } from 'drizzle-orm';

export const apisRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        requiresKey: z.boolean().optional(),
        tag: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.apis.findMany({
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
        where: (apis, { eq, and }) => {
          const conditions = [];
          if (input?.category) {
            conditions.push(eq(apis.category, input.category));
          }
          if (input?.requiresKey !== undefined) {
            conditions.push(eq(apis.requiresKey, input.requiresKey));
          }
          if (conditions.length === 0) return undefined;
          return and(...conditions);
        },
        orderBy: (apis, { desc }) => [desc(apis.healthScore)],
      });
      return rows;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const api = await ctx.db.query.apis.findFirst({
        where: (apis, { eq }) => eq(apis.slug, input.slug),
      });
      if (!api) return null;
      return api;
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const term = `%${input.query}%`;
      const rows = await ctx.db
        .select()
        .from(apis)
        .where(
          or(
            ilike(apis.name, term),
            ilike(apis.description, term),
            ilike(apis.category, term)
          )
        )
        .limit(input.limit);
      return rows;
    }),

  getCategories: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .selectDistinct({ category: apis.category })
      .from(apis)
      .orderBy(apis.category);
    return rows.map((r) => r.category);
  }),
});
