---
name: tech-articles
description: Generate article ideas and write compact developer-facing essays for LinkedIn and Twitter/X, mined from a real codebase's approaches, tradeoffs, and implementation decisions. Works in any repo (frontend or backend, any language). Use when the user wants article ideas, blog/post topics, LinkedIn posts, Twitter threads, or to turn project work into shareable technical writing.
---

# tech-articles

Turn real project work into shareable dev writing. Two phases: **ideate** (mine repo → ranked idea list) then **draft** (idea → tailored LinkedIn + Twitter output).

## First run in a repo

Read [voice-profile.md](voice-profile.md). If it still has placeholder values, ask the user to fill it once (name, niche, audience mix, hot-take stances, banned words). Voice profile = consistency across every repo and post. Never invent author facts.

## Phase 1 — Ideate

Trigger: user wants ideas / topics / "what could I write about".

1. Scan repo for **story material**, not features. Mine: non-obvious tradeoffs, decisions with a "why", things done differently than the default, migrations, failures/rewrites, patterns worth extracting. Sources: commit history, ADRs, config, unusual deps, custom abstractions, README, this project's CLAUDE.md/rules.
2. Produce 8–12 ideas. Each idea = one line table row: **Hook headline · angle · platform fit · repo evidence (file/commit)**.
3. Angle = one of the 4 signatures (see [DRAFTING.md](DRAFTING.md)): story-driven, teach-by-pattern, contrarian, real-code-tradeoff. Tag each.
4. Rank by *shareability × evidence strength*. Flag any idea with weak/no repo evidence — do not fabricate.

Output ideas as a compact table. Ask which to draft.

## Phase 2 — Draft

Trigger: user picks an idea (or supplies own topic).

1. Load [DRAFTING.md](DRAFTING.md) for structure + platform rules.
2. Re-read the specific repo evidence (real code/lines). Drafts MUST cite real decisions — no generic filler.
3. Produce **both** by default: LinkedIn compact essay + Twitter/X thread. Same core, format-tuned.
4. Apply voice-profile stances + banned words. End with the idea's differentiator angle carried through.

## Rules

- Compact essay = scannable, one idea per post, no fluff intro. Value in first 2 lines.
- Every claim traceable to something real in the repo. If unsure, ask or omit.
- No hype words, no emoji spam, no "in today's fast-paced world" openers.
- Keep the author's configured voice across posts. See [voice-profile.md](voice-profile.md).
