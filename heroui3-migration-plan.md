# HeroUI v3 Migration Plan

## Status

Migration is in progress using **incremental coexistence**.

Completed so far:
- Added temporary coexistence via `@heroui-v3/react` while keeping v2 on `@heroui/react`.
- Added v3 styles alongside the existing v2 setup in:
  - [apps/movies-ui/src/app/global.css](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/app/global.css:1)
  - [libs/shared-ui/src/styles.css](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/styles.css:1)
- Replaced all remaining `useDisclosure` usage with local `useState` in:
  - [libs/shared-ui/src/components/datepicker-modal.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/datepicker-modal.tsx:1)
  - [libs/shared-ui/src/components/date-range-drawer.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/date-range-drawer.tsx:1)
  - [libs/shared-ui/src/components/filter-drawer.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/filter-drawer.tsx:1)
- Replaced `useSwitch` with a v3 `Switch` implementation in:
  - [libs/shared-ui/src/components/theme-switch.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/theme-switch.tsx:1)
- Migrated the non-date holdout batch to v3, including:
  - `Textarea` / `Select` / `Checkbox`
  - `Divider` / `ScrollShadow` / `Skeleton`
  - app-local `github.tsx` `Button`
  - toast migration from `ToastProvider` / `addToast` to v3 `Toast.Provider` + `toast`
- Replaced live `Spacer` usage with explicit Tailwind spacing.
- Replaced the remaining HeroUI `Image` usage with `next/image`.
- Replaced HeroUI `User` with a local `Avatar + text` block.
- Replaced HeroUI `Navbar` with a local composed navigation component.
- Migrated the remaining date slice to v3:
  - [libs/shared-ui/src/components/datepicker-modal.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/datepicker-modal.tsx:1)
    - v3 `Modal` + v3 `Calendar`
  - [libs/shared-ui/src/components/date-range-drawer.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/date-range-drawer.tsx:1)
    - v3 `Drawer` + v3 `Calendar`
  - [libs/shared-ui/src/components/upsert-video-data-form.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/upsert-video-data-form.tsx:1)
    - inline date fields moved off v2 `DatePicker` to v3 `DateField`
- Added Storybook play coverage for the migrated date overlay flows:
  - [libs/shared-ui/src/components/datepicker-modal.stories.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/datepicker-modal.stories.tsx:1)
  - [libs/shared-ui/src/components/date-range-drawer.stories.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/date-range-drawer.stories.tsx:1)
- Fixed migration-related regressions in:
  - filter e2e selector targeting for the deleted-movies accordion
  - authenticated cover/poster image routes in local test-mode flows
  - create-flow toast visibility in `UpsertVideoForm` by avoiding full-page navigation
  - toast region overlap/timing adjustments

Still active / not yet migrated:
- Global v2 runtime/config is still active via `HeroUIProvider` and the `heroui()` plugin files.
- The remaining work is now concentrated in:
  - final runtime/plugin cleanup
  - import normalization and styling cleanup

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

No live v2 component usage remains in the date stack.

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

### 2. Finish remaining component migrations

Status:
- Completed.

#### Completed component families

These live component families are already migrated or removed from the v2 path:
- `Button`
- `Checkbox`
- `Tooltip`
- `Spinner`
- `Switch`
- `Chip`
- `Card`
- `Input`
- `Textarea`
- `Select`
- `Badge`
- `Avatar`
- `Accordion`
- `Divider`
- `ScrollShadow`
- `Skeleton`
- `Navbar`
- `User`
- `Image`
- `Spacer`
- `Toast` usage
- date overlays and date fields

#### Completed date migration notes

The previous date holdouts are now migrated:
- [libs/shared-ui/src/components/datepicker-modal.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/datepicker-modal.tsx:1)
  - now on v3 `Modal` + v3 `Calendar`
- [libs/shared-ui/src/components/date-range-drawer.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/date-range-drawer.tsx:1)
  - now on v3 `Drawer` + v3 `Calendar`
- [libs/shared-ui/src/components/upsert-video-data-form.tsx](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/components/upsert-video-data-form.tsx:1)
  - inline date inputs now use v3 `DateField`

#### Runtime/config holdouts

These should stay until the last runtime v2 component is gone:
- [apps/movies-ui/src/app/provider.tsx](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/app/provider.tsx:1)
  - `HeroUIProvider`
- [apps/movies-ui/src/app/hero.ts](/Users/Jan/Documents/Development/nx-movies-db/apps/movies-ui/src/app/hero.ts:1)
  - `heroui()` plugin
- [libs/shared-ui/src/hero.ts](/Users/Jan/Documents/Development/nx-movies-db/libs/shared-ui/src/hero.ts:1)
  - `heroui()` plugin

#### Recommended remaining order

1. Remove the v2 runtime/plugin setup
2. Normalize `@heroui-v3/react` imports back to `@heroui/react`
3. Remove v2-only dependencies
4. Do the final styling cleanup pass

Reason:
- the date regression area has already been migrated and verified
- the remaining risk has shifted to coexistence teardown and token/style cleanup

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
- Keep the v3 toast setup and remove any remaining v2 toast runtime wiring if no longer needed.
- Run a final styling pass for token, spacing, placement, and variant drift.

## Recommended Next Step

The next implementation slice should be:

1. Remove the v2 runtime/plugin setup
2. Normalize imports from `@heroui-v3/react` back to `@heroui/react`
3. Remove v2-only dependencies
4. Do the final styling/config cleanup

Reason:
- the date slice is complete
- Storybook runner coverage now exercises the migrated date overlay stories
- the remaining work is the actual cutover from coexistence to v3-only runtime/config

## Verification Plan

For each migration slice:
- Run targeted unit tests for touched components.
- Run `npm exec nx run movies-ui:test -- --runInBand` when app behavior is affected.
- Run `npx nx run movies-ui:build`.
- Run `npx tsc --noEmit -p libs/shared-ui/tsconfig.storybook.json` when touched files include shared stories.
- Run `npm run test:storybook -- --url <storybook-url>` when touched files include Storybook play interactions or overlay stories.

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
- The migration plan above reflects the current repo state after the date holdout batch was completed.
- The main remaining risk is now the coexistence teardown and the final styling/token cleanup.
