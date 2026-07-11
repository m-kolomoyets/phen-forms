## What to build

Wire up type generation and the Supabase project so the app runs against a real backend. Adds a `gen:types` script and completes the dashboard/env prerequisites (Google provider, redirect URLs, real keys). HITL — requires Supabase dashboard access and project credentials.

## Acceptance criteria

- [ ] `package.json` script `"gen:types": "supabase gen types typescript --project-id $PROJECT_ID > src/lib/database.types.ts"` (supabase CLI available, e.g. devDependency or `pnpm dlx`).
- [ ] Google provider enabled in Supabase Auth dashboard; app origin added to redirect URLs.
- [ ] Real `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` set in `.env.local`; `PROJECT_ID` + access token available.
- [ ] `pnpm gen:types` runs and overwrites the stub `database.types.ts` once real tables exist.
- [ ] End-to-end: a real Google sign-in completes and lands on the dashboard.

## Blocked by

- Blocked by #01-typed-supabase-client-and-env
