-- Slice: viewer results.
-- A viewer (share row with can_view_responses) — and any editor (can_edit) — may
-- read responses/answers and load the stats RPC, but has no constructor access.
-- Widenings are additive permissive policies, OR-combined with the owner-only
-- policies. Response access uses can_view_resp_q (= can_edit OR can_view_responses).

-- ---------------------------------------------------------------------------
-- responses + answers: widen SELECT to owner OR view-access.
-- ---------------------------------------------------------------------------
create policy responses_shared_select
    on public.responses
    for select
    to authenticated
    using (public.can_view_resp_q(questionnaire_id));

create policy answers_shared_select
    on public.answers
    for select
    to authenticated
    using (
        public.can_view_resp_q(
            (select r.questionnaire_id from public.responses r where r.id = answers.response_id)
        )
    );

-- ---------------------------------------------------------------------------
-- get_questionnaire_stats: replace the owner-only guard with owner OR
-- view-access so shared users can load charts. Body is otherwise identical to
-- the multiple_choice "Other" version (20260711123800) — only the guard widens.
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

    if v_owner <> (select auth.uid()) and not public.can_view_resp_q(p_questionnaire_id) then
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
                    when q.type = 'single_choice' then (
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
                    when q.type = 'multiple_choice' then jsonb_build_object(
                        'options', (
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
                        ),
                        'other', (
                            select coalesce(jsonb_agg(a.value_text), '[]'::jsonb)
                            from public.answers a
                            where a.question_id = q.id and coalesce(a.value_text, '') <> ''
                        )
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
