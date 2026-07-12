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

const share = (pool: Pool, sub: string, questionnaireId: string, email: string, role: 'editor' | 'viewer') => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rows } = await client.query<{ share_questionnaire: string }>(
            'select public.share_questionnaire($1, $2, $3) as share_questionnaire',
            [questionnaireId, email, role]
        );

        return rows[0].share_questionnaire;
    });
};

const shareRow = async (pool: Pool, questionnaireId: string, userId: string) => {
    const { rows } = await pool.query<{ can_edit: boolean }>(
        'select can_edit from public.questionnaire_shares where questionnaire_id = $1 and user_id = $2',
        [questionnaireId, userId]
    );

    return rows[0];
};

describe.skipIf(!hasTestDb)('admin manages access', () => {
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

    it('lets an admin share a questionnaire they do not own', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        await makeAdmin(pool, admin);
        const q = await seedQuestionnaire(pool, owner, 'Q');
        const collabEmail = `collab-${next()}@test.dev`;
        const collab = await createUser(pool, collabEmail);

        const status = await share(pool, admin, q, collabEmail, 'editor');

        expect(status).toBe('shared');
        expect(await shareRow(pool, q, collab)).toEqual({ can_edit: true });
    });

    it('still forbids a non-admin non-owner from sharing', async () => {
        const stranger = await createUser(pool, `stranger-${next()}@test.dev`);
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        const q = await seedQuestionnaire(pool, owner, 'Q');
        const targetEmail = `target-${next()}@test.dev`;
        await createUser(pool, targetEmail);

        const status = await share(pool, stranger, q, targetEmail, 'editor');

        expect(status).toBe('forbidden');
    });

    it('lets an admin change a collaborator role and remove them', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        await makeAdmin(pool, admin);
        const q = await seedQuestionnaire(pool, owner, 'Q');
        const collabEmail = `collab-${next()}@test.dev`;
        const collab = await createUser(pool, collabEmail);
        await share(pool, owner, q, collabEmail, 'editor');

        // Admin downgrades the collaborator to viewer via a direct update.
        await runAs(pool, 'authenticated', admin, async (client) => {
            await client.query(
                'update public.questionnaire_shares set can_edit = false, can_view_responses = true where questionnaire_id = $1 and user_id = $2',
                [q, collab]
            );
        });

        expect(await shareRow(pool, q, collab)).toEqual({ can_edit: false });

        // Admin removes the collaborator via a direct delete.
        const removed = await runAs(pool, 'authenticated', admin, async (client) => {
            const { rowCount } = await client.query(
                'delete from public.questionnaire_shares where questionnaire_id = $1 and user_id = $2',
                [q, collab]
            );

            return rowCount;
        });

        expect(removed).toBe(1);
        expect(await shareRow(pool, q, collab)).toBeUndefined();
    });

    it('does not let a non-admin non-owner delete a share', async () => {
        const stranger = await createUser(pool, `stranger-${next()}@test.dev`);
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        const q = await seedQuestionnaire(pool, owner, 'Q');
        const collabEmail = `collab-${next()}@test.dev`;
        const collab = await createUser(pool, collabEmail);
        await share(pool, owner, q, collabEmail, 'editor');

        const removed = await runAs(pool, 'authenticated', stranger, async (client) => {
            const { rowCount } = await client.query(
                'delete from public.questionnaire_shares where questionnaire_id = $1 and user_id = $2',
                [q, collab]
            );

            return rowCount;
        });

        expect(removed).toBe(0);
        expect(await shareRow(pool, q, collab)).toEqual({ can_edit: true });
    });
});
