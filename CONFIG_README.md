# Configuration Overview

All runtime configuration now lives in the workspace root `.env` (copy `.env.example` to `.env` and optionally `.env.local`). Individual packages no longer ship their own committed `.env` files; Nx loads the root file for every target, while Prisma/Jest/Next read from the same process environment. The table below summarizes each variable, the project that owns its defaults, and where it is consumed in code.

| Variable | Project | Purpose | Primary Consumers |
| --- | --- | --- | --- |
| `DATABASE_URL` | movies-prisma-lib | Prisma datasource string for schema generation, migrations, and codegen. | `libs/movies-prisma-lib/prisma.config.ts:1` · `libs/movies-prisma-lib/jest.setup.ts:15` |
| `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_PORT` | movies-prisma-lib & movies-service | Low-level MariaDB connection settings shared by the custom Prisma adapter, Jest probes, and the Express GraphQL server (missing `DATABASE_HOST` aborts startup). | `libs/movies-prisma-lib/src/prismaclient.ts:5` · `libs/movies-prisma-lib/jest.setup.ts:21` · `apps/movies-service/src/main.ts:15` |
| `HOST`, `PORT` | movies-service | Control the bind address/port for movies-service and its REST e2e tests. | `apps/movies-service/src/main.ts:8` · `apps/movies-service-e2e/src/support/test-setup.ts:7` |
| `APP_VERSION` | movies-graphql-lib | Optional override for the version metadata response; defaults to `package.json` otherwise. | `libs/movies-graphql-lib/src/lib/version-metadata.ts:28` |
| `JWT_SECRET` | movies-graphql-lib & movies-ui | Shared symmetric key: Yoga validates API tokens with it and the UI proxy signer mints JWTs from it. | `libs/movies-graphql-lib/src/lib/create-yoga.ts:5` · `apps/movies-ui/src/lib/graphql-auth.ts:16` |
| `GITHUB_ID`, `GITHUB_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | movies-ui | OAuth credentials for NextAuth; the route throws if any pair is missing. | `apps/movies-ui/src/lib/auth.ts:8` · `apps/movies-ui/src/app/api/auth/[...nextauth]/route.ts:5` |
| `NEXTAUTH_SECRET` | movies-ui | Secret used by NextAuth for JWT/session signing; must match between UI builds and backend. | Implicit in `next-auth` runtime (required by `apps/movies-ui/src/app/api/auth/[...nextauth]/route.ts`) |
| `ALLOWED_USERS` | movies-ui | Semicolon-separated allowlist used for session gating and cover-image access. | `apps/movies-ui/src/lib/allowed-user-parser.ts:28` · `apps/movies-ui/src/app/services/actions/getAllowedSession.ts:7` |
| `TEST_MODE`, `NEXT_PUBLIC_TEST_MODE` | movies-ui | Enable stub sessions on server actions and hydrate a fake SessionProvider for UI test runs. | `apps/movies-ui/src/app/services/actions/getAllowedSession.ts:6` · `apps/movies-ui/src/app/provider.tsx:18` |
| `NEXT_PUBLIC_TEST_USERS` | movies-ui | Seeds fake user entries when test mode flags are enabled. | `apps/movies-ui/src/app/provider.tsx:19` · `apps/movies-ui/src/app/services/actions/getAllowedSession.ts:7` |
| `NEXTAUTH_URL` | movies-ui | Injected into the root layout so NextAuth callbacks resolve correctly during SSR. | `apps/movies-ui/src/app/layout.tsx:11` |
| `APP_BASE_PATH` | movies-ui | Sets Next.js `basePath` and is exposed via a server action for components needing it. | `apps/movies-ui/next.config.js:10` · `apps/movies-ui/src/app/services/actions/getAppBasePath.ts:3` |
| `GRAPHQL_URL` | movies-ui | Yoga endpoint the `/api/graphql-proxy` route forwards to. | `apps/movies-ui/src/app/api/graphql-proxy/route.ts:6` |
| `GRAPHQL_PROXY_URL` | movies-ui | Optional override for Apollo’s HTTP link, defaulting to `/api/graphql-proxy`. | `apps/movies-ui/src/lib/apollocient.ts:10` |
| `COVER_IMAGE_PATH` | movies-ui | Filesystem location for cover image assets served via `/api/cover-image/[id]`. Poster images are a separate filesystem-only concept and currently have no database/GraphQL configuration in this repo. | `apps/movies-ui/src/app/api/cover-image/[id]/route.ts:7` · `apps/movies-ui/src/app/services/actions/upsertVideoData.ts:196` |
| `TMDB_READ_ACCESS_TOKEN` | movies-ui | Private TMDB API read access token used as a bearer token by the server-side import workflow. Never expose it as a `NEXT_PUBLIC_*` variable. | `apps/movies-ui/src/app/services/actions/tmdbMetadata.ts:47` |
| `TMDB_LANGUAGE` | movies-ui | Optional TMDB search/detail language, for example `de-DE` or `en-US`; defaults to TMDB-compatible English when unset. | `apps/movies-ui/src/app/services/actions/tmdbMetadata.ts:55` |
| `TMDB_IMAGE_SIZE` | movies-ui | Optional TMDB image size used when building imported cover URLs; defaults to `w500`. | `apps/movies-ui/src/app/services/actions/tmdbMetadata.ts:56` |
| `NEXT_OUTPUT` | movies-ui | Chooses between `standalone`, `server`, or `export` outputs when building the UI. | `apps/movies-ui/next.config.js:15` |
| `E2E_BASE_URL` | movies-ui | Default base URL for Playwright UI tests. | `apps/movies-ui/playwright.config.ts:9` |
| `CI`, `NODE_ENV` | workspace-wide | `CI` increases Playwright retries; together they decide whether Prisma tests load `.env` or `.env.local`. | `apps/movies-ui/playwright.config.ts:7` · `libs/movies-prisma-lib/jest.setup.ts:9` |
