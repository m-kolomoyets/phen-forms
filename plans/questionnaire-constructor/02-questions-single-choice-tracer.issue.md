# 02 — Questions + options (single-choice tracer)

## What to build

Add the question system end-to-end using **single_choice** as the tracer type. Creates
`questions` + `question_options` tables (with `type` enum, `config` JSONB, `position`,
`required`), the per-type zod schema module (deep, pure), the service layer, and a
builder question editor that lets an author add a single-choice question, edit its
options, mark it required, and reorder questions within a questionnaire.

Establishes the pattern every remaining type plugs into.

## Acceptance criteria

- [ ] Migration adds `question_type` enum, `questions`, `question_options` with cascade FKs, `unique(questionnaire_id, position)`, `unique(question_id, position)`; RLS via parent ownership. Types regenerated.
- [ ] Zod schema module validates single_choice config + answer shape; unit tests cover valid/invalid cases.
- [ ] Service `src/services/questions/*` (+ options) mirrors existing service pattern.
- [ ] Builder: author adds a single_choice question, adds/edits/removes options, toggles required, reorders questions; changes persist and reload correctly.
- [ ] Unit tests + `pnpm tsc` + lint pass.

## Blocked by

- Blocked by #01-questionnaire-crud
