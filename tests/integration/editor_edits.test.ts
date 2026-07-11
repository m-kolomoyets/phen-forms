import type { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createPool, createUser, hasTestDb, resetSchema, runAs } from './db';

let seq = 0;
const next = () => {
    seq += 1;

    return seq;
};

const seedQuestionnaire = async (pool: Pool) => {
    const ownerId = await createUser(pool, `owner-edit-${next()}@test.dev`);

    const { rows } = await pool.query<{ id: string }>(
        `insert into public.questionnaires (owner_id, title) values ($1, 'Edit') returning id`,
        [ownerId]
    );

    return { ownerId, questionnaireId: rows[0].id };
};

const seedQuestion = (pool: Pool, questionnaireId: string) => {
    return pool.query<{ id: string }>(
        `insert into public.questions (questionnaire_id, type, prompt, position)
         values ($1, 'short_text', 'Q', 0) returning id`,
        [questionnaireId]
    );
};

const shareWith = (pool: Pool, questionnaireId: string, userId: string, canEdit: boolean) => {
    return pool.query(
        `insert into public.questionnaire_shares (questionnaire_id, user_id, can_edit, can_view_responses)
         values ($1, $2, $3, true)`,
        [questionnaireId, userId, canEdit]
    );
};

describe.skipIf(!hasTestDb)('editor edits (RLS write access)', () => {
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

    it('an editor can update the questionnaire settings', async () => {
        const { questionnaireId } = await seedQuestionnaire(pool);
        const editor = await createUser(pool, `editor-${next()}@test.dev`);
        await shareWith(pool, questionnaireId, editor, true);

        const updated = await runAs(pool, 'authenticated', editor, async (client) => {
            const { rowCount } = await client.query(
                `update public.questionnaires set title = 'By editor' where id = $1`,
                [questionnaireId]
            );

            return rowCount;
        });

        expect(updated).toBe(1);
    });

    it('an editor can publish the questionnaire', async () => {
        const { questionnaireId } = await seedQuestionnaire(pool);
        const editor = await createUser(pool, `editor-pub-${next()}@test.dev`);
        await shareWith(pool, questionnaireId, editor, true);

        const updated = await runAs(pool, 'authenticated', editor, async (client) => {
            const { rowCount } = await client.query(
                `update public.questionnaires set status = 'published' where id = $1`,
                [questionnaireId]
            );

            return rowCount;
        });

        expect(updated).toBe(1);
    });

    it('an editor cannot reassign owner_id (with-check rejects)', async () => {
        const { questionnaireId } = await seedQuestionnaire(pool);
        const editor = await createUser(pool, `editor-own-${next()}@test.dev`);
        await shareWith(pool, questionnaireId, editor, true);

        await expect(
            runAs(pool, 'authenticated', editor, (client) => {
                return client.query(`update public.questionnaires set owner_id = $2 where id = $1`, [
                    questionnaireId,
                    editor,
                ]);
            })
        ).rejects.toThrow();
    });

    it('an editor can insert and delete questions', async () => {
        const { questionnaireId } = await seedQuestionnaire(pool);
        const editor = await createUser(pool, `editor-q-${next()}@test.dev`);
        await shareWith(pool, questionnaireId, editor, true);

        const count = await runAs(pool, 'authenticated', editor, async (client) => {
            await client.query(
                `insert into public.questions (questionnaire_id, type, prompt, position)
                 values ($1, 'short_text', 'From editor', 0)`,
                [questionnaireId]
            );
            const { rowCount } = await client.query(`delete from public.questions where questionnaire_id = $1`, [
                questionnaireId,
            ]);

            return rowCount;
        });

        expect(count).toBe(1);
    });

    it('a viewer cannot write or delete questions', async () => {
        const { questionnaireId } = await seedQuestionnaire(pool);
        const { rows } = await seedQuestion(pool, questionnaireId);
        const viewer = await createUser(pool, `viewer-${next()}@test.dev`);
        await shareWith(pool, questionnaireId, viewer, false);

        const deleted = await runAs(pool, 'authenticated', viewer, async (client) => {
            const { rowCount } = await client.query(`delete from public.questions where id = $1`, [rows[0].id]);

            return rowCount;
        });

        expect(deleted).toBe(0);
    });

    it('a viewer cannot update the questionnaire', async () => {
        const { questionnaireId } = await seedQuestionnaire(pool);
        const viewer = await createUser(pool, `viewer-upd-${next()}@test.dev`);
        await shareWith(pool, questionnaireId, viewer, false);

        const updated = await runAs(pool, 'authenticated', viewer, async (client) => {
            const { rowCount } = await client.query(`update public.questionnaires set title = 'nope' where id = $1`, [
                questionnaireId,
            ]);

            return rowCount;
        });

        expect(updated).toBe(0);
    });

    it('my_access returns the correct role per user', async () => {
        const { ownerId, questionnaireId } = await seedQuestionnaire(pool);
        const editor = await createUser(pool, `ma-editor-${next()}@test.dev`);
        const viewer = await createUser(pool, `ma-viewer-${next()}@test.dev`);
        const stranger = await createUser(pool, `ma-stranger-${next()}@test.dev`);
        await shareWith(pool, questionnaireId, editor, true);
        await shareWith(pool, questionnaireId, viewer, false);

        const roleOf = (sub: string) => {
            return runAs(pool, 'authenticated', sub, async (client) => {
                const { rows } = await client.query<{ my_access: string | null }>(
                    `select public.my_access($1) as my_access`,
                    [questionnaireId]
                );

                return rows[0].my_access;
            });
        };

        expect(await roleOf(ownerId)).toBe('owner');
        expect(await roleOf(editor)).toBe('editor');
        expect(await roleOf(viewer)).toBe('viewer');
        expect(await roleOf(stranger)).toBeNull();
    });
});
