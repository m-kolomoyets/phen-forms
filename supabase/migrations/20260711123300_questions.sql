-- Polymorphic questions (type enum + config jsonb) and their normalized options.

create type public.question_type as enum (
    'single_choice',
    'multiple_choice',
    'short_text',
    'long_text',
    'yes_no',
    'ranking',
    'opinion_scale'
);

create table public.questions (
    id uuid primary key default gen_random_uuid(),
    questionnaire_id uuid not null references public.questionnaires (id) on delete cascade,
    type public.question_type not null,
    prompt text not null,
    description text,
    required boolean not null default false,
    position integer not null,
    config jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (questionnaire_id, position)
);

create index questions_questionnaire_id_position_idx
    on public.questions (questionnaire_id, position);

create trigger questions_set_updated_at
    before update on public.questions
    for each row
    execute function public.set_updated_at();

create table public.question_options (
    id uuid primary key default gen_random_uuid(),
    question_id uuid not null references public.questions (id) on delete cascade,
    label text not null,
    position integer not null,
    unique (question_id, position)
);

create index question_options_question_id_idx
    on public.question_options (question_id);

-- RLS ------------------------------------------------------------------------

alter table public.questions enable row level security;
alter table public.question_options enable row level security;

-- Owner: full access to questions of questionnaires they own.
create policy questions_owner_all
    on public.questions
    for all
    to authenticated
    using (
        exists (
            select 1
            from public.questionnaires q
            where q.id = questions.questionnaire_id
                and q.owner_id = (select auth.uid())
        )
    )
    with check (
        exists (
            select 1
            from public.questionnaires q
            where q.id = questions.questionnaire_id
                and q.owner_id = (select auth.uid())
        )
    );

-- Anon: read questions of published questionnaires.
create policy questions_anon_select_published
    on public.questions
    for select
    to anon
    using (
        exists (
            select 1
            from public.questionnaires q
            where q.id = questions.questionnaire_id
                and q.status = 'published'
        )
    );

-- Owner: full access to options via question -> questionnaire ownership.
create policy question_options_owner_all
    on public.question_options
    for all
    to authenticated
    using (
        exists (
            select 1
            from public.questions qn
            join public.questionnaires q on q.id = qn.questionnaire_id
            where qn.id = question_options.question_id
                and q.owner_id = (select auth.uid())
        )
    )
    with check (
        exists (
            select 1
            from public.questions qn
            join public.questionnaires q on q.id = qn.questionnaire_id
            where qn.id = question_options.question_id
                and q.owner_id = (select auth.uid())
        )
    );

-- Anon: read options of published questionnaires.
create policy question_options_anon_select_published
    on public.question_options
    for select
    to anon
    using (
        exists (
            select 1
            from public.questions qn
            join public.questionnaires q on q.id = qn.questionnaire_id
            where qn.id = question_options.question_id
                and q.status = 'published'
        )
    );
