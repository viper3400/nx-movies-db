# HeroUI v3 Migration Plan

## Summary

Migrate this repo to HeroUI v3 using **incremental coexistence** so the app stays runnable throughout. The repo is already on **React 19** and **Tailwind 4**, so the migration is mainly about HeroUI package strategy, CSS/plugin removal, component API changes, and replacing v2-only hooks.

Current high-risk areas discovered in the repo:
- Global v2 setup is active via `HeroUIProvider`, `ToastProvider`, and `heroui()` plugin files in [apps/movies-ui/src/app/provider.tsx](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/app/provider.tsx:1), [apps/movies-ui/src/app/global.css](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/app/global.css:1), and [libs/shared-ui/src/styles.css](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/styles.css:1).
- Removed hooks are in use: `useDisclosure` and `useSwitch`.
- Removed v2-only components exist: `Navbar`, `Spacer`, `User`, and HeroUI `Image`.
- Button-like API drift is widespread: `color`, `isLoading`, `startContent` / `endContent`, and v2 visual assumptions.

## Implementation Changes

### 1. Establish coexistence baseline
- Add a temporary v3 coexistence strategy using the alias approach: keep v2 on `@heroui/react` and add v3 under a separate import name such as `@heroui-v3/react`.
- Import v3 component-by-component only where a migration step is being executed.
- Keep v2-only removed components in place for now; do not block the main migration on `Navbar`, `Spacer`, `User`, or HeroUI `Image`.

### 2. Prepare shared styling and app shell for coexistence
- Update global CSS to support both versions during the migration window.
- Keep Tailwind 4, but introduce v3 CSS imports in the required order and retain v2 plugin-backed styling until the last v2 component is removed.
- Defer removing `heroui()` plugin files and `HeroUIProvider` until the repo no longer depends on v2 runtime/config behavior.
- Keep `ToastProvider` only if still required by the chosen v3 toast usage after the toast migration pass; otherwise remove it with the final cleanup.

### 3. Migrate components by dependency-safe waves
- Wave 1: `Button`, `Spinner`, `Tooltip`, `Chip`, `Badge`.
  - These have broad usage and low structural complexity.
  - Update Button semantics repo-wide:
    - `color` + `variant` to v3 `variant`
    - `isLoading` to `isPending`
    - `startContent` / `endContent` to explicit children
    - add `min-w-*` classes only where v2 width parity matters
- Wave 2: `Input`-adjacent simple components and non-overlay primitives.
- Wave 3: overlay components that currently use `useDisclosure`, such as modal/drawer flows.
  - Replace `useDisclosure` with `useOverlayState` or local `useState` where simpler.
- Wave 4: hook-driven custom components like the theme switch.
  - Replace `useSwitch` implementations with v3 compound component structure.
- Wave 5: structural components with larger API changes such as `Card`, `Divider`, and collection components if needed.

### 4. Handle removed components as a separate tracked follow-up
- Keep `Navbar`, `Spacer`, `User`, and HeroUI `Image` on v2 during coexistence.
- After all v3-supported components are migrated, replace them manually:
  - `Spacer` with Tailwind spacing utilities or small layout wrappers
  - HeroUI `Image` with `next/image` or native `img` wrappers as appropriate
  - `User` with composed `Avatar` + text
  - `Navbar` with a local composed navigation pattern
- Do not mix these replacements into the initial Button/primitive migration steps.

### 5. Final cutover
- Once all supported components are migrated, switch imports from `@heroui-v3/react` to `@heroui/react`.
- Remove v2-only dependencies and plugin-based styling setup.
- Delete `hero.ts` plugin files and remove `@plugin './hero.ts'` plus v2 `@source` usage for `@heroui/theme`.
- Remove `HeroUIProvider` if no longer required by v3 usage.
- Run a final styling pass to replace any lingering v2 utility/token assumptions.

## Public APIs / Interfaces / Types

- Temporary implementation-level interface change: migrated files will import from `@heroui-v3/react` during coexistence, then switch back to `@heroui/react` at final cutover.
- Shared component props may change where they currently mirror v2-only Button behavior, especially around loading and icon placement.
- No GraphQL, Prisma, or backend contract changes are expected.

## Test Plan

- For each migration wave:
  - Run targeted unit tests for touched UI components.
  - Run Storybook typecheck for touched stories in `libs/shared-ui` when story files change.
  - Run `movies-ui` build after each wave to catch App Router and client-component breakage.
- For Button migration specifically:
  - Verify disabled, pending, icon-only, ghost, primary, danger, and inline action buttons.
  - Verify forms and save/discard flows still behave correctly.
  - Verify test selectors remain stable where stories and e2e tests depend on them.
- Before final cutover:
  - Run shared UI tests, app tests, and a production build.
  - Run focused e2e coverage for edit-page and filter flows because they exercise buttons, drawers, and navbar interactions.

## Assumptions

- Strategy: **incremental coexistence**.
- Scope: **defer replacement of v2-only removed components** until after supported v3 components are migrated.
- Goal: preserve current behavior first; only add explicit styling adjustments where v3 default visuals would create obvious regressions.
- The first implementation slice should be the already-requested `Button` migration, because it is widespread and will validate the coexistence setup quickly.
