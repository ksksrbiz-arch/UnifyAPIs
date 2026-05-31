import { pgTable, uuid, text, boolean, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const apis = pgTable('apis', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  freeTier: text('free_tier'),
  requiresKey: boolean('requires_key').default(false),
  docsUrl: text('docs_url'),
  baseUrl: text('base_url'),
  exampleEndpoint: text('example_endpoint'),
  healthScore: integer('health_score').default(80),
  lastChecked: timestamp('last_checked'),
  tags: jsonb('tags').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userApis = pgTable('user_apis', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  apiId: uuid('api_id').notNull().references(() => apis.id, { onDelete: 'cascade' }),
  usageCount: integer('usage_count').default(0),
  customThreshold: integer('custom_threshold'),
  notes: text('notes'),
  tags: jsonb('tags').$type<string[]>().default([]),
  addedAt: timestamp('added_at').defaultNow(),
  lastUsed: timestamp('last_used'),
});

export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userApiId: uuid('user_api_id').references(() => userApis.id, { onDelete: 'cascade' }),
  callsMade: integer('calls_made').notNull(),
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),
  source: text('source').default('manual'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const apisRelations = relations(apis, ({ many }) => ({
  userApis: many(userApis),
}));

export const userApisRelations = relations(userApis, ({ one, many }) => ({
  api: one(apis, { fields: [userApis.apiId], references: [apis.id] }),
  usageLogs: many(usageLogs),
}));

export const usageLogsRelations = relations(usageLogs, ({ one }) => ({
  userApi: one(userApis, { fields: [usageLogs.userApiId], references: [userApis.id] }),
}));
