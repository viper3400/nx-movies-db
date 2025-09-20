import { test, expect } from "@playwright/test";

test("home shows sign-in prompt", async ({ page }) => {
  await page.goto("/movies");
  await expect(page).toHaveTitle("HomeWeb - Filmdatenbank");
});

