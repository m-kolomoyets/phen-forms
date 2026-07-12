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

const seedQuestionnaire = async (pool: Pool, ownerId: string) => {
    const { rows } = await pool.query<{ id: string }>(
        `insert into public.questionnaires (owner_id, title) values ($1, 'Q') returning id`,
        [ownerId]
    );

    return rows[0].id;
};

const transfer = (pool: Pool, sub: string, questionnaireId: string, newOwnerId: string) => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rows } = await client.query<{ admin_transfer_ownership: string }>(
            'select public.admin_transfer_ownership($1, $2) as admin_transfer_ownership',
            [questionnaireId, newOwnerId]
        );

        return rows[0].admin_transfer_ownership;
    });
};

const ownerOf = async (pool: Pool, questionnaireId: string) => {
    const { rows } = await pool.query<{ owner_id: string }>(
        'select owner_id from public.questionnaires where id = $1',
        [questionnaireId]
    );

    return rows[0].owner_id;
};

const shareExists = async (pool: Pool, questionnaireId: string, userId: string) => {
    const { rowCount } = await pool.query(
        'select 1 from public.questionnaire_shares where questionnaire_id = $1 and user_id = $2',
        [questionnaireId, userId]
    );

    return rowCount === 1;
};

describe.skipIf(!hasTestDb)('admin_transfer_ownership RPC', () => {
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

    it('swaps owner, drops the new owner stale share, and strips old owner access', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const oldOwner = await createUser(pool, `old-${next()}@test.dev`);
        const newOwnerEmail = `new-${next()}@test.dev`;
        const newOwner = await createUser(pool, newOwnerEmail);
        await makeAdmin(pool, admin);

        const q = await seedQuestionnaire(pool, oldOwner);
        // New owner already has a (soon-redundant) share row.
        await runAs(pool, 'authenticated', oldOwner, async (client) => {
            await client.query('select public.share_questionnaire($1, $2, $3)', [q, newOwnerEmail, 'editor']);
        });
        expect(await shareExists(pool, q, newOwner)).toBe(true);

        const status = await transfer(pool, admin, q, newOwner);

        expect(status).toBe('transferred');
        expect(await ownerOf(pool, q)).toBe(newOwner);
        expect(await shareExists(pool, q, newOwner)).toBe(false);

        // Old owner has no share row -> no access (they were the owner, never a sharee).
        expect(await shareExists(pool, q, oldOwner)).toBe(false);
        const oldOwnerAccess = await runAs(pool, 'authenticated', oldOwner, async (client) => {
            const { rows } = await client.query<{ my_access: string | null }>(
                'select public.my_access($1) as my_access',
                [q]
            );

            return rows[0].my_access;
        });
        expect(oldOwnerAccess).toBeNull();
    });

    it('forbids a non-admin caller and leaves ownership unchanged', async () => {
        const stranger = await createUser(pool, `stranger-${next()}@test.dev`);
        const oldOwner = await createUser(pool, `old-${next()}@test.dev`);
        const target = await createUser(pool, `target-${next()}@test.dev`);
        const q = await seedQuestionnaire(pool, oldOwner);

        const status = await transfer(pool, stranger, q, target);

        expect(status).toBe('forbidden');
        expect(await ownerOf(pool, q)).toBe(oldOwner);
    });

    it('returns no_user for an unknown target', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const oldOwner = await createUser(pool, `old-${next()}@test.dev`);
        await makeAdmin(pool, admin);
        const q = await seedQuestionnaire(pool, oldOwner);

        const status = await runAs(pool, 'authenticated', admin, async (client) => {
            const { rows } = await client.query<{ admin_transfer_ownership: string }>(
                'select public.admin_transfer_ownership($1, gen_random_uuid()) as admin_transfer_ownership',
                [q]
            );

            return rows[0].admin_transfer_ownership;
        });

        expect(status).toBe('no_user');
    });
});
