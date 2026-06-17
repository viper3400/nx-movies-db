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
- Normalized the remaining mixed v3 component usage for:
  - `Tooltip` in [libs/shared-ui/src/components/filter-drawer.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/filter-drawer.tsx:1) and [apps/movies-ui/src/components/upsert-video-form.tsx](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/components/upsert-video-form.tsx:1)
  - `Spinner` in [libs/shared-ui/src/components/tmdb-search-results-list.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/tmdb-search-results-list.tsx:1) and [libs/shared-ui/src/components/results-status-indicator.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/results-status-indicator.tsx:1)
  - `Switch` in [libs/shared-ui/src/components/tmdb-metadata-search-panel.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/tmdb-metadata-search-panel.tsx:1) and [libs/shared-ui/src/components/filter-drawer.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/filter-drawer.tsx:1)
- Moved remaining shared `PressEvent` typing for v3 button flows to:
  - [libs/shared-ui/src/components/search-form.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/search-form.tsx:1)
  - [apps/movies-ui/src/hooks/useMovieSearch.ts](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/hooks/useMovieSearch.ts:1)
- Removed the duplicate app-local theme switch implementation.
- Replaced live `Spacer` usage with explicit Tailwind spacing in:
  - [libs/shared-ui/src/components/results-status-indicator.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/results-status-indicator.tsx:1)
  - [libs/shared-ui/src/components/editable-form-wrapper.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/editable-form-wrapper.tsx:1)
  - [libs/shared-ui/src/components/upsert-video-data-form.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/upsert-video-data-form.tsx:1)
  - [apps/movies-ui/src/components/details.tsx](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/components/details.tsx:1)
  - [apps/movies-ui/src/components/seenMovies.tsx](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/components/seenMovies.tsx:1)
- Replaced the remaining HeroUI `Image` usage with `next/image` in:
  - [libs/shared-ui/src/components/tmdb-search-result-card.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/tmdb-search-result-card.tsx:1)
  - [libs/shared-ui/src/components/tmdb-metadata-merge-panel.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/tmdb-metadata-merge-panel.tsx:1)
- Replaced HeroUI `User` with a local `Avatar + text` block in:
  - [libs/shared-ui/src/components/navbar.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/navbar.tsx:1)
- Replaced HeroUI `Navbar` with a local composed navigation component in:
  - [libs/shared-ui/src/components/navbar.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/navbar.tsx:1)
- Extracted the new navbar user summary into its own shared Storybook component:
  - [libs/shared-ui/src/components/navbar-user-summary.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/navbar-user-summary.tsx:1)
  - [libs/shared-ui/src/components/navbar-user-summary.stories.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/navbar-user-summary.stories.tsx:1)
- Fixed migration-related regressions in:
  - filter e2e selector targeting for the deleted-movies accordion
  - authenticated cover/poster image routes in local test-mode flows

Still active / not yet migrated:
- Global v2 runtime/config is still active via `HeroUIProvider`, `ToastProvider`, and `heroui()` plugin files.
- The remaining work is now concentrated in a smaller set of v2 holdouts:
  - date overlays and pickers
  - `Textarea` / `Select` / `Checkbox`
  - `Divider` / `ScrollShadow` / `Skeleton`
  - one isolated app-local `Button`

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

Status:
- Completed.
- `Spacer`, HeroUI `Image`, `User`, and `Navbar` have all been removed from live app/shared-ui usage.
- The migration is now past the removed-component phase.

#### `Spacer`

Status:
- Completed for all live app/shared-ui usage outside the old HeroUI `Navbar`.
- Remaining `Spacer` usage is confined to [libs/shared-ui/src/components/navbar.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/navbar.tsx:1), which should be removed as part of the `Navbar` replacement rather than as a standalone step.

#### HeroUI `Image`

Status:
- Completed.
- [libs/shared-ui/src/components/movie-card.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/movie-card.tsx:1), [libs/shared-ui/src/components/tmdb-search-result-card.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/tmdb-search-result-card.tsx:1), and [libs/shared-ui/src/components/tmdb-metadata-merge-panel.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/tmdb-metadata-merge-panel.tsx:1) all use `next/image`.
- The TMDB-based images currently use `unoptimized` because the app does not yet declare matching remote image patterns in Next config.

#### `User`

Status:
- Completed in [libs/shared-ui/src/components/navbar.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/navbar.tsx:1) using a local `Avatar + text` composition.

#### `Navbar`

Status:
- Completed in [libs/shared-ui/src/components/navbar.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/navbar.tsx:1) with a local semantic navigation layout preserving:
  - brand area
  - menu toggle
  - mobile menu
  - theme switch
  - login/logout section

### 2. Finish remaining component migrations

This is still the main remaining migration track, but the file is now much closer to the end than the original list suggests.

#### Already complete

These live component families are already migrated or removed from the v2 path:
- `Button`
- `Tooltip`
- `Spinner`
- `Switch`
- `Chip`
- `Card`
- `Input`
- `Badge`
- `Avatar`
- `Accordion`
- `Navbar`
- `User`
- `Image`
- `Spacer`

These files were part of the completed slices:
- [libs/shared-ui/src/components/surprise-button.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/surprise-button.tsx:1)
- [libs/shared-ui/src/components/filter-drawer.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/filter-drawer.tsx:1)
- [libs/shared-ui/src/components/movie-card.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/movie-card.tsx:1)
- [libs/shared-ui/src/components/movie-search-input.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/movie-search-input.tsx:1)
- [libs/shared-ui/src/components/navbar.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/navbar.tsx:1)
- [libs/shared-ui/src/components/navbar-user-summary.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/navbar-user-summary.tsx:1)

#### Remaining v2 imports and component families

Current `@heroui/react` holdouts in source code:

1. Date overlay stack
- [libs/shared-ui/src/components/datepicker-modal.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/datepicker-modal.tsx:1)
  - still on v2 `Modal` + v2 `DatePicker`
  - intentionally reverted because the mixed v2/v3 overlay stack closed the dialog when selecting a date
- [libs/shared-ui/src/components/date-range-drawer.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/date-range-drawer.tsx:1)
  - still on v2 `Drawer` + v2 `DatePicker`
  - only `DateValue` typing has been migrated to `@internationalized/date`

2. Form primitives still on v2
- [libs/shared-ui/src/components/upsert-video-data-form.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/upsert-video-data-form.tsx:1)
  - `Textarea`
  - `DatePicker`
  - `Select`
  - `Checkbox`
- [libs/shared-ui/src/components/editable-form-wrapper.stories.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/editable-form-wrapper.stories.tsx:1)
  - story-only `Textarea`
- [libs/shared-ui/src/components/tmdb-metadata-merge-panel.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/tmdb-metadata-merge-panel.tsx:1)
  - `Checkbox`
- [libs/shared-ui/src/components/tmdb-genre-mapping-control.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/tmdb-genre-mapping-control.tsx:1)
  - `Select`

3. Visual primitives still on v2
- [libs/shared-ui/src/components/image-upload-preview.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/image-upload-preview.tsx:1)
  - `Divider`
- [libs/shared-ui/src/components/movie-card.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/movie-card.tsx:1)
  - `Divider`
  - `ScrollShadow`
- [apps/movies-ui/src/components/upsert-video-form.tsx](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/components/upsert-video-form.tsx:1)
  - `Skeleton`
  - `addToast`

4. Small isolated app-local holdout
- [apps/movies-ui/src/components/github.tsx](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/components/github.tsx:1)
  - simple v2 `Button`

#### Runtime/config holdouts

These should stay until the last runtime v2 component is gone:
- [apps/movies-ui/src/app/provider.tsx](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/app/provider.tsx:1)
  - `HeroUIProvider`
  - `ToastProvider`
- [apps/movies-ui/src/app/hero.ts](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/app/hero.ts:1)
  - `heroui()` plugin
- [libs/shared-ui/src/hero.ts](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/hero.ts:1)
  - `heroui()` plugin

#### Recommended remaining order

1. Finish the safer non-overlay primitives:
  - `Divider`
  - `ScrollShadow`
  - `Skeleton`
  - isolated `Button` in [github.tsx](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/components/github.tsx:1)
2. Finish the remaining form primitives:
  - `Checkbox`
  - `Select`
  - `Textarea`
3. Leave the date stack for last:
  - `datepicker-modal`
  - `date-range-drawer`
  - `DatePicker` fields inside `upsert-video-data-form`

Reason:
- the date overlays are the only area that already showed real behavior regressions during migration
- the remaining non-date primitives are much lower-risk and unblock the final runtime cleanup

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
- Replace or remove `ToastProvider` / `addToast` once toast usage is fully on the v3 path.
- Run a final styling pass for token, spacing, placement, and variant drift.

## Recommended Next Step

The next implementation slice should be:

1. Finish `Divider`, `ScrollShadow`, `Skeleton`, and the isolated `github.tsx` button
2. Then migrate the remaining `Checkbox` / `Select` / `Textarea` usage
3. Leave the date overlay stack for the last component pass
4. Only then remove the v2 runtime/plugin setup

Reason:
- `Chip`, `Card`, `Input`, `Badge`, and `Accordion` are already done.
- The highest-risk remaining area is `DatePicker` inside drawers/modals.
- Final runtime cleanup should wait until those last runtime v2 components are actually gone.

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
- The highest-risk remaining item is now the date overlay stack, not the navbar.
- The migration is past the hook-removal phase and past the first major primitive migrations; the remaining work is concentrated in a small set of component holdouts plus final runtime cleanup.
