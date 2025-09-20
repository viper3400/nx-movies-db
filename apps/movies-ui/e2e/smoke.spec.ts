import { test, expect } from "@playwright/test";

test("home shows sign-in prompt", async ({ page }) => {
  await page.goto("/movies");
  console.log(await page.content());
  await expect(page.getByTitle("HomeWeb - Filmdatenbank")).toBeVisible();
});

