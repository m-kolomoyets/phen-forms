-- Guard: a questionnaire with responses may be deleted only when it is not
-- live (draft/unpublished or closed). Published + has-responses is blocked so
-- an active collection cannot be wiped by accident. Children (questions,
-- responses, answers) are removed via their `on delete cascade` FKs.

-- Existence check runs as SECURITY DEFINER so the policy does not re-enter the
-- responses RLS policy (which itself selects questionnaires) -> infinite
-- recursion. search_path pinned to defeat hijacking.
create or replace function public.questionnaire_has_responses(qid uuid)
    returns boolean
    language sql
    stable
    security definer
    set search_path = ''
as $$
    select exists (
        select 1
        from public.responses r
        where r.questionnaire_id = qid
    );
$$;

drop policy questionnaires_owner_delete on public.questionnaires;

create policy questionnaires_owner_delete
    on public.questionnaires
    for delete
    to authenticated
    using (
        owner_id = (select auth.uid())
        and (
            status <> 'published'
            or not public.questionnaire_has_responses(id)
        )
    );
