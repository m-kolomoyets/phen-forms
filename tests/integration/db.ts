import type { PoolClient } from 'pg';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

// Integration tests run against a THROWAWAY remote Postgres (a Supabase preview
// branch or disposable project). Set SUPABASE_TEST_DB_URL to its direct postgres
// connection string. Without it, the integration suites skip — `pnpm test` stays
// green in normal dev. NEVER point this at a database holding real data: each run
// drops and recreates the public schema.
export const TEST_DB_URL = process.env.SUPABASE_TEST_DB_URL;

export const hasTestDb = Boolean(TEST_DB_URL);

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../supabase/migrations');

export type Role = 'anon' | 'authenticated';

export const createPool = () => {
    if (!TEST_DB_URL) {
        throw new Error('SUPABASE_TEST_DB_URL is not set');
    }

    return new Pool({ connectionString: TEST_DB_URL, max: 4 });
};

const readMigrations = () => {
    return readdirSync(MIGRATIONS_DIR)
        .filter((name) => {
            return name.endsWith('.sql');
        })
        .sort()
        .map((name) => {
            return readFileSync(join(MIGRATIONS_DIR, name), 'utf8');
        });
};

// Rebuild the schema from scratch: drop public, recreate, replay every migration
// in filename order, then grant table privileges to the anon/authenticated roles
// exactly as Supabase does in production — RLS (not GRANTs) enforces row access,
// so the roles need table privileges for the policy filters to be exercised.
export const resetSchema = async (pool: Pool) => {
    const migrations = readMigrations();

    await pool.query('drop schema if exists public cascade');
    await pool.query('create schema public');
    await pool.query('grant usage on schema public to anon, authenticated, service_role');
    await pool.query('grant all on schema public to postgres');

    for (const sql of migrations) {
        await pool.query(sql);
    }

    await pool.query('grant all on all tables in schema public to anon, authenticated');
    await pool.query('grant all on all sequences in schema public to anon, authenticated');
    await pool.query('grant execute on all functions in schema public to anon, authenticated');
};

// Run `fn` inside a transaction as a given RLS role. `sub` becomes auth.uid().
// Commits on success so inserts persist for later assertions; rolls back on throw.
export const runAs = async <T>(
    pool: Pool,
    role: Role,
    sub: string | null,
    fn: (client: PoolClient) => Promise<T>
): Promise<T> => {
    const client = await pool.connect();

    try {
        await client.query('begin');
        await client.query(`set local role ${role}`);
        await client.query('select set_config($1, $2, true)', [
            'request.jwt.claims',
            JSON.stringify(sub ? { sub, role } : { role }),
        ]);

        const result = await fn(client);

        await client.query('commit');

        return result;
    } catch (error) {
        await client.query('rollback');
        throw error;
    } finally {
        client.release();
    }
};

// Create an auth user (the on_auth_user_created trigger mirrors it into
// public.users). Runs as the connection role (postgres) which owns the tables and
// therefore bypasses RLS. Returns the new user id.
export const createUser = async (pool: Pool, email: string): Promise<string> => {
    const { rows } = await pool.query<{ id: string }>(
        'insert into auth.users (id, email) values (gen_random_uuid(), $1) returning id',
        [email]
    );

    return rows[0].id;
};
