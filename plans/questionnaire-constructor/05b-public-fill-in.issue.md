# 05b — Public fill-in UI

## What to build

The anonymous respondent experience. A public (no-auth) route loads a published
questionnaire's structure via anon SELECT, shows the welcome screen when present, then
paginates through questions rendering the correct input per type. It applies question/
option shuffling when the author enabled it, validates required answers client-side with
the shared zod module, submits via the `submit_response` RPC, and shows a thank-you
screen. Drafts/closed questionnaires are not answerable.

## Acceptance criteria

- [ ] Public route renders a published questionnaire without login; welcome screen shown when `show_welcome`.
- [ ] Each of the 7 types renders an appropriate answer input; pagination steps through questions.
- [ ] Randomization applied at render when flagged; canonical order untouched in storage.
- [ ] Required answers enforced before submit; submission goes through `submit_response` and shows a confirmation.
- [ ] Opening a draft or closed questionnaire is blocked with a clear message.
- [ ] `pnpm tsc` + lint pass.

## Blocked by

- Blocked by #05a-submit-response-rpc
