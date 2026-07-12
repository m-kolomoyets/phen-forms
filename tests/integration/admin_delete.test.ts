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

const seedQuestionnaire = async (pool: Pool, ownerId: string, status: 'draft' | 'published' | 'closed' = 'draft') => {
    const { rows } = await pool.query<{ id: string }>(
        `insert into public.questionnaires (owner_id, title, status) values ($1, 'Q', $2) returning id`,
        [ownerId, status]
    );

    return rows[0].id;
};

const deleteAs = (pool: Pool, sub: string, questionnaireId: string) => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rowCount } = await client.query('delete from public.questionnaires where id = $1', [questionnaireId]);

        return rowCount;
    });
};

const exists = async (pool: Pool, questionnaireId: string) => {
    const { rowCount } = await pool.query('select 1 from public.questionnaires where id = $1', [questionnaireId]);

    return rowCount === 1;
};

describe.skipIf(!hasTestDb)('admin deletes questionnaires', () => {
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

    it('lets an admin delete a questionnaire they do not own', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        await makeAdmin(pool, admin);
        const q = await seedQuestionnaire(pool, owner);

        const deleted = await deleteAs(pool, admin, q);

        expect(deleted).toBe(1);
        expect(await exists(pool, q)).toBe(false);
    });

    it('lets an admin delete even a published questionnaire that has responses', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        await makeAdmin(pool, admin);
        const q = await seedQuestionnaire(pool, owner, 'published');
        await pool.query('insert into public.responses (questionnaire_id) values ($1)', [q]);

        const deleted = await deleteAs(pool, admin, q);

        expect(deleted).toBe(1);
        expect(await exists(pool, q)).toBe(false);
    });

    it('does not let a non-admin delete a questionnaire they do not own', async () => {
        const stranger = await createUser(pool, `stranger-${next()}@test.dev`);
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        const q = await seedQuestionnaire(pool, owner);

        const deleted = await deleteAs(pool, stranger, q);

        expect(deleted).toBe(0);
        expect(await exists(pool, q)).toBe(true);
    });

    it('still blocks an owner from deleting a live published questionnaire with responses', async () => {
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        const q = await seedQuestionnaire(pool, owner, 'published');
        await pool.query('insert into public.responses (questionnaire_id) values ($1)', [q]);

        const deleted = await deleteAs(pool, owner, q);

        expect(deleted).toBe(0);
        expect(await exists(pool, q)).toBe(true);
    });
});
