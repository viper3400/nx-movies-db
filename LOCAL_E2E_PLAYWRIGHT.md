# Local Playwright E2E Guide

These steps mirror the GitHub Actions workflow so that the end-to-end Playwright suite can be exercised on macOS.

## Prerequisites
- Node.js 22 with npm (managed by nvm, fnm, or a system install)
- Docker engine (Rancher Desktop works fine) with Compose v2

## One-Time Setup
```bash
npm ci
npx playwright install
```

## Test Run Steps
Execute the following commands from the repository root. Keep each long-running process in its own terminal.

### 1. Start the MySQL database
```bash
MYSQL_DATABASE=videodb MYSQL_ROOT_PASSWORD=password \
  docker compose -f development-db/docker-compose.ci.yaml up -d movies-service-db
```
Wait for the container's health check to pass (`docker compose -f development-db/docker-compose.ci.yaml ps`).

### 2. Launch the GraphQL service
```bash
DATABASE_URL=mysql://root:password@127.0.0.1:7200/videodb \
JWT_SECRET=qwertyuiopasdfghjklzxcvbnm123456 \
PORT=7100 \
npx nx serve movies-service --configuration=production --skip-nx-cache
```
Once it reports ready, confirm `curl http://127.0.0.1:7100/graphql` succeeds.

### 3. Launch the Next.js UI
```bash
cd apps/movies-ui
NEXT_PUBLIC_GRAPHQL_URL=http://127.0.0.1:7100/graphql \
NEXT_PUBLIC_NEXTAUTH_URL=/api/auth \
NEXT_PUBLIC_TEST_MODE=true \
NEXT_PUBLIC_ALLOWED_USERS="tester@example.com,Tester,1" \
TEST_MODE=true \
GITHUB_ID=dummy \
GITHUB_SECRET=dummy \
GOOGLE_CLIENT_ID=dummy \
GOOGLE_CLIENT_SECRET=dummy \
ALLOWED_USERS="tester@example.com,Tester,1" \
NEXT_OUTPUT=server \
npx next build
npx next start -p 3000
```
Verify `http://127.0.0.1:3000/movies` responds before moving on.

### 4. Run the Playwright tests
```bash
cd /path/to/nx-movies-db
E2E_BASE_URL=http://127.0.0.1:3000/movies \
npx playwright test -c apps/movies-ui/playwright.config.ts
```

## Teardown
Stop processes once the suite finishes.
```bash
# in each terminal running Next.js or the service
Ctrl+C

# from the repo root
pkill -f "node dist/apps/movies-service/main.js" || true
pkill -f "next start" || true
docker compose -f development-db/docker-compose.ci.yaml down -v
```

## Tips
- If a previous run failed midway, execute the teardown commands before starting again.
- Wrap the commands above in a helper script (inside `tools/`) if you want a single entry point.
- Keep `NEXT_PUBLIC_TEST_MODE` and `NEXT_PUBLIC_ALLOWED_USERS` set so the UI renders the stubbed session (navbar, menu, etc.) without real OAuth providers.
