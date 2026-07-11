# 07 — Raw table + CSV/XLSX export

## What to build

The owner's raw-data view and exports. Adds a deep, pure export module that turns
questions + fetched response rows into CSV (papaparse) and XLSX (SheetJS) outputs, a
raw table view of individual submissions on the results page, and CSV + XLSX export
buttons. Owner fetches raw `answers` via RLS; export runs client-side.

## Acceptance criteria

- [ ] `papaparse` + `xlsx` installed.
- [ ] Export module unit tests: correct columns/rows; edge cases — unanswered optional (blank), multi-select joined, ranking order rendered, comma/special-char escaping.
- [ ] Results page shows a raw table of responses (owner-only via RLS).
- [ ] CSV and XLSX export buttons download files matching the displayed data.
- [ ] Unit tests + `pnpm tsc` + lint pass.

## Blocked by

- Blocked by #05a-submit-response-rpc
