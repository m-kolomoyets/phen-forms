# I deleted my REST backend for Supabase — the honest tradeoff

**Angle:** real-code-tradeoff / contrarian · **Evidence:** `plans/supabase-migration.prd.md` — removed MSW, ky, hand-rolled RBAC; native `persistSession`/`autoRefreshToken`; `onAuthStateChange` root sync; cross-tab logout

---

## LinkedIn

I deleted my backend. Not refactored — deleted.

The app started as a typical SPA: a REST client (`ky`), mock handlers (MSW), a hand-rolled token-refresh queue, and my own role-based access control. Standard frontend plumbing. Hundreds of lines I wrote and had to defend.

I replaced all of it with Supabase. Here's the honest tradeoff.

**What I gave up:** a vendor boundary. My data layer now speaks Postgres and RLS (row-level security — access rules that live in the database), not a REST contract I control. That's real lock-in, and I'm naming it.

**What I got back:** the plumbing stopped being my problem.

- Session refresh — native `persistSession` + `autoRefreshToken`. My manual 401-retry queue: gone.
- Auth state — one `onAuthStateChange` listener at the app root syncs the query cache and the router. No `useEffect` scattered across screens chasing login status.
- Cross-tab logout — free, because the client owns the session.
- RBAC — deleted. It's now signed-in vs not, and row rules live in the database where a crafted request can't bypass them.

The frontend collapsed to a single I/O path. Fewer moving parts I own means fewer bugs that are mine to fix.

For a solo builder or small team, "the backend is a library I import" beats "the backend is a service I babysit" more often than we admit. Big teams with real backend needs — different math.

When did you last delete a layer instead of adding one?

#Supabase #Frontend #ReactJS #SoftwareArchitecture #DeveloperExperience

---

## Twitter / X

**1/**
I deleted my backend. Not refactored — deleted.

REST client, mock handlers, a token-refresh queue, my own RBAC. Gone.

Replaced with Supabase. The honest tradeoff 👇

**2/**
What I gave up: a vendor boundary.

My data layer now speaks Postgres + RLS, not a REST contract I control. Real lock-in. Naming it.

**3/**
What I got back — session refresh:

native persistSession + autoRefreshToken.

My hand-rolled 401-retry queue? Deleted.

**4/**
Auth state:

one onAuthStateChange listener at the app root syncs the query cache + router.

No useEffect scattered across screens chasing login status. (useEffect is overused. exhibit A.)

**5/**
Cross-tab logout: free — the client owns the session.

RBAC: deleted. Now it's signed-in vs not, and row rules live in the DB. A crafted request can't bypass them.

**6/**
The frontend collapsed to one I/O path.

Fewer moving parts I own = fewer bugs that are mine to fix.

**7/**
"Backend is a library I import" beats "backend is a service I babysit" more often than we admit.

Solo/small team: yes. Big team with real backend needs: different math.

When did you last delete a layer instead of adding one?
