# Agent Guide

This file is the first stop for AI agents working in this repository. Prefer these notes over inferred conventions when they conflict with generated or stale docs.

## Repository Shape

`nx-movies-db` is an Nx TypeScript monorepo for a private movie collection app.

- `apps/movies-ui`: Next.js UI. It uses NextAuth, server actions, Apollo, HeroUI, and components from `shared-ui`.
- `apps/movies-service`: Express/Yoga GraphQL service.
- `libs/movies-graphql-lib`: GraphQL schema, Pothos objects/types, Yoga setup, and API behavior.
- `libs/movies-prisma-lib`: Prisma schema, generated client, and database access functions.
- `libs/shared-ui`: reusable React UI components and Storybook stories.
- `libs/shared-types`: cross-project TypeScript types.
- `libs/stocks-lib` and `libs/stocks-backend`: stock/importer code; do not mix this with movie app changes unless the task asks for it.

Primary request flow:

```text
movies-ui -> /api/graphql-proxy -> movies-service -> movies-graphql-lib -> movies-prisma-lib -> MySQL
```

## Hard Boundaries

- Do not hand-edit generated Prisma/Pothos output:
  - `libs/movies-prisma-lib/src/generated/**`
  - `libs/movies-graphql-lib/src/lib/graphql/pothos-prisma-types.ts`
- Regenerate Prisma/Pothos files with `npm run prisma:generate` after changing `libs/movies-prisma-lib/prisma/prisma.schema`.
- All movie database access should go through `movies-prisma-lib` and the GraphQL API boundary. UI code should not talk directly to Prisma or MySQL.
- Runtime configuration is rooted at `.env` / `.env.local`; `.env.example` is the committed template.
- Keep secrets out of commits.
- Do not broad-refactor naming drift between `video` and `movie` unless the task explicitly asks for that migration. The legacy MySQL schema still uses many `videodb_*` names.

## Nx Tags And Boundaries

Projects are tagged by `scope:*`, `type:*`, and sometimes `platform:*`. ESLint enforces these tags through `@nx/enforce-module-boundaries`.

- `scope:movies` may depend on `scope:movies` and `scope:shared`.
- `scope:stocks` may depend on `scope:stocks` and `scope:shared`.
- `scope:shared` may only depend on `scope:shared`.
- `type:app` is the outer layer and may depend on API, data-access, server, UI, shared, and type libraries.
- `type:api` may depend on data-access, shared, and type libraries.
- `type:data-access` should stay below API/UI and may depend only on shared and type libraries.
- `type:ui` may depend on UI, shared, and type libraries.
- `type:types` should remain dependency-light and may only depend on type libraries.

## Common Commands

Use root scripts where possible:

```bash
npm run lint
npm run build
npm run test
npm run test:ui
npm run test:db
npm run test:e2e
npm run storybook
npm run test:storybook
npm run prisma:generate
npm run prisma:format
npm run db:start
npm run db:ps
npm run db:stop
npm run dev:all
npm run build:all
npm run dev:service
npm run dev:ui
```

Notes:

- `npm run test` intentionally excludes DB-backed Prisma tests and service e2e tests.
- `npm run test:db` requires the local MySQL test database. See `docs/workflows/e2e.md` for the DB startup flow.
- `npm run test:e2e` expects the database, GraphQL service, and UI to already be running.
- For focused work, prefer direct Nx commands such as `npx nx run shared-ui:test` or `npx nx run movies-graphql-lib:test`.

## UI Conventions

- Shared/reusable components belong in `libs/shared-ui`; app-specific wiring belongs in `apps/movies-ui`.
- Storybook stories live next to shared UI components and are useful verification targets for visual changes.
- HeroUI `Input` and `Textarea` must use `onValueChange` instead of `onChange`; the ESLint config warns about this because of a composition issue.
- Keep app routes under `apps/movies-ui/src/app`.
- Use existing icons/components before adding new visual primitives.

## Backend And Data Conventions

- GraphQL schema work lives in `libs/movies-graphql-lib/src/lib/graphql`.
- Prisma access functions live in `libs/movies-prisma-lib/src/lib`.
- The Prisma schema is `libs/movies-prisma-lib/prisma/prisma.schema`.
- The development database is seeded from `seed/videodb.sql` through Docker Compose files under `development-db`.
- DB-backed tests usually need:
  - `DATABASE_URL`
  - `DATABASE_HOST`
  - `DATABASE_PORT`
  - `DATABASE_USER`
  - `DATABASE_PASSWORD`
  - `DATABASE_NAME`

## Documentation

- `README.md`: top-level setup and configuration summary.
- `CONFIG_README.md`: environment variable matrix.
- `docs/agent-prompt-template.md`: suggested prompt template for working with agents on this repo.
- `docs/workflows/ui-change.md`: focused workflow for UI, shared component, and Storybook changes.
- `docs/workflows/graphql-change.md`: focused workflow for API contract and GraphQL service changes.
- `docs/workflows/prisma-change.md`: focused workflow for Prisma schema and DB-backed changes.
- `docs/workflows/e2e.md`: focused workflow for local DB/service/UI/e2e runs.
- `docs/image-handling.md`: cover/poster image behavior.

## Working Style

- Use `rg` / `rg --files` for search.
- Prefer existing Nx targets and local patterns over new tooling.
- Keep changes scoped to the project involved in the task.
- If generated files change, mention the command that produced them.
- If a command requires a running DB, say so instead of treating the failure as a code failure.
