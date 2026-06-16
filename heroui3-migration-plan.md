# HeroUI v3 Migration Plan

## Status

Migration is in progress using **incremental coexistence**.

Completed so far:
- Added temporary coexistence via `@heroui-v3/react` while keeping v2 on `@heroui/react`.
- Added v3 styles alongside the existing v2 setup in:
  - [apps/movies-ui/src/app/global.css](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/app/global.css:1)
  - [libs/shared-ui/src/styles.css](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/styles.css:1)
- Migrated the first `Button` slice to v3 in the main save/apply/search/action flows.
- Replaced all remaining `useDisclosure` usage with local `useState` in:
  - [libs/shared-ui/src/components/datepicker-modal.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/datepicker-modal.tsx:1)
  - [libs/shared-ui/src/components/date-range-drawer.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/date-range-drawer.tsx:1)
  - [libs/shared-ui/src/components/filter-drawer.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/filter-drawer.tsx:1)
- Replaced `useSwitch` with a v3 `Switch` implementation in:
  - [libs/shared-ui/src/components/theme-switch.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/theme-switch.tsx:1)
- Removed the duplicate app-local theme switch implementation.
- Replaced live `Spacer` usage with explicit Tailwind spacing in:
  - [libs/shared-ui/src/components/results-status-indicator.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/results-status-indicator.tsx:1)
  - [libs/shared-ui/src/components/editable-form-wrapper.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/editable-form-wrapper.tsx:1)
  - [libs/shared-ui/src/components/upsert-video-data-form.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/upsert-video-data-form.tsx:1)
  - [apps/movies-ui/src/components/details.tsx](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/components/details.tsx:1)
  - [apps/movies-ui/src/components/seenMovies.tsx](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/components/seenMovies.tsx:1)
- Fixed migration-related regressions in:
  - filter e2e selector targeting for the deleted-movies accordion
  - authenticated cover/poster image routes in local test-mode flows

Still active / not yet migrated:
- Global v2 runtime/config is still active via `HeroUIProvider`, `ToastProvider`, and `heroui()` plugin files.
- Several v2-only removed components are still in use: `Navbar`, `User`, and HeroUI `Image`.
- A substantial set of components still uses v2 props and/or still imports from `@heroui/react`.

## Current Repo State

### Coexistence baseline

This part is done and should stay in place until the final cutover:
- Keep v2 on `@heroui/react`.
- Keep v3 migration imports on `@heroui-v3/react`.
- Keep v2 plugin/runtime wiring until the last v2-only component is removed.

Files still anchoring the v2 runtime:
- [apps/movies-ui/src/app/provider.tsx](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/app/provider.tsx:1)
- [apps/movies-ui/src/app/hero.ts](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/app/hero.ts:1)
- [libs/shared-ui/src/hero.ts](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/hero.ts:1)

### Hooks

This part is complete:
- `useDisclosure`: removed
- `useSwitch`: removed

No additional hook migration work is currently required for the v2-to-v3 transition.

## Outstanding Migration Work

### 1. Replace removed v2-only components

This is now the most important remaining migration slice.

#### `Spacer`

Status:
- Completed for all live app/shared-ui usage outside the old HeroUI `Navbar`.
- Remaining `Spacer` usage is confined to [libs/shared-ui/src/components/navbar.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/navbar.tsx:1), which should be removed as part of the `Navbar` replacement rather than as a standalone step.

#### HeroUI `Image`

Current uses:
- [libs/shared-ui/src/components/tmdb-metadata-merge-panel.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/tmdb-metadata-merge-panel.tsx:1)
- [libs/shared-ui/src/components/tmdb-search-result-card.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/tmdb-search-result-card.tsx:1)

Already migrated elsewhere:
- [libs/shared-ui/src/components/movie-card.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/movie-card.tsx:1) already uses `next/image`.

Plan:
- Replace HeroUI `Image` with `next/image` where dimensions are known and optimization is useful.
- Use plain `img` only where remote sizing/layout makes `next/image` awkward.

#### `User`

Current uses:
- [libs/shared-ui/src/components/navbar.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/navbar.tsx:1)

Plan:
- Replace `User` with a small composed `Avatar + text` block.

#### `Navbar`

Current uses:
- [libs/shared-ui/src/components/navbar.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/navbar.tsx:1)

Plan:
- Replace HeroUI `Navbar` with a local composed navigation component.
- Preserve current behavior first:
  - brand area
  - menu toggle
  - mobile menu
  - theme switch
  - login/logout section

Recommended order inside this slice:
1. HeroUI `Image`
2. `User`
3. `Navbar`

### 2. Finish remaining component migrations

After removed components are gone, continue migrating remaining v2 component usage.

#### Components already partly migrated to v3

These already have at least some `@heroui-v3/react` usage and should be normalized:
- `Button`
- `Tooltip`
- `Spinner`
- `Switch`

Representative files:
- [libs/shared-ui/src/components/surprise-button.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/surprise-button.tsx:1)
- [libs/shared-ui/src/components/tmdb-metadata-search-panel.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/tmdb-metadata-search-panel.tsx:1)
- [libs/shared-ui/src/components/editable-form-wrapper.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/editable-form-wrapper.tsx:1)
- [apps/movies-ui/src/components/upsert-video-form.tsx](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/components/upsert-video-form.tsx:1)

Plan:
- Finish the remaining semantic cleanup where old v2 assumptions still exist.
- Keep verifying loading, icon placement, pending state, and tooltip trigger behavior.

#### Components still fully on v2

Representative remaining v2 component usage:
- `Chip`
- `Card`
- `Divider`
- `Input`
- `Drawer`
- `Modal`
- `DatePicker`
- `Badge`
- `ScrollShadow`
- `Skeleton`
- `Accordion`

Representative files:
- [libs/shared-ui/src/components/movie-card.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/movie-card.tsx:1)
- [libs/shared-ui/src/components/upsert-video-data-form.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/upsert-video-data-form.tsx:1)
- [libs/shared-ui/src/components/tmdb-genre-mapping-control.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/tmdb-genre-mapping-control.tsx:1)
- [libs/shared-ui/src/components/results-status-indicator.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/results-status-indicator.tsx:1)
- [apps/movies-ui/src/components/details.tsx](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/components/details.tsx:1)

Plan:
- Migrate by dependency-safe groups instead of file-by-file churn.
- Good next group after removed components:
  - `Chip`
  - `Card`
  - `Input`
  - `Spinner`

### 3. Final runtime and styling cleanup

Only do this after all remaining component migrations are complete.

Plan:
- Switch temporary `@heroui-v3/react` imports back to `@heroui/react`.
- Remove v2-only dependencies if no longer needed.
- Delete:
  - [apps/movies-ui/src/app/hero.ts](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/app/hero.ts:1)
  - [libs/shared-ui/src/hero.ts](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/hero.ts:1)
- Remove `@plugin './hero.ts'` and v2-specific `@source` usage from CSS.
- Remove `HeroUIProvider` if no longer required by the final v3 setup.
- Reevaluate whether `ToastProvider` is still needed or should be migrated/removed.
- Run a final styling pass for token, spacing, and variant drift.

## Recommended Next Step

The next implementation slice should be:

1. Replace HeroUI `Image`
2. Replace `User`
3. Replace `Navbar`

Reason:
- `Spacer` is already handled everywhere except inside the legacy HeroUI `Navbar`.
- HeroUI `Image` is the next straightforward blocker.
- `User` and `Navbar` are more coupled and should be tackled after image migration.

## Verification Plan

For each migration slice:
- Run targeted unit tests for touched components.
- Run `npm exec nx run movies-ui:test -- --runInBand` when app behavior is affected.
- Run `npx nx run movies-ui:build`.
- Run `npx tsc --noEmit -p libs/shared-ui/tsconfig.storybook.json` when touched files include shared stories.

Before final cutover:
- Run shared UI tests.
- Run app tests.
- Run a production build.
- Run focused e2e coverage for:
  - filter flows
  - edit-page flows
  - navbar/mobile menu flows
  - image-heavy pages/cards

## Notes

- The migration strategy remains **incremental coexistence**.
- The highest-risk remaining item is the custom replacement for HeroUI `Navbar`.
- The migration is now past the hook-removal phase; the remaining work is mostly component replacement and final runtime cleanup.
