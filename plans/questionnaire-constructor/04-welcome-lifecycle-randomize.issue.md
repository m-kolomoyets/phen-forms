# 04 — Welcome screen + randomize + lifecycle

## What to build

Add presentation and lifecycle controls to the questionnaire: welcome screen columns
(`show_welcome`, `welcome_title`, `welcome_description`, `welcome_bg_url`),
`randomize_questions`, `published_at`, and the status transitions
draft → published → closed plus the `accepting_responses` pause toggle. Add the DB
**lock trigger** that rejects structural edits once any response exists (status/pause/
welcome-text edits still allowed).

## Acceptance criteria

- [ ] Migration adds welcome + randomize + `published_at` columns and the lock trigger; types regenerated.
- [ ] Builder: author edits welcome fields, toggles randomize, and can publish / pause / close a questionnaire.
- [ ] Publishing sets `status='published'` + `published_at`; closing stops acceptance.
- [ ] Lock trigger: after a response exists, editing a question fails while status/pause toggles still succeed (verify manually or via SQL until slice 05a adds responses).
- [ ] `pnpm tsc` + lint pass.

## Blocked by

- Blocked by #02-questions-single-choice-tracer
