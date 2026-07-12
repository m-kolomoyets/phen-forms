import type { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createPool, createUser, hasTestDb, resetSchema, runAs } from './db';

let seq = 0;
const next = () => {
    seq += 1;

    return seq;
};

// Grant admin the same way the operator does in production: a direct insert
// (runs as the connection role, which owns the table and bypasses RLS).
const makeAdmin = async (pool: Pool, userId: string) => {
    await pool.query('insert into public.admin_users (user_id) values ($1)', [userId]);
};

const amIAdmin = (pool: Pool, sub: string | null) => {
    return runAs(pool, sub ? 'authenticated' : 'anon', sub, async (client) => {
        const { rows } = await client.query<{ am_i_admin: boolean }>('select public.am_i_admin() as am_i_admin');

        return rows[0].am_i_admin;
    });
};

const isAdmin = (pool: Pool, sub: string) => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rows } = await client.query<{ is_admin: boolean }>('select public.is_admin() as is_admin');

        return rows[0].is_admin;
    });
};

describe.skipIf(!hasTestDb)('admin identity', () => {
    let pool: Pool;

    beforeAll(() => {
        pool = createPool();
    });

    afterAll(async () => {
        await pool.end();
    });

    beforeEach(async () => {
        await resetSchema(pool);
    });

    it('reports true for an admin and false for a non-admin', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const regular = await createUser(pool, `regular-${next()}@test.dev`);
        await makeAdmin(pool, admin);

        expect(await isAdmin(pool, admin)).toBe(true);
        expect(await amIAdmin(pool, admin)).toBe(true);

        expect(await isAdmin(pool, regular)).toBe(false);
        expect(await amIAdmin(pool, regular)).toBe(false);
    });

    it('reports false for an anonymous caller', async () => {
        expect(await amIAdmin(pool, null)).toBe(false);
    });

    it('never exposes admin_users rows to a client (probe returns zero rows)', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        await makeAdmin(pool, admin);

        const count = await runAs(pool, 'authenticated', admin, async (client) => {
            const { rows } = await client.query<{ count: string }>('select count(*) from public.admin_users');

            return rows[0].count;
        });

        expect(count).toBe('0');
    });
});
