-- Slice: shared card visibility — owner avatar image.
-- Mirror the OAuth avatar into public.users so collaborators (who cannot read
-- another user's auth metadata) can render the owner's avatar image.

alter table public.users add column avatar_url text;

-- Re-create the sign-up mirror to also capture the avatar url. Google OAuth
-- exposes it as `avatar_url`; fall back to `picture` for other providers.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.users (id, email, first_name, last_name, avatar_url)
    values (
        new.id,
        new.email,
        new.raw_user_meta_data ->> 'given_name',
        new.raw_user_meta_data ->> 'family_name',
        coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Backfill avatars for users created before this column existed.
update public.users u
set avatar_url = coalesce(au.raw_user_meta_data ->> 'avatar_url', au.raw_user_meta_data ->> 'picture')
from auth.users au
where au.id = u.id and u.avatar_url is null;
