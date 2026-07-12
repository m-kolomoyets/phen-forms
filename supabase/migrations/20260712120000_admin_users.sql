-- Slice: admin identity foundation.
-- App-level admin capability. An admin can (via later additive policies) view all
-- users/questionnaires/responses, edit/delete any questionnaire, manage all
-- accesses, and reassign ownership. This migration only establishes IDENTITY.
--
-- Granting admin is DIRECT-SQL-ONLY by design: there is no grant RPC, no UI toggle,
-- no seed trigger, and no admin email committed here. The admin set is empty until
-- an operator inserts a row by hand.
--
-- Bootstrap (run manually against the live DB, never in a migration):
--   1. Sign in once via Google OAuth so your auth.users row exists.
--   2. insert into public.admin_users (user_id)
--        select id from auth.users where lower(email) = lower('you@example.com');
--   Revoke by deleting the row.

create table public.admin_users (
    user_id uuid primary key references auth.users (id) on delete cascade,
    created_at timestamptz not null default now()
);

-- RLS enabled with NO policies: no role (anon/authenticated) can read or write this
-- table directly. A probe returns zero rows, not an error — the admin set's contents
-- and even its use are never exposed to clients. Only the SECURITY DEFINER predicate
-- below reads it.
alter table public.admin_users enable row level security;

-- ---------------------------------------------------------------------------
-- is_admin(): the single source of truth for every admin policy and RPC.
-- SECURITY DEFINER so it reads admin_users while bypassing its (empty) RLS —
-- mirrors the has_share / can_edit_q helper pattern.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
    select exists (
        select 1 from public.admin_users a
        where a.user_id = (select auth.uid())
    );
$$;

-- am_i_admin(): thin RPC wrapper backing the client route guard. Returns false for
-- non-admins (and for anon), never an error — reveals nothing about the flow.
create or replace function public.am_i_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
    select public.is_admin();
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.am_i_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.am_i_admin() to authenticated;
