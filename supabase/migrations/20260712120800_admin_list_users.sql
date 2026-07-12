-- Slice: admin user list with admin indicator.
-- admin_users has no direct SELECT policy (its contents are never exposed to clients),
-- so the "is this user an admin" flag needed by the admin users screen is surfaced only
-- through this SECURITY DEFINER RPC, gated on is_admin(). A non-admin caller gets zero
-- rows (the `where public.is_admin()` predicate), so nothing leaks.
--
-- Returns one jsonb per user: the user columns (snake_case) merged with an isAdmin flag.

create or replace function public.admin_list_users()
returns setof jsonb
language sql
security definer
set search_path = ''
stable
as $$
    select
        to_jsonb(u)
        || jsonb_build_object(
            'isAdmin', exists (select 1 from public.admin_users a where a.user_id = u.id)
        )
    from public.users u
    where public.is_admin()
    order by u.created_at desc;
$$;

revoke all on function public.admin_list_users() from public;
grant execute on function public.admin_list_users() to authenticated;
