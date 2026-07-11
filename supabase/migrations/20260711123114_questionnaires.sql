-- Slice 01: questionnaires table + lifecycle status enum + RLS.
-- Owner-scoped CRUD; anon has no access to this table yet (added when publishing lands).

-- Lifecycle status: draft -> published -> closed.
create type public.questionnaire_status as enum ('draft', 'published', 'closed');

create table public.questionnaires (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references public.users (id) on delete cascade,
    title text not null,
    description text,
    status public.questionnaire_status not null default 'draft',
    accepting_responses boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index questionnaires_owner_id_idx on public.questionnaires (owner_id);

-- Keep updated_at fresh on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger questionnaires_set_updated_at
    before update on public.questionnaires
    for each row
    execute function public.set_updated_at();

-- RLS: owner-only full access.
alter table public.questionnaires enable row level security;

create policy questionnaires_owner_select
    on public.questionnaires
    for select
    to authenticated
    using (owner_id = (select auth.uid()));

create policy questionnaires_owner_insert
    on public.questionnaires
    for insert
    to authenticated
    with check (owner_id = (select auth.uid()));

create policy questionnaires_owner_update
    on public.questionnaires
    for update
    to authenticated
    using (owner_id = (select auth.uid()))
    with check (owner_id = (select auth.uid()));

create policy questionnaires_owner_delete
    on public.questionnaires
    for delete
    to authenticated
    using (owner_id = (select auth.uid()));
