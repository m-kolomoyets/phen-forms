import type { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createPool, createUser, hasTestDb, resetSchema, runAs } from './db';

type Ids = {
    ownerId: string;
    questionnaireId: string;
    singleId: string; // single_choice, required
    optA: string;
    optB: string;
    scaleId: string; // opinion_scale 1..5, optional
    yesNoId: string; // yes_no, optional
    otherSingleId: string; // a second single_choice (its option is "foreign" to `singleId`)
    otherOpt: string;
};

type SeedOptions = {
    status?: 'draft' | 'published' | 'closed';
    accepting?: boolean;
};

const insertQuestion = async (
    pool: Pool,
    questionnaireId: string,
    type: string,
    position: number,
    required: boolean,
    config: Record<string, unknown>
) => {
    const { rows } = await pool.query<{ id: string }>(
        `insert into public.questions (questionnaire_id, type, prompt, required, position, config)
         values ($1, $2, $3, $4, $5, $6) returning id`,
        [questionnaireId, type, `${type} prompt`, required, position, config]
    );

    return rows[0].id;
};

const insertOption = async (pool: Pool, questionId: string, label: string, position: number) => {
    const { rows } = await pool.query<{ id: string }>(
        `insert into public.question_options (question_id, label, position) values ($1, $2, $3) returning id`,
        [questionId, label, position]
    );

    return rows[0].id;
};

// Build a full published (by default) questionnaire owned by a fresh user.
const seed = async (pool: Pool, options: SeedOptions = {}): Promise<Ids> => {
    const status = options.status ?? 'published';
    const accepting = options.accepting ?? true;

    const ownerId = await createUser(pool, `owner-${status}-${accepting}-${position()}@test.dev`);

    const { rows } = await pool.query<{ id: string }>(
        `insert into public.questionnaires (owner_id, title, status, accepting_responses)
         values ($1, 'T', $2, $3) returning id`,
        [ownerId, status, accepting]
    );
    const questionnaireId = rows[0].id;

    const singleId = await insertQuestion(pool, questionnaireId, 'single_choice', 0, true, {});
    const optA = await insertOption(pool, singleId, 'A', 0);
    const optB = await insertOption(pool, singleId, 'B', 1);

    const scaleId = await insertQuestion(pool, questionnaireId, 'opinion_scale', 1, false, {
        scale_min: 1,
        scale_max: 5,
    });
    const yesNoId = await insertQuestion(pool, questionnaireId, 'yes_no', 2, false, {});

    const otherSingleId = await insertQuestion(pool, questionnaireId, 'single_choice', 3, false, {});
    const otherOpt = await insertOption(pool, otherSingleId, 'X', 0);

    return { ownerId, questionnaireId, singleId, optA, optB, scaleId, yesNoId, otherSingleId, otherOpt };
};

// Monotonic counter so seeded emails stay unique without Date.now()/random.
let counter = 0;
const position = () => {
    counter += 1;
    return counter;
};

const submit = (pool: Pool, questionnaireId: string, answers: unknown) => {
    return runAs(pool, 'anon', null, async (client) => {
        const { rows } = await client.query<{ submit_response: string }>('select public.submit_response($1, $2)', [
            questionnaireId,
            JSON.stringify(answers),
        ]);

        return rows[0].submit_response;
    });
};

const countResponses = async (pool: Pool, questionnaireId: string) => {
    const { rows } = await pool.query<{ count: string }>(
        'select count(*)::int as count from public.responses where questionnaire_id = $1',
        [questionnaireId]
    );

    return Number(rows[0].count);
};

describe.skipIf(!hasTestDb)('submit_response RPC', () => {
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

    it('inserts 1 response + N answers atomically and returns the id', async () => {
        const s = await seed(pool);

        const responseId = await submit(pool, s.questionnaireId, [
            { question_id: s.singleId, value_options: [s.optA] },
            { question_id: s.scaleId, value_number: 3 },
            { question_id: s.yesNoId, value_text: 'yes' },
        ]);

        expect(responseId).toMatch(/^[0-9a-f-]{36}$/);
        expect(await countResponses(pool, s.questionnaireId)).toBe(1);

        const { rows } = await pool.query<{ count: string }>(
            'select count(*)::int as count from public.answers where response_id = $1',
            [responseId]
        );
        expect(Number(rows[0].count)).toBe(3);
    });

    it('rejects when not accepting responses', async () => {
        const s = await seed(pool, { accepting: false });

        await expect(
            submit(pool, s.questionnaireId, [{ question_id: s.singleId, value_options: [s.optA] }])
        ).rejects.toThrow(/not accepting responses/i);
        expect(await countResponses(pool, s.questionnaireId)).toBe(0);
    });

    it('rejects when not published (draft)', async () => {
        const s = await seed(pool, { status: 'draft' });

        await expect(
            submit(pool, s.questionnaireId, [{ question_id: s.singleId, value_options: [s.optA] }])
        ).rejects.toThrow(/not accepting responses/i);
    });

    it('rejects when a required question is unanswered', async () => {
        const s = await seed(pool);

        await expect(submit(pool, s.questionnaireId, [{ question_id: s.scaleId, value_number: 3 }])).rejects.toThrow(
            /required questions unanswered/i
        );
    });

    it('rejects an option id from another question', async () => {
        const s = await seed(pool);

        await expect(
            submit(pool, s.questionnaireId, [{ question_id: s.singleId, value_options: [s.otherOpt] }])
        ).rejects.toThrow(/does not belong/i);
    });

    it('rejects an out-of-range scale value', async () => {
        const s = await seed(pool);

        await expect(
            submit(pool, s.questionnaireId, [
                { question_id: s.singleId, value_options: [s.optA] },
                { question_id: s.scaleId, value_number: 99 },
            ])
        ).rejects.toThrow(/out of range/i);
    });

    it('rolls back fully on any validation failure', async () => {
        const s = await seed(pool);

        await expect(
            submit(pool, s.questionnaireId, [
                { question_id: s.singleId, value_options: [s.optA] },
                { question_id: s.scaleId, value_number: 99 },
            ])
        ).rejects.toThrow();

        expect(await countResponses(pool, s.questionnaireId)).toBe(0);

        const { rows } = await pool.query<{ count: string }>('select count(*)::int as count from public.answers');
        expect(Number(rows[0].count)).toBe(0);
    });
});

describe.skipIf(!hasTestDb)('responses/answers RLS', () => {
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

    it('anon cannot SELECT responses', async () => {
        const s = await seed(pool);
        await submit(pool, s.questionnaireId, [{ question_id: s.singleId, value_options: [s.optA] }]);

        const visible = await runAs(pool, 'anon', null, async (client) => {
            const { rows } = await client.query('select id from public.responses');
            return rows.length;
        });

        expect(visible).toBe(0);
    });

    it('anon cannot SELECT draft structure', async () => {
        const s = await seed(pool, { status: 'draft' });

        const visible = await runAs(pool, 'anon', null, async (client) => {
            const { rows } = await client.query('select id from public.questions where questionnaire_id = $1', [
                s.questionnaireId,
            ]);
            return rows.length;
        });

        expect(visible).toBe(0);
    });

    it('owner sees only their own responses', async () => {
        const mine = await seed(pool);
        const theirs = await seed(pool);

        await submit(pool, mine.questionnaireId, [{ question_id: mine.singleId, value_options: [mine.optA] }]);
        await submit(pool, theirs.questionnaireId, [{ question_id: theirs.singleId, value_options: [theirs.optA] }]);

        const rows = await runAs(pool, 'authenticated', mine.ownerId, async (client) => {
            const result = await client.query<{ questionnaire_id: string }>(
                'select questionnaire_id from public.responses'
            );
            return result.rows;
        });

        expect(rows).toHaveLength(1);
        expect(rows[0].questionnaire_id).toBe(mine.questionnaireId);
    });
});
