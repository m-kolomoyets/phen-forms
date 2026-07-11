# 03 — Remaining question types

## What to build

Extend the question system to the other six types on top of slice 02's pattern:
`multiple_choice`, `short_text`, `long_text`, `yes_no`, `ranking`, `opinion_scale`.
This means widening the zod schema discriminated union, the builder editor's per-type
config UI, and answer-shape validation. Opinion scale supports customizable min/max
(default 1–10) with low/high labels; choice and ranking support a `shuffle_options`
flag.

No new tables — reuses `questions.config` and `question_options`.

## Acceptance criteria

- [ ] Zod schemas + config validation cover all 7 types (scale min<max, required labels where applicable, option-bearing types require ≥1 option); unit tests per type.
- [ ] Builder editor renders correct config controls per type: scale min/max/labels, shuffle toggle for choice/ranking, option editor for choice/ranking, none for text/yes-no.
- [ ] Each type persists and reloads correctly.
- [ ] Unit tests + `pnpm tsc` + lint pass.

## Blocked by

- Blocked by #02-questions-single-choice-tracer
