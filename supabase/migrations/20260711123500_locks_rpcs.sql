-- Structure lock trigger + public-write / owner-stats RPCs.

-- ---------------------------------------------------------------------------
-- Lock: once a questionnaire has any response, its structure is frozen.
-- Allowed after lock: status / accepting_responses / welcome-text edits.
-- Blocked after lock: randomize_questions change, any question/option mutation.
-- ---------------------------------------------------------------------------

create or replace function public.reject_if_locked()
returns trigger
language plpgsql
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

create trigger questionnaires_lock
    before update on public.questionnaires
    for each row
    execute function public.reject_if_locked();

create trigger questions_lock
    before insert or update or delete on public.questions
    for each row
    execute function public.reject_if_locked();

create trigger question_options_lock
    before insert or update or delete on public.question_options
    for each row
    execute function public.reject_if_locked();

-- ---------------------------------------------------------------------------
-- submit_response: anonymous, server-authoritative validation + atomic insert.
-- p_answers = jsonb array of { question_id, value_text?, value_number?, value_options? }.
-- ---------------------------------------------------------------------------

create or replace function public.submit_response(p_questionnaire_id uuid, p_answers jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_response_id uuid;
    v_answer jsonb;
    v_question_id uuid;
    v_question public.questions%rowtype;
    v_missing integer;
begin
    if not exists (
        select 1 from public.questionnaires
        where id = p_questionnaire_id
            and status = 'published'
            and accepting_responses = true
    ) then
        raise exception 'Questionnaire is not accepting responses';
    end if;

    if p_answers is null or jsonb_typeof(p_answers) <> 'array' then
        raise exception 'answers must be a json array';
    end if;

    -- Every answer must reference a question in this questionnaire.
    for v_answer in select * from jsonb_array_elements(p_answers)
    loop
        v_question_id := (v_answer ->> 'question_id')::uuid;

        if not exists (
            select 1 from public.questions
            where id = v_question_id and questionnaire_id = p_questionnaire_id
        ) then
            raise exception 'Answer references unknown question %', v_question_id;
        end if;
    end loop;

    -- Every required question must have a non-empty answer.
    select count(*)
    into v_missing
    from public.questions q
    where q.questionnaire_id = p_questionnaire_id
        and q.required = true
        and not exists (
            select 1
            from jsonb_array_elements(p_answers) a
            where (a ->> 'question_id')::uuid = q.id
                and (
                    coalesce(a ->> 'value_text', '') <> ''
                    or (a ->> 'value_number') is not null
                    or (
                        jsonb_typeof(a -> 'value_options') = 'array'
                        and jsonb_array_length(a -> 'value_options') > 0
                    )
                )
        );

    if v_missing > 0 then
        raise exception 'Required questions unanswered';
    end if;

    -- Per-type validation.
    for v_answer in select * from jsonb_array_elements(p_answers)
    loop
        v_question_id := (v_answer ->> 'question_id')::uuid;
        select * into v_question from public.questions where id = v_question_id;

        if v_question.type in ('single_choice', 'multiple_choice', 'ranking') then
            if jsonb_typeof(v_answer -> 'value_options') = 'array' then
                if exists (
                    select 1
                    from jsonb_array_elements_text(v_answer -> 'value_options') opt
                    where not exists (
                        select 1 from public.question_options o
                        where o.id = opt::uuid and o.question_id = v_question_id
                    )
                ) then
                    raise exception 'Option does not belong to question %', v_question_id;
                end if;
            end if;

            if v_question.type = 'single_choice'
                and coalesce(jsonb_array_length(v_answer -> 'value_options'), 0) > 1 then
                raise exception 'single_choice accepts at most one option';
            end if;
        elsif v_question.type = 'opinion_scale' then
            if (v_answer ->> 'value_number') is not null
                and (
                    (v_answer ->> 'value_number')::numeric
                        < coalesce((v_question.config ->> 'scale_min')::numeric, 1)
                    or (v_answer ->> 'value_number')::numeric
                        > coalesce((v_question.config ->> 'scale_max')::numeric, 10)
                ) then
                raise exception 'Scale value out of range for question %', v_question_id;
            end if;
        elsif v_question.type = 'yes_no' then
            if (v_answer ->> 'value_text') is not null
                and (v_answer ->> 'value_text') not in ('yes', 'no') then
                raise exception 'yes_no expects yes or no';
            end if;
        end if;
    end loop;

    insert into public.responses (questionnaire_id)
    values (p_questionnaire_id)
    returning id into v_response_id;

    insert into public.answers (response_id, question_id, value_text, value_number, value_options)
    select
        v_response_id,
        (a ->> 'question_id')::uuid,
        a ->> 'value_text',
        (a ->> 'value_number')::numeric,
        a -> 'value_options'
    from jsonb_array_elements(p_answers) a;

    return v_response_id;
end;
$$;

revoke all on function public.submit_response(uuid, jsonb) from public;
grant execute on function public.submit_response(uuid, jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- get_questionnaire_stats: owner-only per-question aggregates for charts.
-- ---------------------------------------------------------------------------

create or replace function public.get_questionnaire_stats(p_questionnaire_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_owner uuid;
    v_result jsonb;
begin
    select owner_id into v_owner
    from public.questionnaires
    where id = p_questionnaire_id;

    if v_owner is null then
        raise exception 'Questionnaire not found';
    end if;

    if v_owner <> (select auth.uid()) then
        raise exception 'Not authorized';
    end if;

    select coalesce(jsonb_agg(stat order by stat_position), '[]'::jsonb)
    into v_result
    from (
        select
            q.position as stat_position,
            jsonb_build_object(
                'question_id', q.id,
                'prompt', q.prompt,
                'type', q.type,
                'response_count', (
                    select count(*) from public.answers a where a.question_id = q.id
                ),
                'data', case
                    when q.type in ('single_choice', 'multiple_choice') then (
                        select coalesce(jsonb_agg(
                            jsonb_build_object('option_id', o.id, 'label', o.label, 'count', c.cnt)
                            order by o.position
                        ), '[]'::jsonb)
                        from public.question_options o
                        left join (
                            select opt::uuid as option_id, count(*) as cnt
                            from public.answers a
                            cross join lateral jsonb_array_elements_text(a.value_options) opt
                            where a.question_id = q.id
                            group by opt
                        ) c on c.option_id = o.id
                        where o.question_id = q.id
                    )
                    when q.type = 'ranking' then (
                        select coalesce(jsonb_agg(
                            jsonb_build_object('option_id', o.id, 'label', o.label, 'avg_rank', r.avg_rank)
                            order by o.position
                        ), '[]'::jsonb)
                        from public.question_options o
                        left join (
                            select opt.value::uuid as option_id, avg(opt.ordinality) as avg_rank
                            from public.answers a
                            cross join lateral jsonb_array_elements_text(a.value_options)
                                with ordinality opt
                            where a.question_id = q.id
                            group by opt.value
                        ) r on r.option_id = o.id
                        where o.question_id = q.id
                    )
                    when q.type = 'opinion_scale' then (
                        select jsonb_build_object(
                            'average', avg(a.value_number),
                            'distribution', coalesce(jsonb_object_agg(a.value_number, a.cnt), '{}'::jsonb)
                        )
                        from (
                            select value_number, count(*) as cnt
                            from public.answers
                            where question_id = q.id and value_number is not null
                            group by value_number
                        ) a
                    )
                    when q.type = 'yes_no' then (
                        select jsonb_build_object(
                            'yes', count(*) filter (where value_text = 'yes'),
                            'no', count(*) filter (where value_text = 'no')
                        )
                        from public.answers
                        where question_id = q.id
                    )
                    else (
                        select coalesce(jsonb_agg(value_text), '[]'::jsonb)
                        from public.answers
                        where question_id = q.id and value_text is not null
                    )
                end
            ) as stat
        from public.questions q
        where q.questionnaire_id = p_questionnaire_id
    ) s;

    return v_result;
end;
$$;

revoke all on function public.get_questionnaire_stats(uuid) from public;
grant execute on function public.get_questionnaire_stats(uuid) to authenticated;
