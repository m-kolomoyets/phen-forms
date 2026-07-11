-- Slice: questionnaire sharing foundation.
-- A share row grants a registered user access to another owner's questionnaire.
-- Role is a UI concept over two booleans:
--   Editor -> can_edit = true,  can_view_responses = true
--   Viewer -> can_edit = false, can_view_responses = true
-- Effective response access = can_edit OR can_view_responses.

create table public.questionnaire_shares (
    questionnaire_id uuid not null references public.questionnaires (id) on delete cascade,
    user_id uuid not null references public.users (id) on delete cascade,
    can_edit boolean not null default false,
    can_view_responses boolean not null default false,
    created_at timestamptz not null default now(),
    primary key (questionnaire_id, user_id)
);

create index questionnaire_shares_user_id_idx on public.questionnaire_shares (user_id);

alter table public.questionnaire_shares enable row level security;

-- ---------------------------------------------------------------------------
-- Access helpers (deep module). SECURITY DEFINER so they read shares while
-- bypassing its RLS — prevents recursive policy evaluation. Single source of
-- truth for every share-based policy and RPC.
-- ---------------------------------------------------------------------------

create or replace function public.has_share(p_questionnaire_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
    select exists (
        select 1 from public.questionnaire_shares s
        where s.questionnaire_id = p_questionnaire_id
            and s.user_id = (select auth.uid())
    );
$$;

create or replace function public.can_edit_q(p_questionnaire_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
    select exists (
        select 1 from public.questionnaire_shares s
        where s.questionnaire_id = p_questionnaire_id
            and s.user_id = (select auth.uid())
            and s.can_edit
    );
$$;

create or replace function public.can_view_resp_q(p_questionnaire_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
    select exists (
        select 1 from public.questionnaire_shares s
        where s.questionnaire_id = p_questionnaire_id
            and s.user_id = (select auth.uid())
            and (s.can_edit or s.can_view_responses)
    );
$$;

-- True when the current user and p_other are both members (owner or sharer) of
-- some common questionnaire. Backs the narrow users SELECT policy so
-- collaborators and owners can read each other's profile (avatars/emails).
create or replace function public.shares_questionnaire_with(p_other uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
    select exists (
        select 1
        from public.questionnaires q
        where (
                q.owner_id = (select auth.uid())
                or exists (
                    select 1 from public.questionnaire_shares s
                    where s.questionnaire_id = q.id and s.user_id = (select auth.uid())
                )
            )
            and (
                q.owner_id = p_other
                or exists (
                    select 1 from public.questionnaire_shares s
                    where s.questionnaire_id = q.id and s.user_id = p_other
                )
            )
    );
$$;

-- ---------------------------------------------------------------------------
-- RLS: questionnaire_shares
--   SELECT: the questionnaire owner OR the collaborator's own row.
--   WRITE : the questionnaire owner only.
-- ---------------------------------------------------------------------------

create policy questionnaire_shares_select
    on public.questionnaire_shares
    for select
    to authenticated
    using (
        user_id = (select auth.uid())
        or exists (
            select 1 from public.questionnaires q
            where q.id = questionnaire_id and q.owner_id = (select auth.uid())
        )
    );

create policy questionnaire_shares_insert
    on public.questionnaire_shares
    for insert
    to authenticated
    with check (
        exists (
            select 1 from public.questionnaires q
            where q.id = questionnaire_id and q.owner_id = (select auth.uid())
        )
    );

create policy questionnaire_shares_update
    on public.questionnaire_shares
    for update
    to authenticated
    using (
        exists (
            select 1 from public.questionnaires q
            where q.id = questionnaire_id and q.owner_id = (select auth.uid())
        )
    )
    with check (
        exists (
            select 1 from public.questionnaires q
            where q.id = questionnaire_id and q.owner_id = (select auth.uid())
        )
    );

create policy questionnaire_shares_delete
    on public.questionnaire_shares
    for delete
    to authenticated
    using (
        exists (
            select 1 from public.questionnaires q
            where q.id = questionnaire_id and q.owner_id = (select auth.uid())
        )
    );

-- ---------------------------------------------------------------------------
-- RLS: users — a profile row is readable if the reader co-shares a
-- questionnaire with that user (adds to the existing self-read policy).
-- ---------------------------------------------------------------------------

create policy users_select_co_shared
    on public.users
    for select
    to authenticated
    using (public.shares_questionnaire_with(id));

-- ---------------------------------------------------------------------------
-- share_questionnaire: owner-authoritative share/upsert by email.
-- Returns a status: 'shared' | 'not_found' | 'self' | 'forbidden'.
-- Any questionnaire status allowed; no collaborator cap.
-- ---------------------------------------------------------------------------

create or replace function public.share_questionnaire(
    p_questionnaire_id uuid,
    p_email text,
    p_role text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_owner uuid;
    v_target uuid;
    v_can_edit boolean;
begin
    if p_role not in ('editor', 'viewer') then
        raise exception 'Unknown role %', p_role;
    end if;

    select owner_id into v_owner
    from public.questionnaires
    where id = p_questionnaire_id;

    if v_owner is null or v_owner <> (select auth.uid()) then
        return 'forbidden';
    end if;

    select id into v_target
    from public.users
    where lower(email) = lower(trim(p_email))
    limit 1;

    if v_target is null then
        return 'not_found';
    end if;

    if v_target = v_owner then
        return 'self';
    end if;

    v_can_edit := (p_role = 'editor');

    insert into public.questionnaire_shares (questionnaire_id, user_id, can_edit, can_view_responses)
    values (p_questionnaire_id, v_target, v_can_edit, true)
    on conflict (questionnaire_id, user_id)
    do update set
        can_edit = excluded.can_edit,
        can_view_responses = excluded.can_view_responses;

    return 'shared';
end;
$$;

revoke all on function public.share_questionnaire(uuid, text, text) from public;
grant execute on function public.share_questionnaire(uuid, text, text) to authenticated;
