import type { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createPool, createUser, hasTestDb, resetSchema, runAs } from './db';

let seq = 0;
const next = () => {
    seq += 1;

    return seq;
};

const makeAdmin = async (pool: Pool, userId: string) => {
    await pool.query('insert into public.admin_users (user_id) values ($1)', [userId]);
};

type Row = { id: string; isAdmin: boolean };

const listUsers = (pool: Pool, sub: string) => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rows } = await client.query<{ admin_list_users: Row }>(
            'select public.admin_list_users() as admin_list_users'
        );

        return rows.map((row) => {
            return row.admin_list_users;
        });
    });
};

describe.skipIf(!hasTestDb)('admin_list_users RPC', () => {
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

    it('returns every user with a correct isAdmin flag for an admin caller', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const regular = await createUser(pool, `regular-${next()}@test.dev`);
        await makeAdmin(pool, admin);

        const rows = await listUsers(pool, admin);
        const byId = new Map(
            rows.map((row) => {
                return [row.id, row.isAdmin];
            })
        );

        expect(rows).toHaveLength(2);
        expect(byId.get(admin)).toBe(true);
        expect(byId.get(regular)).toBe(false);
    });

    it('returns nothing to a non-admin caller', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const regular = await createUser(pool, `regular-${next()}@test.dev`);
        await makeAdmin(pool, admin);

        const rows = await listUsers(pool, regular);

        expect(rows).toEqual([]);
    });
});
