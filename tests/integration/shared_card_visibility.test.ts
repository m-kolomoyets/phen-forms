import type { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createPool, createUser, hasTestDb, resetSchema, runAs } from './db';

let seq = 0;
const next = () => {
    seq += 1;

    return seq;
};

const seedQuestionnaire = async (pool: Pool) => {
    const ownerId = await createUser(pool, `owner-card-${next()}@test.dev`);

    const { rows } = await pool.query<{ id: string }>(
        `insert into public.questionnaires (owner_id, title) values ($1, 'Card') returning id`,
        [ownerId]
    );

    return { ownerId, questionnaireId: rows[0].id };
};

const shareWith = (pool: Pool, questionnaireId: string, userId: string, canEdit: boolean) => {
    return pool.query(
        `insert into public.questionnaire_shares (questionnaire_id, user_id, can_edit, can_view_responses)
         values ($1, $2, $3, true)`,
        [questionnaireId, userId, canEdit]
    );
};

// Ids of questionnaires the given user can SELECT (owned + shared via RLS).
const visibleIds = (pool: Pool, sub: string) => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rows } = await client.query<{ id: string }>('select id from public.questionnaires');

        return rows.map((row) => {
            return row.id;
        });
    });
};

describe.skipIf(!hasTestDb)('shared card visibility (questionnaires SELECT)', () => {
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

    it('a collaborator sees the questionnaire shared with them', async () => {
        const { questionnaireId } = await seedQuestionnaire(pool);
        const collab = await createUser(pool, `collab-${next()}@test.dev`);
        await shareWith(pool, questionnaireId, collab, false);

        expect(await visibleIds(pool, collab)).toContain(questionnaireId);
    });

    it('a stranger does not see an unshared questionnaire', async () => {
        const { questionnaireId } = await seedQuestionnaire(pool);
        const stranger = await createUser(pool, `stranger-${next()}@test.dev`);

        expect(await visibleIds(pool, stranger)).not.toContain(questionnaireId);
    });

    it('a collaborator can read the owner profile via the co-share users policy', async () => {
        const { ownerId, questionnaireId } = await seedQuestionnaire(pool);
        const collab = await createUser(pool, `collab-owner-${next()}@test.dev`);
        await shareWith(pool, questionnaireId, collab, true);

        const rows = await runAs(pool, 'authenticated', collab, async (client) => {
            const result = await client.query<{ id: string }>('select id from public.users where id = $1', [ownerId]);

            return result.rows;
        });

        expect(rows).toHaveLength(1);
    });
});
