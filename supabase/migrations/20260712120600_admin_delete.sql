-- Slice: admin deletes any questionnaire.
-- Additive DELETE policy gated on is_admin(). Unlike the owner DELETE policy (which
-- blocks deleting a live published questionnaire that has responses, to prevent an
-- owner wiping an active collection by accident), the admin path is unrestricted:
-- removing abusive or broken content is the whole point. Children (questions, options,
-- responses, answers) cascade via their FKs — the reject_if_locked trigger already
-- treats a parent-gone cascade as allowed. No independent response-delete is added.
--
-- Existing questionnaires_owner_delete is untouched.

create policy questionnaires_admin_delete
    on public.questionnaires
    for delete
    to authenticated
    using (public.is_admin());
