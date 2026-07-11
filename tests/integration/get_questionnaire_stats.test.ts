import type { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createPool, createUser, hasTestDb, resetSchema, runAs } from './db';

// Monotonic counter keeps seeded emails unique without Date.now()/random.
let counter = 0;
const next = () => {
    counter += 1;
    return counter;
};

type QuestionStat = {
    question_id: string;
    prompt: string;
    type: string;
    response_count: number;
    data: unknown;
};

const insertQuestion = async (
    pool: Pool,
    questionnaireId: string,
    type: string,
    position: number,
    config: Record<string, unknown> = {}
) => {
    const { rows } = await pool.query<{ id: string }>(
        `insert into public.questions (questionnaire_id, type, prompt, required, position, config)
         values ($1, $2, $3, false, $4, $5) returning id`,
        [questionnaireId, type, `${type} prompt`, position, config]
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

const submit = (pool: Pool, questionnaireId: string, answers: unknown) => {
    return runAs(pool, 'anon', null, async (client) => {
        await client.query('select public.submit_response($1, $2)', [questionnaireId, JSON.stringify(answers)]);
    });
};

const getStats = (pool: Pool, sub: string | null, questionnaireId: string) => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rows } = await client.query<{ get_questionnaire_stats: QuestionStat[] }>(
            'select public.get_questionnaire_stats($1)',
            [questionnaireId]
        );

        return rows[0].get_questionnaire_stats;
    });
};

// Build a questionnaire with one question of each aggregated type and submit a
// known set of answers so aggregates are deterministic.
const seed = async (pool: Pool) => {
    const ownerId = await createUser(pool, `owner-stats-${next()}@test.dev`);

    const { rows } = await pool.query<{ id: string }>(
        `insert into public.questionnaires (owner_id, title, status, accepting_responses)
         values ($1, 'Stats', 'published', true) returning id`,
        [ownerId]
    );
    const questionnaireId = rows[0].id;

    const singleId = await insertQuestion(pool, questionnaireId, 'single_choice', 0);
    const sA = await insertOption(pool, singleId, 'A', 0);
    const sB = await insertOption(pool, singleId, 'B', 1);

    const multiId = await insertQuestion(pool, questionnaireId, 'multiple_choice', 1, { allow_other: true });
    const mX = await insertOption(pool, multiId, 'X', 0);
    const mY = await insertOption(pool, multiId, 'Y', 1);

    const rankId = await insertQuestion(pool, questionnaireId, 'ranking', 2);
    const r1 = await insertOption(pool, rankId, 'First', 0);
    const r2 = await insertOption(pool, rankId, 'Second', 1);

    const scaleId = await insertQuestion(pool, questionnaireId, 'opinion_scale', 3, { scale_min: 1, scale_max: 5 });
    const yesNoId = await insertQuestion(pool, questionnaireId, 'yes_no', 4);
    const textId = await insertQuestion(pool, questionnaireId, 'short_text', 5);

    // Response 1
    await submit(pool, questionnaireId, [
        { question_id: singleId, value_options: [sA] },
        { question_id: multiId, value_options: [mX, mY] },
        { question_id: rankId, value_options: [r1, r2] },
        { question_id: scaleId, value_number: 2 },
        { question_id: yesNoId, value_text: 'yes' },
        { question_id: textId, value_text: 'hello' },
    ]);

    // Response 2
    await submit(pool, questionnaireId, [
        { question_id: singleId, value_options: [sA] },
        { question_id: multiId, value_options: [mX], value_text: 'custom' },
        { question_id: rankId, value_options: [r2, r1] },
        { question_id: scaleId, value_number: 4 },
        { question_id: yesNoId, value_text: 'no' },
        { question_id: textId, value_text: 'world' },
    ]);

    return { ownerId, questionnaireId, ids: { singleId, sA, sB, multiId, mX, mY, rankId, r1, r2 } };
};

const byType = (stats: QuestionStat[], type: string) => {
    const stat = stats.find((entry) => {
        return entry.type === type;
    });

    if (!stat) {
        throw new Error(`missing stat for ${type}`);
    }

    return stat;
};

describe.skipIf(!hasTestDb)('get_questionnaire_stats RPC', () => {
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

    it('aggregates single_choice option counts', async () => {
        const { ownerId, questionnaireId, ids } = await seed(pool);

        const stats = await getStats(pool, ownerId, questionnaireId);
        const single = byType(stats, 'single_choice');

        expect(single.response_count).toBe(2);

        const data = single.data as { option_id: string; label: string; count: number | null }[];
        const a = data.find((option) => {
            return option.option_id === ids.sA;
        });
        const b = data.find((option) => {
            return option.option_id === ids.sB;
        });

        expect(a?.count).toBe(2);
        expect(b?.count ?? 0).toBe(0);
    });

    it('aggregates multiple_choice counts and surfaces other text', async () => {
        const { ownerId, questionnaireId, ids } = await seed(pool);

        const stats = await getStats(pool, ownerId, questionnaireId);
        const multi = byType(stats, 'multiple_choice');
        const data = multi.data as {
            options: { option_id: string; count: number | null }[];
            other: string[];
        };

        const x = data.options.find((option) => {
            return option.option_id === ids.mX;
        });
        const y = data.options.find((option) => {
            return option.option_id === ids.mY;
        });

        expect(x?.count).toBe(2);
        expect(y?.count).toBe(1);
        expect(data.other).toContain('custom');
    });

    it('aggregates ranking average rank per item', async () => {
        const { ownerId, questionnaireId, ids } = await seed(pool);

        const stats = await getStats(pool, ownerId, questionnaireId);
        const ranking = byType(stats, 'ranking');
        const data = ranking.data as { option_id: string; avg_rank: number | null }[];

        // r1 ranked 1 then 2 → avg 1.5; r2 ranked 2 then 1 → avg 1.5.
        const first = data.find((option) => {
            return option.option_id === ids.r1;
        });

        expect(Number(first?.avg_rank)).toBeCloseTo(1.5);
    });

    it('aggregates opinion_scale average and distribution', async () => {
        const { ownerId, questionnaireId } = await seed(pool);

        const stats = await getStats(pool, ownerId, questionnaireId);
        const scale = byType(stats, 'opinion_scale');
        const data = scale.data as { average: number | null; distribution: Record<string, number> };

        expect(Number(data.average)).toBeCloseTo(3);
        expect(data.distribution['2']).toBe(1);
        expect(data.distribution['4']).toBe(1);
    });

    it('aggregates yes_no as a two-way split', async () => {
        const { ownerId, questionnaireId } = await seed(pool);

        const stats = await getStats(pool, ownerId, questionnaireId);
        const yesNo = byType(stats, 'yes_no');
        const data = yesNo.data as { yes: number; no: number };

        expect(data.yes).toBe(1);
        expect(data.no).toBe(1);
    });

    it('lists text answers', async () => {
        const { ownerId, questionnaireId } = await seed(pool);

        const stats = await getStats(pool, ownerId, questionnaireId);
        const text = byType(stats, 'short_text');
        const data = text.data as string[];

        expect(data).toContain('hello');
        expect(data).toContain('world');
    });

    it('denies a non-owner', async () => {
        const { questionnaireId } = await seed(pool);
        const otherId = await createUser(pool, `intruder-${next()}@test.dev`);

        await expect(getStats(pool, otherId, questionnaireId)).rejects.toThrow(/not authorized/i);
    });

    it('denies anon (no execute grant)', async () => {
        const { questionnaireId } = await seed(pool);

        await expect(
            runAs(pool, 'anon', null, async (client) => {
                await client.query('select public.get_questionnaire_stats($1)', [questionnaireId]);
            })
        ).rejects.toThrow();
    });
});
