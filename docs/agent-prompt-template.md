# Agent Prompt Template

Use this when asking an AI agent to make a focused change or inspect and fix a failing workflow in this repo.

## Template

```text
Task: <specific change>

Area: UI | GraphQL | Prisma | E2E | cleanup

Constraints:
- Keep the change focused.
- Follow AGENTS.md.
- Do not edit generated Prisma files directly.
- Preserve existing behavior unless listed below.

Acceptance criteria:
- <observable result>
- <edge case>
- <test or verification expectation>

Verification:
- Run <specific commands>.
- Do not run <expensive commands> unless needed.
```

## Example

```text
Task: Add the movie owner name to the detail page.

Area: GraphQL + UI

Constraints:
- Keep DB access in movies-prisma-lib.
- Do not edit generated Prisma files directly.
- Preserve existing detail page behavior.

Acceptance criteria:
- The owner name appears on /details/[id].
- Missing owner renders as "-".
- Existing detail page tests still pass.

Verification:
- Run npm run lint.
- Run focused UI/GraphQL tests if available.
```

## Tips

- For larger work, ask the agent to inspect likely files and summarize the plan before editing.
- For small, well-scoped fixes, ask the agent to implement directly and run focused checks.
- Mention whether Docker, Playwright, or DB-backed tests are allowed for the task.

## Inspect And Fix Template

Use this for failing tests, CI failures, dependency bumps, or Renovate PRs where the cause is not yet clear.

```text
Task: Inspect and fix <failing test | CI failure | Renovate PR issue>.

Context:
- Branch/PR: <branch or PR number>
- Failure source: <local command | GitHub Actions check | Renovate PR>
- Known failing command/check: <command or check name>
- Relevant output/log excerpt:
  <paste the smallest useful failure excerpt>

Constraints:
- Start in investigation mode: inspect the failure, identify the likely cause, and summarize the fix plan before editing if the cause is not obvious.
- Keep the fix focused on the failure.
- Do not broaden the dependency update beyond the PR unless required.
- Follow AGENTS.md and the matching workflow doc.
- Do not edit generated Prisma files directly.
- Preserve existing behavior unless the dependency update requires an intentional adjustment.

Verification:
- Re-run the failing command/check locally if feasible.
- Run the smallest related test/lint target that proves the fix.
- If Docker, DB-backed tests, Playwright, or network access are required, say so before assuming the failure is fixed.

Result:
- Explain the root cause.
- List changed files.
- List verification commands and outcomes.
```

## Renovate Example

```text
Task: Inspect and fix the Renovate PR for the Next.js update.

Context:
- Branch/PR: renovate/nextjs
- Failure source: GitHub Actions
- Known failing check: CI / main
- Relevant output/log excerpt:
  next build fails in apps/movies-ui with <paste exact error>

Constraints:
- Keep the fix limited to compatibility issues from this dependency update.
- Do not update unrelated dependencies.
- Do not edit generated Prisma files directly.
- Follow AGENTS.md and docs/workflows/ui-change.md if the fix is in the UI.

Verification:
- Run npm run lint.
- Run npm run test:ui if the fix touches movies-ui.
- Run the failing build target if feasible.
```
