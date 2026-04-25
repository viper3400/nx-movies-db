# Prisma Change Workflow

Use this when changing the Prisma schema, generated Prisma client, database access functions, or DB-backed behavior.

## Where To Work

- Prisma schema: `libs/movies-prisma-lib/prisma/prisma.schema`.
- Database access functions: `libs/movies-prisma-lib/src/lib`.
- Prisma client setup: `libs/movies-prisma-lib/src/prismaclient.ts`.
- Prisma test setup: `libs/movies-prisma-lib/jest.setup.ts`.
- Seed database: `seed/videodb.sql`.

## Generated Files

Do not hand-edit:

- `libs/movies-prisma-lib/src/generated/**`
- `libs/movies-graphql-lib/src/lib/graphql/pothos-prisma-types.ts`

After schema changes, run:

```bash
npm run prisma:generate
```

Use Prisma formatting when changing the schema:

```bash
npm run prisma:format
```

## Schema Naming

The legacy MySQL schema uses many `videodb_*` and `video` names. Do not rename broad areas from `video` to `movie` unless the task is explicitly a naming migration. Prefer narrow changes that preserve the current DB mapping.

## DB-Backed Tests

`npm run test:db` requires a running local MySQL test database and these environment variables:

- `DATABASE_URL`
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`

See `LOCAL_E2E_PLAYWRIGHT.md` for the Docker Compose startup flow used by local e2e tests.

## Useful Commands

```bash
npm run prisma:format
npm run prisma:generate
npm run lint
npm run test:db
npx nx run movies-prisma-lib:test
```
