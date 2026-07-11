-- Submissions (responses) and their per-question answers.
-- Public writes go exclusively through the submit_response RPC (next migration);
-- direct table access is owner-read-only.

create table public.responses (
    id uuid primary key default gen_random_uuid(),
    questionnaire_id uuid not null references public.questionnaires (id) on delete cascade,
    submitted_at timestamptz not null default now(),
    meta jsonb not null default '{}'::jsonb
);

create index responses_questionnaire_id_idx
    on public.responses (questionnaire_id);

create table public.answers (
    id uuid primary key default gen_random_uuid(),
    response_id uuid not null references public.responses (id) on delete cascade,
    question_id uuid not null references public.questions (id) on delete cascade,
    value_text text,
    value_number numeric,
    value_options jsonb
);

create index answers_response_id_idx on public.answers (response_id);
create index answers_question_id_idx on public.answers (question_id);

-- RLS ------------------------------------------------------------------------

alter table public.responses enable row level security;
alter table public.answers enable row level security;

-- Owner: read responses to their own questionnaires. No anon access.
create policy responses_owner_select
    on public.responses
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.questionnaires q
            where q.id = responses.questionnaire_id
                and q.owner_id = (select auth.uid())
        )
    );

-- Owner: read answers via response -> questionnaire ownership. No anon access.
create policy answers_owner_select
    on public.answers
    for select
    to authenticated
    using (
        exists (
            select 1
            from public.responses r
            join public.questionnaires q on q.id = r.questionnaire_id
            where r.id = answers.response_id
                and q.owner_id = (select auth.uid())
        )
    );
