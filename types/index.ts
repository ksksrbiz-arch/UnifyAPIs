import type { apis, userApis } from '@/db/schema';

export type Api = typeof apis.$inferSelect;
export type UserApi = typeof userApis.$inferSelect & { api: Api };
