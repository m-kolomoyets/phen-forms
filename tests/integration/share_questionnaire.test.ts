import type { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createPool, createUser, hasTestDb, resetSchema, runAs } from './db';

let seq = 0;
const next = () => {
    seq += 1;

    return seq;
};

type Status = 'shared' | 'not_found' | 'self' | 'forbidden';

const seedQuestionnaire = async (pool: Pool, status: 'draft' | 'published' | 'closed' = 'draft') => {
    const ownerId = await createUser(pool, `owner-share-${next()}@test.dev`);

    const { rows } = await pool.query<{ id: string }>(
        `insert into public.questionnaires (owner_id, title, status, accepting_responses)
         values ($1, 'Share', $2, false) returning id`,
        [ownerId, status]
    );

    return { ownerId, questionnaireId: rows[0].id };
};

// Call share_questionnaire as `sub` (authenticated) and return the status string.
const share = (pool: Pool, sub: string, questionnaireId: string, email: string, role: 'editor' | 'viewer') => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rows } = await client.query<{ share_questionnaire: Status }>(
            'select public.share_questionnaire($1, $2, $3) as share_questionnaire',
            [questionnaireId, email, role]
        );

        return rows[0].share_questionnaire;
    });
};

const getShareRow = async (pool: Pool, questionnaireId: string, userId: string) => {
    const { rows } = await pool.query<{ can_edit: boolean; can_view_responses: boolean }>(
        'select can_edit, can_view_responses from public.questionnaire_shares where questionnaire_id = $1 and user_id = $2',
        [questionnaireId, userId]
    );

    return rows[0];
};

describe.skipIf(!hasTestDb)('share_questionnaire RPC', () => {
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

    it('shares as editor with both booleans true', async () => {
        const { ownerId, questionnaireId } = await seedQuestionnaire(pool);
        const collab = await createUser(pool, `editor-${next()}@test.dev`);

        const status = await share(pool, ownerId, questionnaireId, `editor-${seq}@test.dev`, 'editor');

        expect(status).toBe('shared');

        const row = await getShareRow(pool, questionnaireId, collab);
        expect(row).toEqual({ can_edit: true, can_view_responses: true });
    });

    it('shares as viewer with view-only booleans', async () => {
        const { ownerId, questionnaireId } = await seedQuestionnaire(pool);
        const collab = await createUser(pool, `viewer-${next()}@test.dev`);

        const status = await share(pool, ownerId, questionnaireId, `viewer-${seq}@test.dev`, 'viewer');

        expect(status).toBe('shared');

        const row = await getShareRow(pool, questionnaireId, collab);
        expect(row).toEqual({ can_edit: false, can_view_responses: true });
    });

    it('re-adding an existing collaborator updates the role without duplicating', async () => {
        const { ownerId, questionnaireId } = await seedQuestionnaire(pool);
        const email = `reshare-${next()}@test.dev`;
        const collab = await createUser(pool, email);

        await share(pool, ownerId, questionnaireId, email, 'editor');
        const status = await share(pool, ownerId, questionnaireId, email, 'viewer');

        expect(status).toBe('shared');

        const { rows } = await pool.query<{ count: string }>(
            'select count(*) from public.questionnaire_shares where questionnaire_id = $1 and user_id = $2',
            [questionnaireId, collab]
        );
        expect(rows[0].count).toBe('1');

        const row = await getShareRow(pool, questionnaireId, collab);
        expect(row).toEqual({ can_edit: false, can_view_responses: true });
    });

    it('returns not_found for an unregistered email and creates no row', async () => {
        const { ownerId, questionnaireId } = await seedQuestionnaire(pool);

        const status = await share(pool, ownerId, questionnaireId, 'ghost@test.dev', 'editor');

        expect(status).toBe('not_found');

        const { rows } = await pool.query<{ count: string }>(
            'select count(*) from public.questionnaire_shares where questionnaire_id = $1',
            [questionnaireId]
        );
        expect(rows[0].count).toBe('0');
    });

    it('returns self when the owner shares with their own email', async () => {
        const email = `self-${next()}@test.dev`;
        const ownerId = await createUser(pool, email);
        const { rows } = await pool.query<{ id: string }>(
            `insert into public.questionnaires (owner_id, title) values ($1, 'Self') returning id`,
            [ownerId]
        );

        const status = await share(pool, ownerId, rows[0].id, email, 'editor');

        expect(status).toBe('self');
    });

    it('returns forbidden when a non-owner tries to share', async () => {
        const { questionnaireId } = await seedQuestionnaire(pool);
        const stranger = await createUser(pool, `stranger-${next()}@test.dev`);
        const target = `target-${next()}@test.dev`;
        await createUser(pool, target);

        const status = await share(pool, stranger, questionnaireId, target, 'editor');

        expect(status).toBe('forbidden');

        const { rows } = await pool.query<{ count: string }>(
            'select count(*) from public.questionnaire_shares where questionnaire_id = $1',
            [questionnaireId]
        );
        expect(rows[0].count).toBe('0');
    });

    it('shares regardless of questionnaire status', async () => {
        for (const qStatus of ['draft', 'published', 'closed'] as const) {
            const { ownerId, questionnaireId } = await seedQuestionnaire(pool, qStatus);
            const email = `collab-${qStatus}-${next()}@test.dev`;
            await createUser(pool, email);

            const status = await share(pool, ownerId, questionnaireId, email, 'editor');

            expect(status).toBe('shared');
        }
    });
});
