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

const seedQuestionnaire = async (pool: Pool, ownerId: string, title: string) => {
    const { rows } = await pool.query<{ id: string }>(
        `insert into public.questionnaires (owner_id, title) values ($1, $2) returning id`,
        [ownerId, title]
    );

    return rows[0].id;
};

const myAccess = (pool: Pool, sub: string, questionnaireId: string) => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rows } = await client.query<{ my_access: string | null }>('select public.my_access($1) as my_access', [
            questionnaireId,
        ]);

        return rows[0].my_access;
    });
};

describe.skipIf(!hasTestDb)('admin edits', () => {
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

    it('lets an admin update a questionnaire they do not own', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        await makeAdmin(pool, admin);
        const q = await seedQuestionnaire(pool, owner, 'Original');

        const updated = await runAs(pool, 'authenticated', admin, async (client) => {
            const { rowCount } = await client.query('update public.questionnaires set title = $2 where id = $1', [
                q,
                'Edited by admin',
            ]);

            return rowCount;
        });

        expect(updated).toBe(1);

        const { rows } = await pool.query<{ title: string }>('select title from public.questionnaires where id = $1', [
            q,
        ]);
        expect(rows[0].title).toBe('Edited by admin');
    });

    it('does not let a non-admin update a questionnaire they do not own', async () => {
        const stranger = await createUser(pool, `stranger-${next()}@test.dev`);
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        const q = await seedQuestionnaire(pool, owner, 'Original');

        const updated = await runAs(pool, 'authenticated', stranger, async (client) => {
            const { rowCount } = await client.query('update public.questionnaires set title = $2 where id = $1', [
                q,
                'Hacked',
            ]);

            return rowCount;
        });

        expect(updated).toBe(0);
    });

    it('pins ownership — an admin UPDATE cannot reassign owner_id', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        await makeAdmin(pool, admin);
        const q = await seedQuestionnaire(pool, owner, 'Owned');

        await expect(
            runAs(pool, 'authenticated', admin, async (client) => {
                await client.query('update public.questionnaires set owner_id = $2 where id = $1', [q, admin]);
            })
        ).rejects.toThrow();
    });

    it('lets an admin write questions and options on a foreign questionnaire', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        await makeAdmin(pool, admin);
        const q = await seedQuestionnaire(pool, owner, 'Q');

        const inserted = await runAs(pool, 'authenticated', admin, async (client) => {
            const question = await client.query<{ id: string }>(
                `insert into public.questions (questionnaire_id, type, prompt, position)
                 values ($1, 'single_choice', 'Pick', 0) returning id`,
                [q]
            );
            await client.query(
                `insert into public.question_options (question_id, label, position) values ($1, $2, 0)`,
                [question.rows[0].id, 'Option A']
            );

            return question.rows[0].id;
        });

        expect(inserted).toBeTruthy();
    });

    it('my_access returns admin only as a fallback, real role first', async () => {
        const adminEmail = `admin-${next()}@test.dev`;
        const admin = await createUser(pool, adminEmail);
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        await makeAdmin(pool, admin);

        const foreign = await seedQuestionnaire(pool, owner, 'Foreign');
        const adminOwn = await seedQuestionnaire(pool, admin, 'AdminOwn');

        // Admin is also an editor on a third questionnaire.
        const asEditor = await seedQuestionnaire(pool, owner, 'AsEditor');
        await runAs(pool, 'authenticated', owner, async (client) => {
            await client.query('select public.share_questionnaire($1, $2, $3)', [asEditor, adminEmail, 'editor']);
        });

        expect(await myAccess(pool, admin, foreign)).toBe('admin');
        expect(await myAccess(pool, admin, adminOwn)).toBe('owner');
        expect(await myAccess(pool, admin, asEditor)).toBe('editor');
    });
});
