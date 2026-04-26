# UI Change Workflow

Use this when changing pages, app-level UI behavior, shared React components, styling, or Storybook stories.

## Where To Work

- App routes and app-specific wiring: `apps/movies-ui/src/app`.
- App-only components: `apps/movies-ui/src/components`.
- Reusable components: `libs/shared-ui/src/components`.
- Shared UI stories: `libs/shared-ui/src/components/*.stories.tsx`.
- Shared UI exports: `libs/shared-ui/src/index.ts` and `libs/shared-ui/src/components/index.ts`.

Prefer `shared-ui` only when the component is reusable outside one app route. Keep route-specific data loading and server actions in `movies-ui`.

## Data And Auth Boundaries

- UI code should not import Prisma or talk directly to MySQL.
- UI data should flow through server actions and the GraphQL proxy.
- Server actions live in `apps/movies-ui/src/app/services/actions`.
- Auth/session behavior is documented in `docs/authentication.md`.

## Component Conventions

- HeroUI `Input` and `Textarea` must use `onValueChange`, not `onChange`.
- Use existing shared components and icons before adding new primitives.
- Keep app routes under the Next.js app router in `apps/movies-ui/src/app`.
- Add or update Storybook stories for reusable `shared-ui` components when behavior or visual states change.

## Useful Commands

```bash
npm run lint
npm run test:ui
npx nx run shared-ui:test
npx tsc --noEmit -p libs/shared-ui/tsconfig.storybook.json
npm run storybook
npm run test:storybook
```

## Typecheck Coverage

- Run the TypeScript config that includes every touched file, not only the default Nx typecheck target.
- `npx nx run shared-ui:typecheck` uses `libs/shared-ui/tsconfig.lib.json` and does not include `*.stories.tsx`.
- After changing `libs/shared-ui/src/components/*.stories.tsx`, run `npx tsc --noEmit -p libs/shared-ui/tsconfig.storybook.json`.
- If that Storybook typecheck fails because of unrelated existing story errors, report the unrelated file and confirm whether the changed story file is clean.

For full UI e2e coverage, start the DB and then start the GraphQL service and UI in test mode:

```bash
npm run db:start
npm run dev:e2e
```

Then run:

```bash
npm run test:e2e
```

See `docs/workflows/e2e.md` for the complete local e2e startup flow.
