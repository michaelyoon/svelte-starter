import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../drizzle/schema';
import { env } from '$env/dynamic/private';
import type { PgDatabase, PgQueryResultHKT, PgTransaction } from 'drizzle-orm/pg-core';
import type { ExtractTablesWithRelations } from 'drizzle-orm';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export type Transaction = PgTransaction<
	PgQueryResultHKT,
	typeof schema,
	ExtractTablesWithRelations<typeof schema>
>;

const client = postgres(env.DATABASE_URL);

// Specify the schema, which is required for `db.query` to work, and
// 'snake_case' casing, to map camelCase prop names to snake_case
// column names automatically.
export const db = drizzle(client, { schema, casing: 'snake_case' });
