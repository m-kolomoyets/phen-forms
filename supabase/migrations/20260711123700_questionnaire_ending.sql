-- Add ending (thank-you) screen fields, mirroring the welcome screen columns.

alter table public.questionnaires
    add column if not exists show_ending boolean not null default false,
    add column if not exists ending_title text,
    add column if not exists ending_description text,
    add column if not exists ending_bg_url text;
