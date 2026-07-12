-- Slice: admin transfers ownership.
-- The ONLY path that changes questionnaires.owner_id (the admin UPDATE policy stays
-- owner-pinned). SECURITY DEFINER so it can reassign ownership while bypassing the
-- owner-pin; gated on is_admin(). Clean swap:
--   * owner_id -> new_owner
--   * delete new_owner's now-redundant share row (they own it, a share is meaningless)
--   * the previous owner simply loses access (admin can re-share explicitly if needed)
-- Runs in one statement-list inside the function body -> atomic within the call.
-- Returns a status: 'transferred' | 'forbidden' | 'not_found' | 'no_user' | 'noop'.

create or replace function public.admin_transfer_ownership(
    p_questionnaire_id uuid,
    p_new_owner uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_current_owner uuid;
    v_user_exists boolean;
begin
    if not public.is_admin() then
        return 'forbidden';
    end if;

    select owner_id into v_current_owner
    from public.questionnaires
    where id = p_questionnaire_id;

    if v_current_owner is null then
        return 'not_found';
    end if;

    select exists (select 1 from public.users u where u.id = p_new_owner) into v_user_exists;

    if not v_user_exists then
        return 'no_user';
    end if;

    if v_current_owner = p_new_owner then
        return 'noop';
    end if;

    update public.questionnaires
    set owner_id = p_new_owner
    where id = p_questionnaire_id;

    delete from public.questionnaire_shares
    where questionnaire_id = p_questionnaire_id and user_id = p_new_owner;

    return 'transferred';
end;
$$;

revoke all on function public.admin_transfer_ownership(uuid, uuid) from public;
grant execute on function public.admin_transfer_ownership(uuid, uuid) to authenticated;
