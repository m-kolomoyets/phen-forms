-- The structure lock must not block deleting the whole questionnaire. When a
-- questionnaire is deleted, its questions/options cascade; PG removes the parent
-- row first, so inside the child BEFORE DELETE trigger the questionnaire no
-- longer exists. Treat "parent gone" as a cascade and let the delete through;
-- keep blocking direct structure edits while the (live) questionnaire remains.
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

    -- Cascade from a questionnaire delete: parent already gone -> allow.
    if tg_op = 'DELETE'
        and not exists (
            select 1 from public.questionnaires q where q.id = v_questionnaire_id
        ) then
        return old;
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
