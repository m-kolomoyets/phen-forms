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

// How many public.users rows the given caller can SELECT under RLS.
const visibleUserIds = (pool: Pool, sub: string) => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rows } = await client.query<{ id: string }>('select id from public.users');

        return rows.map((row) => {
            return row.id;
        });
    });
};

describe.skipIf(!hasTestDb)('admin user visibility', () => {
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

    it('lets an admin read every user row', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const a = await createUser(pool, `a-${next()}@test.dev`);
        const b = await createUser(pool, `b-${next()}@test.dev`);
        await makeAdmin(pool, admin);

        const visible = await visibleUserIds(pool, admin);

        expect(visible).toEqual(expect.arrayContaining([admin, a, b]));
        expect(visible).toHaveLength(3);
    });

    it('keeps a regular user scoped to only their own row', async () => {
        const regular = await createUser(pool, `regular-${next()}@test.dev`);
        await createUser(pool, `stranger-${next()}@test.dev`);

        const visible = await visibleUserIds(pool, regular);

        expect(visible).toEqual([regular]);
    });

    it('still exposes co-shared collaborators to a regular user (existing policy unchanged)', async () => {
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        const collabEmail = `collab-${next()}@test.dev`;
        const collab = await createUser(pool, collabEmail);
        await createUser(pool, `unrelated-${next()}@test.dev`);

        const { rows } = await pool.query<{ id: string }>(
            `insert into public.questionnaires (owner_id, title) values ($1, 'Co-share') returning id`,
            [owner]
        );
        await runAs(pool, 'authenticated', owner, async (client) => {
            await client.query('select public.share_questionnaire($1, $2, $3)', [rows[0].id, collabEmail, 'viewer']);
        });

        const ownerSees = await visibleUserIds(pool, owner);

        expect(ownerSees).toEqual(expect.arrayContaining([owner, collab]));
        expect(ownerSees).toHaveLength(2);
    });
});
