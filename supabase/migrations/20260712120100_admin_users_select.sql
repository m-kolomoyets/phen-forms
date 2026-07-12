-- Slice: admin views all users.
-- Additive permissive SELECT policy so an admin can read every profile row. The
-- existing users_select_own / users_select_co_shared policies are untouched, so a
-- regular user's visibility (self + co-shared collaborators) is unchanged — Postgres
-- OR-combines permissive policies.

create policy users_admin_select
    on public.users
    for select
    to authenticated
    using (public.is_admin());
