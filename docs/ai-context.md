# AI Project Context — nx-movies-db

## 🏗️ Overview
This repository is an **Nx monorepo** named `nx-movies-db`.  
It’s structured for a modern full-stack web application using:
- **Next.js** (for frontend apps)
- **React** (for component libraries)
- **Vite** (for fast builds and development)
- **Jest** (for unit testing)
- **Storybook** (for UI component development)
- **TailwindCSS** (for styling)
- **ESLint** (for linting and code quality)

Nx plugins manage most of the build, serve, and test logic.

##  Context

This repository contains a tool for managing private movie collections. It uses Prisma as the ORM to interact with a MySQL database. A Yoga GraphQL server provides the API consumed by a Next.js application. All database access occurs exclusively through GraphQL.

User authentication in the Next.js app is handled via NextAuth, while the GraphQL API uses JWT bearer tokens for authentication.

---

## ⚙️ Nx Configuration Summary
### Named Inputs
- **default:** Includes all files in a project (`{projectRoot}/**/*`) + shared globals.
- **production:** Builds on `default` but excludes:
  - Tests (`*.spec.ts(x)?`, `*.test.ts(x)?`, `.snap`)
  - Storybook configs and stories
  - Lint configs (`.eslintrc`, `eslint.config.*`)
  - Jest configs and test setup files
  - Storybook tsconfigs
- **sharedGlobals:** Includes `.github/workflows/ci.yml`

These settings ensure clean and optimized production builds.

---

### Cloud Connectivity
- `"neverConnectToCloud": true`  
  → Nx Cloud is explicitly disabled; caching and task execution are local.

---

### Target Defaults
For build tools:
- **@nx/esbuild:esbuild** and **@nx/js:tsc**
  - `cache: true`
  - `dependsOn: ["^build"]` → child projects depend on parent builds
  - `inputs: ["production", "^production"]` → use production inputs for builds

---

### Plugins Used
| Plugin | Purpose | Targets / Options |
|---------|----------|------------------|
| **@nx/eslint/plugin** | Linting integration | Target name: `lint` |
| **@nx/jest/plugin** | Unit testing setup | Target: `test`; excludes `apps/movies-service-e2e/**/*` |
| **@nx/next/plugin** | Next.js integration | Targets: `start`, `build`, `dev`, `serve-static` |
| **@nx/react/router-plugin** | React app routing + dependency handling | Targets: `build`, `dev`, `start`, `watch-deps`, `build-deps`, `typecheck` |
| **@nx/vite/plugin** | Vite integration | Targets: `build`, `test`, `serve`, `dev`, `preview`, `serve-static`, `typecheck`, `build-deps`, `watch-deps` |
| **@nx/storybook/plugin** | Storybook setup for component dev/testing | Targets: `storybook`, `build-storybook`, `test-storybook`, `static-storybook` |

---

### Generators Configuration
| Plugin | Generator | Defaults |
|---------|------------|-----------|
| **@nx/next** | `application` | `style: tailwind`, `linter: eslint` |
| **@nx/react** | `library` | `unitTestRunner: jest` |

This means:
- New Next.js apps come pre-configured with **TailwindCSS** and **ESLint**.
- New React libs are generated with **Jest** tests by default.

---

## 🧩 Typical Structure (expected)
Although `nx.json` doesn’t show the file tree, a standard structure would look like:

nx-movies-db/
├── apps/
│   ├── movies-service/              # Example backend or Next.js app
│   ├── movies-service-e2e/          # E2E tests (excluded from Jest plugin)
├── libs/
│   ├── shared-ui/                   # React component library
│   ├── data-access/                 # Shared API or DB access code
│   ├── utils/                       # Shared utilities
├── tools/
│   ├── scripts/                     # Custom Nx scripts or generators
├── .github/workflows/ci.yml         # Shared CI workflow (global input)
└── nx.json

---

## 🧠 Development Notes
- **Caching:** Enabled for builds and tests to speed up repeated runs.
- **Testing:** Jest is the default unit test runner; Storybook also supports isolated component tests.
- **Linting:** ESLint configured across projects; Nx plugin integrates automatically.
- **Styling:** TailwindCSS integrated for all Next.js apps.
- **Isolation:** E2E tests for `movies-service` are intentionally excluded from Jest runs.

---

## 🚀 Common Nx Commands
| Command | Purpose |
|----------|----------|
| `nx build <project>` | Build a given project (uses plugin-specific builder) |
| `nx serve <project>` | Run dev server (Next.js / Vite) |
| `nx test <project>` | Run Jest unit tests |
| `nx lint <project>` | Run ESLint |
| `nx storybook <project>` | Start Storybook UI environment |
| `nx affected:build` | Build only changed projects |
| `nx graph` | Visualize dependency graph |

---

## 🧩 Summary
This Nx monorepo is optimized for **full-stack React/Next.js development** with:
- Local-only builds and caching (no Nx Cloud)
- Unified linting and testing setup
- Plugin-driven task definitions for Next.js, React, Vite, Jest, and Storybook
- TailwindCSS styling out-of-the-box for frontend apps

# nx-movies-db context snapshot (2025-10-20T08:42Z)
## Projects
next-stack-auth-example
movies-graphql-lib
movies-service-e2e
movies-prisma-lib
movies-service
stocks-backend
shared-types
cli-helper
stocks-lib
movies-ui
shared-ui
workspace

## Folder structure (2 levels)
.
./.husky
./.husky/_
./seed
./tools
./tools/docs
./staging
./staging/phpmyadmin
./staging/db
./target
./target/site
./docs
./libs
./libs/stocks-lib
./libs/shared-types
./libs/stocks-backend
./libs/movies-prisma-lib
./libs/movies-graphql-lib
./libs/shared-ui
./development-db
./development-db/phpmyadmin
./development-db/db
./.github
./.github/workflows
./playwright-report
./.git
./.git/objects
./.git/info
./.git/logs
./.git/hooks
./.git/refs
./.git/lfs
./.vscode
./test-results
./test-results/serenity
./.nx
./.nx/cache
./.nx/workspace-data
./tmp
./tmp/cli-helper
./tmp/libs
./tmp/movies-service
./tmp/apps
./apps
./apps/movies-service-e2e
./apps/movies-ui
./apps/cli-helper
./apps/movies-service
./apps/next-stack-auth-example

## Key package.json info
{
  "name": "@nx-movies-db/source",
  "scripts": {},
  "deps": {
    "dependencies": {
      "@storybook/addon-styling-webpack": "^2.0.0",
      "next": "^15.5.2",
      "next-auth": "^4.24.11",
      "next-themes": "^0.4.3",
      "react": "19.2.0",
      "react-dom": "19.2.0",
      "react-i18next": "^16.0.0"
    },
    "devDependencies": {
      "@nx/esbuild": "21.6.5",
      "@nx/eslint": "21.6.5",
      "@nx/eslint-plugin": "21.6.5",
      "@nx/jest": "21.6.5",
      "@nx/js": "21.6.5",
      "@nx/next": "21.6.5",
      "@nx/node": "21.6.5",
      "@nx/react": "21.6.5",
      "@nx/storybook": "21.6.5",
      "@nx/vite": "21.6.5",
      "@nx/web": "21.6.5",
      "@nx/workspace": "21.6.5",
      "@storybook/addon-docs": "^9.0.14",
      "@storybook/nextjs-vite": "^9.0.14",
      "@storybook/test-runner": "^0.23.0",
      "@testing-library/dom": "10.4.1",
      "@testing-library/react": "16.3.0",
      "@vitejs/plugin-react": "^5.0.0",
      "@vitest/ui": "^3.0.0",
      "eslint": "~9.38.0",
      "eslint-config-next": "15.5.6",
      "eslint-config-prettier": "^10.0.0",
      "eslint-plugin-import": "2.32.0",
      "eslint-plugin-jsx-a11y": "6.10.2",
      "eslint-plugin-react": "7.37.5",
      "eslint-plugin-react-hooks": "7.0.0",
      "eslint-plugin-storybook": "9.1.13",
      "eslint-plugin-unused-imports": "^4.1.4",
      "jest": "30.2.0",
      "jest-environment-jsdom": "30.2.0",
      "jest-environment-node": "^30.0.0",
      "jest-util": "^30.0.2",
      "nx": "21.6.5",
      "tailwindcss": "^4.1.11",
      "typescript": "~5.9.0",
      "typescript-eslint": "^8.19.0",
      "vite": "^7.0.0",
      "vite-plugin-dts": "~4.5.0",
      "vitest": "^3.0.0"
    }
  }
}

## CI Workflows
ci.yml
clean-workflows.yml

---

> **Tip:** You can re-upload this `docs/ai-context.md` file to ChatGPT anytime and say:  
> “Use this as context for my Nx project before answering my questions.”

