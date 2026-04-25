# E2E And Local Stack Workflow

Use this when running browser e2e tests or checking changes across the database, GraphQL service, and Next.js UI.

## Fast Mental Model

The local e2e stack has four moving parts:

- MySQL test database from `development-db/docker-compose.ci.yaml`.
- GraphQL service from `movies-service`.
- Next.js UI from `movies-ui`.
- Playwright tests from `apps/movies-ui/e2e`.

The request path is:

```text
Playwright -> movies-ui -> /api/graphql-proxy -> movies-service -> movies-prisma-lib -> MySQL
```

## Common Commands

Start the DB:

```bash
npm run db:start
```

Check DB container state:

```bash
npm run db:ps
```

Start the service and UI together:

```bash
npm run dev:all
```

Run UI e2e tests after the DB, service, and UI are ready:

```bash
npm run test:e2e
```

Stop and remove the DB volume:

```bash
npm run db:stop
```

## Environment Defaults

The helper scripts use the same local defaults as the CI-oriented e2e guide:

- `MYSQL_DATABASE=videodb`
- `MYSQL_ROOT_PASSWORD=password`
- DB compose file: `development-db/docker-compose.ci.yaml`

The app runtime still depends on `.env` / `.env.local`. Check `.env.example` and `CONFIG_README.md` when a service fails due to missing configuration.

## When To Use The Longer Guide

Use `LOCAL_E2E_PLAYWRIGHT.md` when you need the full manual flow, production-style Next.js build/start commands, or detailed teardown/debugging steps.

Use this short workflow when you need the normal agent/developer loop: DB up, app stack up, run Playwright, tear down DB.
