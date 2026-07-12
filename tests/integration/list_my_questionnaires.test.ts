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

type ListItem = { id: string; owner_id: string; role: string; sharesCount: number };

const listMine = (pool: Pool, sub: string) => {
    return runAs(pool, 'authenticated', sub, async (client) => {
        const { rows } = await client.query<{ list_my_questionnaires: ListItem }>(
            'select public.list_my_questionnaires() as list_my_questionnaires'
        );

        return rows.map((row) => {
            return row.list_my_questionnaires;
        });
    });
};

describe.skipIf(!hasTestDb)('list_my_questionnaires RPC', () => {
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

    it('returns owned and shared-with-me questionnaires, never others', async () => {
        const myEmail = `me-${next()}@test.dev`;
        const me = await createUser(pool, myEmail);
        const stranger = await createUser(pool, `stranger-${next()}@test.dev`);

        const mine = await seedQuestionnaire(pool, me, 'Mine');
        const strangersOwn = await seedQuestionnaire(pool, stranger, 'Strangers');
        const sharedToMe = await seedQuestionnaire(pool, stranger, 'SharedToMe');
        await runAs(pool, 'authenticated', stranger, async (client) => {
            await client.query('select public.share_questionnaire($1, $2, $3)', [sharedToMe, myEmail, 'viewer']);
        });

        const ids = (await listMine(pool, me)).map((item) => {
            return item.id;
        });

        expect(ids).toEqual(expect.arrayContaining([mine, sharedToMe]));
        expect(ids).toHaveLength(2);
        expect(ids).not.toContain(strangersOwn);
    });

    it('computes role: owner for owned, viewer/editor for shared', async () => {
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        const collabEmail = `collab-${next()}@test.dev`;
        const collab = await createUser(pool, collabEmail);

        const q = await seedQuestionnaire(pool, owner, 'Roles');
        await runAs(pool, 'authenticated', owner, async (client) => {
            await client.query('select public.share_questionnaire($1, $2, $3)', [q, collabEmail, 'editor']);
        });

        const ownerView = await listMine(pool, owner);
        const collabView = await listMine(pool, collab);

        const findRole = (items: ListItem[]) => {
            return items.find((item) => {
                return item.id === q;
            })?.role;
        };

        expect(findRole(ownerView)).toBe('owner');
        expect(findRole(collabView)).toBe('editor');
    });

    it('sharesCount reflects total for the owner and 1 for a shared collaborator', async () => {
        const owner = await createUser(pool, `owner-${next()}@test.dev`);
        const c1Email = `c1-${next()}@test.dev`;
        const c1 = await createUser(pool, c1Email);
        const c2Email = `c2-${next()}@test.dev`;
        await createUser(pool, c2Email);

        const q = await seedQuestionnaire(pool, owner, 'Counts');
        await runAs(pool, 'authenticated', owner, async (client) => {
            await client.query('select public.share_questionnaire($1, $2, $3)', [q, c1Email, 'viewer']);
            await client.query('select public.share_questionnaire($1, $2, $3)', [q, c2Email, 'viewer']);
        });

        const ownerView = await listMine(pool, owner);
        const c1View = await listMine(pool, c1);

        const findCount = (items: ListItem[]) => {
            return items.find((item) => {
                return item.id === q;
            })?.sharesCount;
        };

        expect(findCount(ownerView)).toBe(2);
        expect(findCount(c1View)).toBe(1);
    });

    it('is immune to admin SELECT widening — an admin sees only their own list', async () => {
        const admin = await createUser(pool, `admin-${next()}@test.dev`);
        const stranger = await createUser(pool, `stranger-${next()}@test.dev`);
        await makeAdmin(pool, admin);

        const adminOwn = await seedQuestionnaire(pool, admin, 'AdminOwn');
        const strangersOwn = await seedQuestionnaire(pool, stranger, 'Strangers');

        const ids = (await listMine(pool, admin)).map((item) => {
            return item.id;
        });

        expect(ids).toEqual([adminOwn]);
        expect(ids).not.toContain(strangersOwn);
    });
});
