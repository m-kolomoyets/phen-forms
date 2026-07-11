-- Extend questionnaires to the full ERD: welcome screen, randomize flag, go-live marker.
-- Also expose published questionnaires to anonymous respondents (read-only structure).

alter table public.questionnaires
    add column randomize_questions boolean not null default false,
    add column show_welcome boolean not null default false,
    add column welcome_title text,
    add column welcome_description text,
    add column welcome_bg_url text,
    add column published_at timestamptz;

-- Anyone (no login) may read a published questionnaire's structure.
create policy questionnaires_anon_select_published
    on public.questionnaires
    for select
    to anon
    using (status = 'published');
