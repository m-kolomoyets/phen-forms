-- Slice: admin views all questionnaires.
-- Additive permissive SELECT policies gated on is_admin(). Existing owner/editor/
-- viewer/share SELECT policies are untouched, so regular-user visibility is a
-- zero-line diff (Postgres OR-combines permissive policies). Users already got its
-- admin SELECT policy in an earlier slice.
--
-- The normal /questionnaires list is safe from this widening because it goes through
-- list_my_questionnaires() (explicitly scoped), not a plain select.

create policy questionnaires_admin_select
    on public.questionnaires
    for select
    to authenticated
    using (public.is_admin());

create policy questions_admin_select
    on public.questions
    for select
    to authenticated
    using (public.is_admin());

create policy question_options_admin_select
    on public.question_options
    for select
    to authenticated
    using (public.is_admin());

create policy responses_admin_select
    on public.responses
    for select
    to authenticated
    using (public.is_admin());

create policy answers_admin_select
    on public.answers
    for select
    to authenticated
    using (public.is_admin());

create policy questionnaire_shares_admin_select
    on public.questionnaire_shares
    for select
    to authenticated
    using (public.is_admin());
