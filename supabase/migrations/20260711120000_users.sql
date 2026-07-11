-- Public mirror of auth.users. owner_id FKs target this table (id = auth.uid()).
-- Kept in sync via a trigger on auth.users; existing auth users are backfilled.

create table public.users (
    id uuid primary key references auth.users (id) on delete cascade,
    email text not null,
    first_name text,
    last_name text,
    created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- A user may read their own profile row.
create policy users_select_own
    on public.users
    for select
    to authenticated
    using (id = (select auth.uid()));

-- Populate public.users whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.users (id, email, first_name, last_name)
    values (
        new.id,
        new.email,
        new.raw_user_meta_data ->> 'given_name',
        new.raw_user_meta_data ->> 'family_name'
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- Backfill users that signed up before this trigger existed.
insert into public.users (id, email, first_name, last_name)
select
    au.id,
    au.email,
    au.raw_user_meta_data ->> 'given_name',
    au.raw_user_meta_data ->> 'family_name'
from auth.users au
on conflict (id) do nothing;
