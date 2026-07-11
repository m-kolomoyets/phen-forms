## What to build

Remove Mock Service Worker fully — no mock interception in dev or the bundle. MSW only mocked `users`, which now talks to Supabase, so nothing depends on it.

## Acceptance criteria

- [ ] `src/mocks/` (browser.ts, handlers.ts, api/users.ts) and `public/mockServiceWorker.js` deleted.
- [ ] `src/main.tsx`: `prepareMSW` removed; renders directly.
- [ ] `msw` uninstalled; `"msw"` key removed from `package.json`.
- [ ] `VITE_USE_MSW` removed everywhere (`main.tsx`, `vite-env.d.ts`, `.env.local.example`).
- [ ] `pnpm build` succeeds; no MSW network interception at runtime.

## Blocked by

- Blocked by #05-users-service-to-supabase-and-remove-ky
