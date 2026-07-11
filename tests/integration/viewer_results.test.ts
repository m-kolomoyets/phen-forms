import type { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createPool, createUser, hasTestDb, resetSchema, runAs } from './db';

let seq = 0;
const next = () => {
    seq += 1;

    return seq;
};

// A published questionnaire with one text question and one submitted response.
const seed = async (pool: Pool) => {
    const ownerId = await createUser(pool, `owner-view-${next()}@test.dev`);

    const { rows: qRows } = await pool.query<{ id: string }>(
        `insert into public.questionnaires (owner_id, title, status, accepting_responses)
         values ($1, 'View', 'published', true) returning id`,
        [ownerId]
    );
    const questionnaireId = qRows[0].id;

    const { rows: questionRows } = await pool.query<{ id: string }>(
        `insert into public.questions (questionnaire_id, type, prompt, position)
         values ($1, 'short_text', 'Q', 0) returning id`,
        [questionnaireId]
    );
    const questionId = questionRows[0].id;

    await runAs(pool, 'anon', null, async (client) => {
        await client.query('select public.submit_response($1, $2)', [
            questionnaireId,
            JSON.stringify([{ question_id: questionId, value_text: 'hi' }]),
        ]);
    });

    return { ownerId, questionnaireId };
};

const shareWith = (pool: Pool, questionnaireId: string, userId: string, canEdit: boolean) => {
    return pool.query(
        `insert into public.questionnaire_shares (questionnaire_id, user_id, can_edit, can_view_responses)
         values ($1, $2, $3, true)`,
        [questionnaireId, userId, canEdit]
    );
};

const countResponses = (pool: Pool, sub: string, questionnaireId: string) => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rows } = await client.query<{ count: string }>(
            `select count(*)::int as count from public.responses where questionnaire_id = $1`,
            [questionnaireId]
        );

        return Number(rows[0].count);
    });
};

const countAnswers = (pool: Pool, sub: string, questionnaireId: string) => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rows } = await client.query<{ count: string }>(
            `select count(*)::int as count
             from public.answers a
             join public.responses r on r.id = a.response_id
             where r.questionnaire_id = $1`,
            [questionnaireId]
        );

        return Number(rows[0].count);
    });
};

const getStats = (pool: Pool, sub: string | null, questionnaireId: string) => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rows } = await client.query('select public.get_questionnaire_stats($1)', [questionnaireId]);

        return rows[0].get_questionnaire_stats as unknown[];
    });
};

describe.skipIf(!hasTestDb)('viewer results (RLS read + stats access)', () => {
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

    it('a viewer can read responses and answers', async () => {
        const { questionnaireId } = await seed(pool);
        const viewer = await createUser(pool, `viewer-${next()}@test.dev`);
        await shareWith(pool, questionnaireId, viewer, false);

        expect(await countResponses(pool, viewer, questionnaireId)).toBe(1);
        expect(await countAnswers(pool, viewer, questionnaireId)).toBe(1);
    });

    it('an editor can read responses and answers', async () => {
        const { questionnaireId } = await seed(pool);
        const editor = await createUser(pool, `editor-${next()}@test.dev`);
        await shareWith(pool, questionnaireId, editor, true);

        expect(await countResponses(pool, editor, questionnaireId)).toBe(1);
        expect(await countAnswers(pool, editor, questionnaireId)).toBe(1);
    });

    it('a stranger cannot read responses', async () => {
        const { questionnaireId } = await seed(pool);
        const stranger = await createUser(pool, `stranger-${next()}@test.dev`);

        expect(await countResponses(pool, stranger, questionnaireId)).toBe(0);
        expect(await countAnswers(pool, stranger, questionnaireId)).toBe(0);
    });

    it('a viewer can load the stats RPC', async () => {
        const { questionnaireId } = await seed(pool);
        const viewer = await createUser(pool, `viewer-stats-${next()}@test.dev`);
        await shareWith(pool, questionnaireId, viewer, false);

        const stats = await getStats(pool, viewer, questionnaireId);

        expect(Array.isArray(stats)).toBe(true);
        expect(stats).toHaveLength(1);
    });

    it('a stranger is denied the stats RPC', async () => {
        const { questionnaireId } = await seed(pool);
        const stranger = await createUser(pool, `stranger-stats-${next()}@test.dev`);

        await expect(getStats(pool, stranger, questionnaireId)).rejects.toThrow(/not authorized/i);
    });
});
