import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { apis, userApis } from '@/db/schema';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { getTableColumns } from 'drizzle-orm';

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

  count: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        requiresKey: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input?.category) conditions.push(eq(apis.category, input.category));
      if (input?.requiresKey !== undefined)
        conditions.push(eq(apis.requiresKey, input.requiresKey));
      const where = conditions.length ? and(...conditions) : undefined;
      const [row] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(apis)
        .where(where);
      return row?.count ?? 0;
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
        category: z.string().optional(),
        requiresKey: z.boolean().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const term = `%${input.query}%`;
      const conditions = [
        or(
          ilike(apis.name, term),
          ilike(apis.description, term),
          ilike(apis.category, term)
        ),
      ];
      if (input.category) conditions.push(eq(apis.category, input.category));
      if (input.requiresKey !== undefined)
        conditions.push(eq(apis.requiresKey, input.requiresKey));

      const rows = await ctx.db
        .select()
        .from(apis)
        .where(and(...conditions))
        .orderBy(desc(apis.healthScore))
        .limit(input.limit)
        .offset(input.offset);
      return rows;
    }),

  getCategories: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .selectDistinct({ category: apis.category })
      .from(apis)
      .orderBy(apis.category);
    return rows.map((r) => r.category);
  }),

  getPopular: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(6),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 6;
      const saveCount = sql<number>`count(${userApis.id})::int`.as('save_count');
      const rows = await ctx.db
        .select({
          ...getTableColumns(apis),
          saveCount,
        })
        .from(apis)
        .leftJoin(userApis, eq(userApis.apiId, apis.id))
        .groupBy(apis.id)
        .orderBy(desc(saveCount), desc(apis.healthScore))
        .limit(limit);
      return rows;
    }),
});
