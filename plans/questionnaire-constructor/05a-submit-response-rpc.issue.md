# 05a — Responses backend + submit_response RPC

## What to build

The server-side response pipeline. Creates `responses` + `answers` tables with RLS
(owner SELECT via parent ownership; anon no direct access), and the
`submit_response(questionnaire_id, answers jsonb)` SECURITY DEFINER RPC (granted to
anon) that validates a submission and inserts it atomically.

Validation: questionnaire published + `accepting_responses`; every required question
answered; option ids belong to their question; opinion-scale values within `config`
bounds. On any failure the whole transaction rolls back. Returns `response_id`.

Verified via RPC integration tests against a real/local Postgres.

## Acceptance criteria

- [ ] Migration adds `responses`, `answers` (typed value cols + `value_options` JSONB), indexes, RLS; types regenerated.
- [ ] `submit_response` RPC inserts 1 response + N answers atomically and returns the id.
- [ ] Integration tests: happy path; rejects not-accepting / not-published / missing required / foreign option id / out-of-range scale; full rollback on failure.
- [ ] Integration/RLS test: anon cannot SELECT responses or draft structure; owner sees only own responses.
- [ ] Service wrapper for the RPC exists; `pnpm tsc` + lint pass.

## Blocked by

- Blocked by #03-remaining-question-types
- Blocked by #04-welcome-lifecycle-randomize
