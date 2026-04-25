# GraphQL Change Workflow

Use this when changing API fields, queries, mutations, Yoga setup, request context, or the contract between the UI and backend.

## Where To Work

- GraphQL schema and type registration: `libs/movies-graphql-lib/src/lib/graphql`.
- Yoga server setup: `libs/movies-graphql-lib/src/lib/create-yoga.ts`.
- Backend app entry point: `apps/movies-service/src/main.ts`.
- UI server actions calling GraphQL: `apps/movies-ui/src/app/services/actions`.
- Apollo client/proxy behavior: `apps/movies-ui/src/lib/apollocient.ts` and `apps/movies-ui/src/app/api/graphql-proxy/route.ts`.

## Data Boundary

The request path is:

```text
movies-ui -> /api/graphql-proxy -> movies-service -> movies-graphql-lib -> movies-prisma-lib -> MySQL
```

Keep database reads and writes in `movies-prisma-lib`. GraphQL code should shape the API contract and delegate persistence to the data-access library.

## Generated Types

Do not hand-edit:

- `libs/movies-graphql-lib/src/lib/graphql/pothos-prisma-types.ts`

If a GraphQL change depends on Prisma schema changes, update `libs/movies-prisma-lib/prisma/prisma.schema` and regenerate:

```bash
npm run prisma:generate
```

## Useful Commands

```bash
npm run lint
npx nx run movies-graphql-lib:test
npx nx run movies-service:test
npm run test:ui
```

If the change affects real DB behavior, run DB-backed tests with the local MySQL test database:

```bash
npm run test:db
```

For end-to-end UI/API coverage, use `LOCAL_E2E_PLAYWRIGHT.md`.
