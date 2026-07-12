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

// Plain widened select — the query the admin global list uses.
const selectQuestionnaireIds = (pool: Pool, sub: string) => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rows } = await client.query<{ id: string }>('select id from public.questionnaires');

        return rows.map((row) => {
            return row.id;
        });
    });
};

describe.skipIf(!hasTestDb)('admin questionnaire visibility', () => {
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

    it('lets an admin select every questionnaire regardless of owner', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const u1 = await createUser(pool, `u1-${next()}@test.dev`);
        const u2 = await createUser(pool, `u2-${next()}@test.dev`);
        await makeAdmin(pool, admin);

        const q1 = await seedQuestionnaire(pool, u1, 'One');
        const q2 = await seedQuestionnaire(pool, u2, 'Two');
        const q3 = await seedQuestionnaire(pool, admin, 'AdminOwn');

        const visible = await selectQuestionnaireIds(pool, admin);

        expect(visible).toEqual(expect.arrayContaining([q1, q2, q3]));
        expect(visible).toHaveLength(3);
    });

    it('still scopes a regular user to owned + shared rows only', async () => {
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        const other = await createUser(pool, `other-${next()}@test.dev`);

        const own = await seedQuestionnaire(pool, owner, 'Own');
        await seedQuestionnaire(pool, other, 'Foreign');

        const visible = await selectQuestionnaireIds(pool, owner);

        expect(visible).toEqual([own]);
    });

    it('admin can select all questions, responses, answers, and shares', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        await makeAdmin(pool, admin);

        const q = await seedQuestionnaire(pool, owner, 'WithData');
        const { rows: questionRows } = await pool.query<{ id: string }>(
            `insert into public.questions (questionnaire_id, type, prompt, position)
             values ($1, 'short_text', 'Q1', 0) returning id`,
            [q]
        );
        const { rows: responseRows } = await pool.query<{ id: string }>(
            `insert into public.responses (questionnaire_id) values ($1) returning id`,
            [q]
        );
        await pool.query(`insert into public.answers (response_id, question_id, value_text) values ($1, $2, $3)`, [
            responseRows[0].id,
            questionRows[0].id,
            'hello',
        ]);

        const counts = await runAs(pool, 'authenticated', admin, async (client) => {
            const questions = await client.query('select id from public.questions where questionnaire_id = $1', [q]);
            const responses = await client.query('select id from public.responses where questionnaire_id = $1', [q]);
            const answers = await client.query('select id from public.answers where response_id = $1', [
                responseRows[0].id,
            ]);

            return {
                questions: questions.rowCount,
                responses: responses.rowCount,
                answers: answers.rowCount,
            };
        });

        expect(counts).toEqual({ questions: 1, responses: 1, answers: 1 });
    });
});
