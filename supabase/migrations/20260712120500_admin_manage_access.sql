-- Slice: admin manages any access.
-- share_questionnaire's owner check becomes owner-or-admin (in-place edit — the RPC
-- is SECURITY DEFINER, so its own insert bypasses RLS). The direct-write collaborator
-- operations (change role, remove) go straight to questionnaire_shares, so they need
-- additive admin write policies. Existing owner-only share policies are untouched.

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

    -- Owner may always manage access; an admin may manage access on any questionnaire.
    if v_owner is null then
        return 'forbidden';
    end if;

    if v_owner <> (select auth.uid()) and not public.is_admin() then
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

-- Additive admin write policies for direct collaborator management.
create policy questionnaire_shares_admin_insert
    on public.questionnaire_shares
    for insert
    to authenticated
    with check (public.is_admin());

create policy questionnaire_shares_admin_update
    on public.questionnaire_shares
    for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

create policy questionnaire_shares_admin_delete
    on public.questionnaire_shares
    for delete
    to authenticated
    using (public.is_admin());
