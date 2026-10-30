import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const snapshots = sqliteTable('snapshots', {
  id: text('id').primaryKey(),
  owner: text('owner').notNull(),
  title: text('title').notNull(),
  payload: text('payload').notNull(),
  created: integer('created').notNull(),
});
