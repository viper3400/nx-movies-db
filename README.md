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
| `ALLOWED_USERS` | Semicolon-delimited list (`email,name,id`) controlling access. |
| `NEXT_PUBLIC_TEST_MODE`, `NEXT_PUBLIC_TEST_USERS` | Enable stub sessions for local runs. |
| `APP_BASE_PATH` | Next.js `basePath` value (e.g., `/movies`). |
| `COVER_IMAGE_PATH` | Filesystem folder containing poster images. |

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
ALLOWED_USERS=jane@doe.com,Jane,3;john@example.org,John,4
NEXT_PUBLIC_TEST_MODE=true
NEXT_PUBLIC_TEST_USERS="tester@example.com,Tester,1"
APP_BASE_PATH=/movies
COVER_IMAGE_PATH=./development-db/coverpics
```
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
