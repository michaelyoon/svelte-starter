import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../drizzle/schema';
import { env } from '$env/dynamic/private';
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const client = postgres(env.DATABASE_URL);

// Specify the schema, which is required for `db.query` to work, and
// 'snake_case' casing, to map camelCase prop names to snake_case
// column names automatically.
export const db = drizzle(client, { schema, casing: 'snake_case' });
