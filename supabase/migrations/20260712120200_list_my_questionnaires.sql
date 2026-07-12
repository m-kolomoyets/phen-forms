-- Slice: leak-proof normal questionnaires list.
-- The normal /questionnaires list previously did a plain `.select()` and relied on
-- RLS to scope rows to owner + shared-with-me. Once admin SELECT policies are added
-- (later slice), that plain select would return EVERY questionnaire to an admin,
-- leaking the whole platform into their everyday list.
--
-- This RPC is the fix: SECURITY DEFINER but EXPLICITLY scoped to the caller's owned
-- and shared-with-me questionnaires. It never widens for admins, so the normal list
-- is provably immune to admin SELECT widening. It also assembles the list-item shape
-- (counts, owner, role, shares count) server-side, matching the previous client-side
-- assembly exactly:
--   role        -> 'owner' when caller owns it, else 'editor'/'viewer' from their share
--   sharesCount -> total collaborators when owner; 1 (own visible row) when shared
--
-- Returns one jsonb object per row: the questionnaire columns (snake_case, matching
-- the Questionnaire row type) merged with the camelCase list-item extras.

create or replace function public.list_my_questionnaires()
returns setof jsonb
language sql
security definer
set search_path = ''
stable
as $$
    select
        to_jsonb(q)
        || jsonb_build_object(
            'questionsCount', (
                select count(*) from public.questions qn where qn.questionnaire_id = q.id
            ),
            'responsesCount', (
                select count(*) from public.responses r where r.questionnaire_id = q.id
            ),
            'owner', (
                select jsonb_build_object(
                    'id', u.id,
                    'email', u.email,
                    'first_name', u.first_name,
                    'last_name', u.last_name,
                    'avatar_url', u.avatar_url
                )
                from public.users u
                where u.id = q.owner_id
            ),
            'role', case
                when q.owner_id = (select auth.uid()) then 'owner'
                when s.can_edit then 'editor'
                else 'viewer'
            end,
            'sharesCount', case
                when q.owner_id = (select auth.uid())
                    then (select count(*) from public.questionnaire_shares sc where sc.questionnaire_id = q.id)
                else 1
            end
        )
    from public.questionnaires q
    left join public.questionnaire_shares s
        on s.questionnaire_id = q.id and s.user_id = (select auth.uid())
    where q.owner_id = (select auth.uid()) or s.user_id is not null
    order by q.created_at desc;
$$;

revoke all on function public.list_my_questionnaires() from public;
grant execute on function public.list_my_questionnaires() to authenticated;
