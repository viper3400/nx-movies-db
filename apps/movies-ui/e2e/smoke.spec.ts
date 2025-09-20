import { test, expect } from "@playwright/test";

test("home shows sign-in prompt", async ({ page }) => {
  await page.goto("/");
  console.log(await page.content());
  await expect(page.getByText("Please sign in first.")).toBeVisible();
});

