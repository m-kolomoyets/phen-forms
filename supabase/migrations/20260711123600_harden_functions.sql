-- Advisor hardening: pin search_path on trigger functions and stop the
-- signup-sync trigger function from being reachable as a public RPC.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create or replace function public.reject_if_locked()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    v_questionnaire_id uuid;
begin
    if tg_table_name = 'questionnaires' then
        if tg_op = 'UPDATE'
            and new.randomize_questions is distinct from old.randomize_questions
            and exists (
                select 1 from public.responses r where r.questionnaire_id = new.id
            ) then
            raise exception 'Questionnaire is locked: responses already exist';
        end if;

        return new;
    elsif tg_table_name = 'questions' then
        v_questionnaire_id := coalesce(new.questionnaire_id, old.questionnaire_id);
    elsif tg_table_name = 'question_options' then
        select qn.questionnaire_id
        into v_questionnaire_id
        from public.questions qn
        where qn.id = coalesce(new.question_id, old.question_id);
    end if;

    if exists (
        select 1 from public.responses r where r.questionnaire_id = v_questionnaire_id
    ) then
        raise exception 'Questionnaire structure is locked: responses already exist';
    end if;

    if tg_op = 'DELETE' then
        return old;
    end if;

    return new;
end;
$$;

-- handle_new_user only runs from the auth.users trigger; it is not an API.
revoke all on function public.handle_new_user() from public, anon, authenticated;
