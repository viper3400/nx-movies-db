# NX-MOVIES-DB

[Original NX Readme](NX_README.md)

## App Settings

All services now read from the workspace root `.env` (create it with `cp .env.example .env` and keep secrets out of git). For a complete matrix of variables, see [`CONFIG_README.md`](CONFIG_README.md).

### movies-service

| Setting | Description |
| --- | --- |
| `DATABASE_URL` | Prisma ORM connection string (also split into the discrete `DATABASE_*` values). |
| `JWT_SECRET` | Shared symmetric key for Yoga + UI proxy tokens. |
| `HOST` / `PORT` | Movies-service bind address (defaults `0.0.0.0:7100`). |

### movies-ui

| Setting | Description |
| --- | --- |
| `GRAPHQL_URL` | Internal Yoga endpoint the proxy forwards to. |
| `GRAPHQL_PROXY_URL` | Optional override for the `/api/graphql-proxy` route the Apollo client uses. |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth credentials. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials. |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | Required by NextAuth for JWT/session signing and callback URL resolution. |
| `JWT_SECRET` | Must match the backend value so the UI can mint API tokens. |
| `videodb_users.email` | Curated database email used to authorize a signed-in OAuth user. The same row supplies the owner ID and legacy user name. |
| `NEXT_PUBLIC_TEST_MODE`, `NEXT_PUBLIC_TEST_USERS` | Enable stub sessions for local runs. |
| `APP_BASE_PATH` | Next.js `basePath` value (e.g., `/movies`). |
| `COVER_IMAGE_PATH` | Filesystem folder containing cover images served by `/api/cover-image/[id]`. |
| `POSTER_IMAGE_PATH` | Filesystem folder containing poster/background images served by `/api/poster-image/[id]` and used for poster localization during metadata saves. |
| `TMDB_READ_ACCESS_TOKEN` | Private TMDB API read access token for the server-side metadata import workflow. |
| `TMDB_LANGUAGE` | Optional TMDB metadata language, for example `de-DE` or `en-US`. |
| `TMDB_COVER_IMAGE_SIZE` | Optional TMDB cover image size, defaulting to `w500`. |
| `TMDB_BACKGROUND_IMAGE_SIZE` | Optional TMDB background image size, defaulting to `w1280`. |
| `TMDB_IMAGE_SIZE` | Deprecated shared fallback for both image types; use the two settings above. |

**Example**

```
GRAPHQL_URL=http://127.0.0.1:7100/graphql
GRAPHQL_PROXY_URL=http://127.0.0.1:3000/api/graphql-proxy
GITHUB_ID=github-client-id
GITHUB_SECRET=github-client-secret
GOOGLE_CLIENT_ID=google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=google-client-secret
NEXTAUTH_SECRET=dev-nextauth-secret
NEXTAUTH_URL=http://127.0.0.1:3000/api/auth
JWT_SECRET=dev-jwt-secret
NEXT_PUBLIC_TEST_MODE=true
NEXT_PUBLIC_TEST_USERS="tester@example.com,Tester,2"
APP_BASE_PATH=/movies
COVER_IMAGE_PATH=./development-db/coverpics
POSTER_IMAGE_PATH=./development-db/background
TMDB_READ_ACCESS_TOKEN=tmdb-v3-read-access-token
TMDB_LANGUAGE=de-DE
TMDB_COVER_IMAGE_SIZE=w500
TMDB_BACKGROUND_IMAGE_SIZE=w1280
```

### Local OAuth user seed

Production access is controlled by `videodb_users.email`. To use a real OAuth provider against a freshly seeded local database, copy `development-db/local-seed.sql.example` to the gitignored `development-db/local-seed.sql`, add your OAuth email, then initialize a fresh database with:

```bash
npm run db:start:local
```

MySQL runs this optional local SQL file after the normal `seed/videodb.sql` import. To apply it again after a previous seed, recreate the database first with `npm run db:stop`.
# Setting Up the Development Database

This project includes a development database located in the `./seed` folder, which can be deployed to a MySQL database using the `docker-compose` file found in the `./development-db` folder.

Please make sure, ports 7200 and 7300 are available on your system or modify the `docker-compose.yaml`.

To run the example database, you need to provide at least the following environment variables:

```
MYSQL_DATABASE="db-name"
MYSQL_ROOT_PASSWORD="secret"
```

It is recommended to create an `.env` file in the `./development-db` folder to store these variables. Then, from the `./development-db` directory, run the following command:

```
docker-compose --env-file .env up
```

In addition to the MySQL container, a phpMyAdmin container is also included. To access it, open a web browser and navigate to `http://localhost:7300`. Use the username `root` and the password specified in your environment variable to log in to your database.
