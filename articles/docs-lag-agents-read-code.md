# Docs lag reality — why I let AI agents read code, not docs

**Angle:** contrarian · **Evidence:** stale `README.md` (still lists MSW) vs `package.json`; `code-style.md` says "no test runner" despite Vitest + integration harness

---

## LinkedIn

My README still lists MSW as part of the stack. I deleted MSW months ago.

My code-style doc says "no test runner configured." I have Vitest and an integration suite that spins up a real Postgres.

Both docs are confidently wrong. And I'm in no rush to fix them.

Not because I'm lazy — okay, partly — but because docs that describe code are a second source of truth, and it drifts the moment you ship. The code moved. The prose didn't. It always ends this way.

Here's the shift agentic coding forced on me: my AI agents read the code, not the README. Point an agent at the actual imports, the actual config, the actual migrations, and it sees what's true right now. Point it at hand-written docs and you've handed it my best guess from three sprints ago.

So I invest where it pays: types, lint rules, tests, config that fail loudly when reality diverges. Executable truth. A stale sentence in a README hurts nobody reading the source. A stale type breaks the build.

Prose docs still matter — for *why*, not *what*. Intent, tradeoffs, the decision you'd otherwise relitigate. Let the code describe itself; write down only what the code can't say.

What's the most confidently-wrong sentence in your README right now?

#DeveloperExperience #AgenticCoding #TechnicalDebt #AIAssistedDevelopment #SoftwareEngineering

---

## Twitter / X

**1/**
My README lists a dependency I deleted months ago.

My style doc says "no test runner configured." I have Vitest + a Postgres integration suite.

Both confidently wrong. I'm in no rush to fix them. 👇

**2/**
Docs that describe code are a second source of truth. They drift the second you ship.

Code moved. Prose didn't. Ends this way every time.

**3/**
What agentic coding changed for me:

My AI agents read the code, not the README.

Point them at real imports/config/migrations → they see what's true now. Point them at prose → my best guess from 3 sprints ago.

**4/**
So I invest where it fails loudly:
types, lint rules, tests, config.

Executable truth. A stale README sentence hurts no one reading the source. A stale type breaks the build.

**5/**
Prose still matters — for WHY, not WHAT.

Intent, tradeoffs, the decision you'd relitigate otherwise. Let code describe itself. Write down only what it can't say.

**6/**
What's the most confidently-wrong sentence in your README right now?
