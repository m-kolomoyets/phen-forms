## What to build

Foundation slice: a typed Supabase client the rest of the app builds on. `createClient<Database>` in `src/lib/@supabase.ts` with native-session auth options, a hand-written stub `src/lib/database.types.ts` (a placeholder `users` table shaped like the generator's output so it regenerates cleanly), and env validation that requires the Supabase vars.

## Acceptance criteria

- [ ] `src/lib/@supabase.ts` calls `createClient<Database>(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })`.
- [ ] `src/lib/database.types.ts` exports a `Database` type with `public.Tables.users` (Row/Insert/Update) + empty `Views/Functions/Enums`.
- [ ] `envSchema` (`src/lib/schemas.ts`) requires `VITE_SUPABASE_URL` (url) + `VITE_SUPABASE_PUBLISHABLE_KEY`.
- [ ] `src/vite-env.d.ts` declares the two supabase vars; `.env.local.example` updated.
- [ ] `pnpm tsc` passes.

## Blocked by

- None - can start immediately.
