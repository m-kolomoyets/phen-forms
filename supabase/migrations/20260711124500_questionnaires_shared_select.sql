-- Slice: shared card visibility.
-- Widen questionnaires SELECT so collaborators see questionnaires shared with
-- them. Additive permissive policy — Postgres OR-combines it with the existing
-- owner-only SELECT. has_share is the SECURITY DEFINER helper (bypasses the
-- shares RLS to avoid recursive policy evaluation).

create policy questionnaires_shared_select
    on public.questionnaires
    for select
    to authenticated
    using (public.has_share(id));
