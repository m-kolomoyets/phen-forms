# Questionnaire Constructor — PRD

> Database ERD: [`docs/database-erd.md`](../docs/database-erd.md).

## Problem Statement

Logged-in users need to build and share surveys, but the app is currently an empty
admin template — there is no way to construct a questionnaire, publish it, collect
answers from the public, or analyze the results. Users have no tool to author varied
question types, control ordering, gather anonymous responses at scale, or turn those
responses into charts and exportable data.

## Solution

A questionnaire constructor. Authenticated users build multi-step questionnaires from
seven question types, mark questions required or optional, order them or randomize
them, and add an optional welcome screen. Publishing produces a public URL that
**anyone** (no login) can open and answer. Every submission is stored. The owner sees
per-question statistics as charts and a raw table, and exports the data to CSV and
XLSX.

## User Stories

### Authoring
1. As a logged-in user, I want to create a new questionnaire with a title and description, so that I can start building a survey.
2. As an author, I want my questionnaire to start as a draft, so that the public cannot see it before it is ready.
3. As an author, I want to add a short-text question, so that I can collect brief free-form answers.
4. As an author, I want to add a long-text question, so that I can collect detailed free-form answers.
5. As an author, I want to add a single-choice question with options, so that respondents pick exactly one.
6. As an author, I want to add a multiple-choice question with options, so that respondents pick several.
7. As an author, I want to add a yes/no question, so that I can ask binary questions.
8. As an author, I want to add a ranking question with items, so that respondents order them by preference.
9. As an author, I want to add an opinion-scale question defaulting to 1–10, so that respondents rate on a scale.
10. As an author, I want to customize the opinion-scale min and max, so that I can use ranges other than 1–10.
11. As an author, I want to label the low and high ends of an opinion scale, so that respondents understand what the extremes mean.
12. As an author, I want to add option items to choice and ranking questions, so that respondents have concrete choices.
13. As an author, I want to mark any question as required or optional, so that I control which answers are mandatory.
14. As an author, I want to reorder questions, so that they appear in the sequence I intend.
15. As an author, I want to toggle random question order for the whole questionnaire, so that I reduce ordering bias.
16. As an author, I want to toggle shuffled options on a choice/ranking question, so that I reduce option-position bias.
17. As an author, I want to add a welcome screen with a title and description, so that respondents get context before starting.
18. As an author, I want to optionally set a background image URL for the welcome screen, so that it looks branded.
19. As an author, I want to edit any part of a draft freely, so that I can iterate before publishing.
20. As an author, I want to publish a questionnaire, so that it becomes available at a public URL.
21. As an author, I want to stop accepting responses without deleting the questionnaire, so that I can pause collection.
22. As an author, I want to close a questionnaire, so that it no longer accepts responses.
23. As an author, I want the questionnaire structure to lock once the first response arrives, so that existing responses stay consistent with the questions.
24. As an author, I want to duplicate a questionnaire, so that I can make a revised version after responses have started. *(see Out of Scope for v1 caveat)*
25. As an author, I want to see a list of all my questionnaires with their status and response counts, so that I can manage them.
26. As an author, I want only my own questionnaires visible to me, so that other users cannot see or edit them.

### Responding (public, anonymous)
27. As any visitor, I want to open a published questionnaire's URL without logging in, so that I can answer it.
28. As a respondent, I want to see the welcome screen first when present, so that I understand the survey before starting.
29. As a respondent, I want to answer each question in an appropriate input for its type, so that answering is natural.
30. As a respondent, I want required questions enforced before I can submit, so that I don't accidentally skip them.
31. As a respondent, I want questions/options shown in randomized order when the author enabled it, so that the survey behaves as designed.
32. As a respondent, I want the questionnaire paginated (step through questions), so that long surveys feel manageable.
33. As a respondent, I want my whole submission saved atomically, so that partial/corrupt submissions never occur.
34. As a respondent, I want a confirmation after submitting, so that I know it worked.
35. As a respondent, I want to be blocked from answering a draft or closed questionnaire, so that I only answer live ones.

### Analyzing & exporting
36. As an author, I want per-question statistics after responses come in, so that I can understand results.
37. As an author, I want choice questions shown as counts/percentages per option in a chart, so that I see the distribution.
38. As an author, I want opinion-scale questions shown as a distribution plus average, so that I gauge sentiment.
39. As an author, I want yes/no questions shown as a two-way split, so that I see the balance.
40. As an author, I want ranking questions shown by average rank per item, so that I see overall preference.
41. As an author, I want text answers listed, so that I can read qualitative feedback.
42. As an author, I want a raw table view of all responses, so that I can inspect individual submissions.
43. As an author, I want to export responses to CSV, so that I can process them elsewhere.
44. As an author, I want to export responses to XLSX, so that I can open them in a spreadsheet.
45. As an author, I want stats and exports restricted to my own questionnaires, so that response data stays private.
46. As a respondent, I want my raw answers never readable by other visitors, so that my responses stay private.

## Implementation Decisions

### Data model (see ERD)
- Six tables: `questionnaires`, `questions`, `question_options`, `responses`, `answers`, plus existing `users`.
- `questions` is polymorphic: `type` enum + shared columns + `config` JSONB for type-specific settings (`scale_min`, `scale_max`, `min_label`, `max_label`, `shuffle_options`). No per-type tables.
- `question_options` normalized so answers reference stable option ids.
- `answers` uses typed columns (`value_text`, `value_number`) + `value_options` JSONB. Encoding per type documented in the ERD.
- Lifecycle: `status` = draft → published → closed; `accepting_responses` bool; `randomize_questions` bool; welcome fields inline nullable.
- **No versioning.** Structure locks (DB trigger) once the first response exists; editing a live survey means duplicating it.

### Security / access
- Full RLS on every table. Owner (`owner_id = auth.uid()`) has full CRUD on their questionnaires and children and SELECT on their responses/answers.
- Anonymous (public key) may SELECT only published structure and has **no** direct read/write on responses.
- Writes from the public go exclusively through a SECURITY DEFINER RPC.

### RPCs (deep modules)
- **`submit_response(questionnaire_id, answers jsonb)`** — anon-executable, SECURITY DEFINER. Server-authoritative validation (accepting + published, required answered, option ids belong to their question, scale within bounds) + atomic insert of `responses` + `answers`. Returns `response_id`.
- **`get_questionnaire_stats(questionnaire_id)`** — owner-only, SECURITY DEFINER. Returns per-question aggregated JSON for charts.

### Frontend modules
- **Answer/config zod schemas** (deep, pure) — one discriminated-union schema keyed by question type; validates authoring config and mirrors server-side answer validation for UX. Reused by builder, fill-in, and RPC payload construction.
- **Export module** (deep, pure) — takes questions + response rows, produces CSV (papaparse) and XLSX (SheetJS) buffers. UI-agnostic.
- **Services** — per-domain `api.ts` / `queries.ts` / `queryKeys.ts` / `types.ts` mirroring `src/services/users/*`, using the typed Supabase client and TanStack Query factories. Domains: questionnaires, questions, responses, stats.
- **Builder UI** — authenticated routes: list + create/edit; question editor built on the existing `useAppForm` composition. Per-type config fields, option-list editor, ordering, required/randomize toggles, welcome fields, publish/close/pause actions.
- **Public fill-in UI** — new public route; loader fetches published structure via anon SELECT, renders per-type answer components, applies shuffle when flagged, validates with zod client-side, submits via the `submit_response` RPC, shows a thank-you screen.
- **Results UI** — authenticated route: shadcn charts (Recharts) fed by `get_questionnaire_stats`, raw table from fetched answers, CSV + XLSX export buttons using the export module.

### Libraries
- Charts: shadcn chart primitives (Recharts). Export: `papaparse` (CSV) + `xlsx` / SheetJS. Existing stack (TanStack Router/Query/Form, zod 4, Supabase client) reused as-is.

### Types workflow
- Schema changes via Supabase migration (aligning with the remote-managed workflow already in the repo); regenerate `src/lib/database.types.ts` via `pnpm gen:types` after each migration.

## Testing Decisions

Good tests assert **external behavior**, not implementation details — given inputs,
assert outputs/effects, so refactors don't break them. Prior art: existing service +
zod-schema conventions in `src/services/*` and `src/lib/schemas.ts`.

Covered:
- **Answer/config zod schemas (unit)** — for each of the 7 types: valid config accepted; invalid rejected (e.g. scale where min ≥ max, missing labels); valid answers accepted and malformed answers rejected (wrong option id, out-of-range scale, missing required).
- **Export module (unit)** — questions + rows → correct CSV columns/rows and XLSX sheet; edge cases: unanswered optional questions (blank cells), multi-select joined values, ranking order rendered, special characters/commas escaped.
- **RPC integration tests (against a real/local Postgres)**:
  - `submit_response`: happy path inserts 1 response + N answers atomically; rejects when not accepting / not published; rejects missing required; rejects option id from another question; rejects out-of-range scale; rolls back fully on any validation failure.
  - `get_questionnaire_stats`: correct aggregates per type; owner-only enforced (non-owner denied).
  - RLS + lock trigger: anon cannot SELECT responses or drafts; structural edit fails once a response exists while status/pause toggles still succeed.

Not covered in v1: Builder and public fill-in UI flow tests (unit-only on pure modules; manual E2E verification instead).

## Out of Scope

- Questionnaire versioning / snapshots (edit-after-response = duplicate; the "duplicate" action itself is a nice-to-have, not required for v1 correctness).
- Multi-step **sections** with their own titles (flat position-ordered list; client paginates).
- Anti-abuse / rate limiting / repeat-submission prevention (open, unlimited submissions).
- Public "live results" pages (stats are owner-only).
- Image upload / storage (welcome background is a URL only).
- Email/password auth, collaborators, team ownership (single-owner, Google OAuth only).
- Conditional logic / branching, answer piping, i18n of questionnaires.

## Further Notes

- The DB is remote-managed (no local `supabase/` project in-repo); a prior migration was already executed. Use the `supabase` skill and align new migrations with that workflow, then regenerate types.
- Randomization is a render-time concern only; canonical `position` is always stored so statistics stay stable regardless of the order a respondent saw.
- `yes_no` is stored as text `'yes'|'no'`; opinion scale as a number — keeping stats aggregation straightforward.
