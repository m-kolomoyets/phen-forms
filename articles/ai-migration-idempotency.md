# My AI agent committed the same migration 3× — idempotency saved it

**Angle:** story-driven · **Evidence:** `supabase/migrations/20260711131000_…`, `…131001_…`, `…131002_…` (byte-identical), commit `728f107`

---

## LinkedIn

My AI coding agent committed the same database migration three times.

Same SQL. Three filenames — only the timestamp changed: `131000`, `131001`, `131002`. All in one commit. CI stayed green.

Here's why nothing broke: the migration was idempotent. `create or replace function`, `drop policy if exists … create policy`. Run it once or five times, you land on the same schema.

The agent wasn't being clever. It hit a remote database that had already partly applied my changes, couldn't edit history in place, so it did the cheap thing — bump the timestamp and retry. Timestamps are free. `create or replace` hides duplication. The loop ran three times and passed.

I could call that a bug. I'd rather call it a stress test I didn't write.

The lesson isn't "watch your agent." It's "make the operation safe to repeat, and repetition stops being a failure mode." Idempotent migrations turn a messy retry into a no-op. That property is what let an autonomous tool flail without touching prod.

Design for re-runs. Then it stops mattering who — or what — runs it twice.

Would you have caught the duplicate in review, or would three green checks have waved it through?

#PostgreSQL #Supabase #AIAssistedDevelopment #DatabaseMigrations #DeveloperExperience

---

## Twitter / X

**1/**
My AI coding agent committed the same database migration three times.

Same SQL. Three timestamps: 131000, 131001, 131002. One commit. CI green.

Nothing broke. Here's why 👇

**2/**
The migration was idempotent.

create or replace function
drop policy if exists … create policy

Run it once or five times → same schema. No error on repeat.

**3/**
The agent wasn't clever. It hit a remote DB that had already partly applied the change, couldn't rewrite history, so it did the cheap thing: bump the timestamp, retry.

Timestamps are free. create or replace hides duplication.

**4/**
I could call that a bug.

I'd rather call it a stress test I didn't write. Three runs, zero drift — because the operation was safe to repeat.

**5/**
The lesson isn't "watch your agent."

It's: make the operation safe to repeat, and repetition stops being a failure mode.

**6/**
Design for re-runs. Then it stops mattering who — or what — runs it twice.

Would three green checks have waved this through your review?
