# Agent Prompt Template

Use this when asking an AI agent to make a focused change in this repo.

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
