# 06 — Results stats charts

## What to build

The owner's analytics view. Adds the `get_questionnaire_stats(questionnaire_id)`
owner-only SECURITY DEFINER RPC returning per-question aggregates, and a results route
that renders shadcn charts (Recharts) per question type: option counts/percentages for
choice, distribution + average for opinion scale, two-way split for yes/no, average
rank per item for ranking, and a list of text answers. Restricted to the owner's own
questionnaires.

## Acceptance criteria

- [ ] `get_questionnaire_stats` RPC returns correct aggregates per type; owner-only (non-owner denied).
- [ ] Integration tests for aggregate correctness + owner-only access.
- [ ] shadcn chart primitives installed; results route renders the right chart per question type and lists text answers.
- [ ] A non-owner cannot reach another user's results/stats.
- [ ] `pnpm tsc` + lint pass.

## Blocked by

- Blocked by #05a-submit-response-rpc
