# Copilot instructions for petcare-app

This repo is a **pnpm workspace** with a React frontend and Netlify serverless backend. Prioritize changes that keep frontend types, API payload shapes, and database field mappings aligned.

## Build, test, and lint commands

Use **Node 20** and **pnpm >= 10**.

```bash
# install all workspace deps
pnpm install

# run app locally (frontend + functions via Netlify dev)
pnpm dev

# build frontend production bundle
pnpm build

# frontend lint
pnpm --filter ./frontend lint

# frontend tests
pnpm test:run
pnpm test:coverage

# run a single frontend test file
pnpm --filter ./frontend test:run -- src/hooks/use-pets.test.ts
pnpm --filter ./frontend test:run -- src/lib/api.test.ts

# run tests matching a single test name
pnpm --filter ./frontend test:run -- -t "translateApiError"

# netlify functions checks/tests
pnpm --filter ./netlify/functions build
pnpm --filter ./netlify/functions typecheck
pnpm --filter ./netlify/functions test:run

# run a single functions test file
pnpm --filter ./netlify/functions test:run -- test/auth.test.ts

# run functions tests matching a single test name
pnpm --filter ./netlify/functions test:run -- -t "Auth Handler"
```

## High-level architecture

| Layer | Main location | Notes |
| --- | --- | --- |
| Frontend app | `frontend/src` | React + Vite + TypeScript. `App.tsx` handles auth bootstrap, role-based dashboard routing, and app shell concerns. |
| Data fetching | `frontend/src/hooks` + `frontend/src/providers/QueryProvider.tsx` | TanStack Query is the default data path; hooks own query keys, mutations, and invalidation. |
| API client | `frontend/src/lib/api.ts` | Central Axios instance with auth header injection and shared error translation behavior. |
| Serverless API | `netlify/functions/*.ts` | One handler per resource (`auth`, `users`, `pets`, `appointments`, etc.), with manual route dispatch by method + path. |
| Shared backend utilities | `netlify/functions/utils` | DB pooling, auth guards, env validation, response helpers, and snake_case/camelCase mapping helpers. |
| Real-time notifications | `frontend/src/hooks/use-pusher.ts` + `netlify/functions/notifications.ts` + `netlify/functions/utils/notifications.ts` | Backend writes notifications and broadcasts `notification-created` on `user-{userId}` channels when Pusher is configured. |
| Data model | `schema.sql` | PostgreSQL schema with UUID PKs and `deleted_at` soft-delete columns across core entities. |
| Runtime wiring | `netlify.toml` | `/api/*` redirects to `/.netlify/functions/:splat`; local dev runs on port `8888` and proxies frontend dev server. |

End-to-end request flow is: UI component -> React Query hook -> `lib/api.ts` -> Netlify function -> PostgreSQL -> camelCase response -> UI cache/state refresh.

Auth/bootstrap flow is: `main.tsx` imports i18n -> `App.tsx` initializes demo localStorage data, restores session with `userAPI.getCurrentUser()`, and routes by `currentUser.userType`.

## Key conventions in this codebase

1. **Soft delete is the default lifecycle rule**: backend queries and endpoints usually filter with `deleted_at IS NULL` and mark records deleted instead of hard-deleting.
2. **Database fields are snake_case, API/frontend fields are camelCase**: backend handlers use `camelCaseRow(s)` helpers and explicit mappings (for example `appointment_type` -> `type`).
3. **Auth/authorization is centralized in backend utils**: use `requireAuth`, `requireRole`, and `requireAdmin` from `netlify/functions/utils/auth.ts` instead of ad-hoc checks.
4. **Frontend data access should go through React Query hooks**: add/update logic in `frontend/src/hooks/use-*.ts` (query keys + invalidation) rather than making direct component-level API calls.
5. **Environment scopes are split** (documented in README): root `.env` for server/tooling variables, `netlify/functions/.env` for local functions runtime, and `frontend/.env` for `VITE_*` client variables.
6. **Localization is built-in and expected**: text is translated via `react-i18next` (`frontend/src/i18n/index.ts`) with language persisted under `petcare:lang`.
7. **Functions use manual path normalization before route checks**: handlers strip both `/.netlify/functions/<name>` and `/api/<name>`, then use helpers like `parsePath` for `/:id` routes.
8. **Treat backend error strings as translation inputs**: UI maps server messages through `translateApiError` in `frontend/src/lib/api.ts`; changing backend error text can change user-visible copy and tests.
9. **User-listing permission has a deliberate exception**: `GET /users?userType=veterinarian` is available to any authenticated user (for scheduling flows); other `/users` list queries require admin.
