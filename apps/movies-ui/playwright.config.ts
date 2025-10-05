import { defineConfig, devices } from "@playwright/test";
import type { SerenityFixtures, SerenityWorkerFixtures } from "@serenity-js/playwright-test";

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
  testDir: "./e2e",
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  reporter: [
    // Serenity/JS reporting services
    ["@serenity-js/playwright-test", {
      crew: [
        "@serenity-js/console-reporter",
        /*['@serenity-js/serenity-bdd', {
          specDirectory: './spec'
        }],*/
        ["@serenity-js/core:ArtifactArchiver", {
          outputDirectory: "./target/site/serenity"
        }],
      ]
    }],

    // Any other native Playwright Test reporters
    ["html", { open: "never" }],
  ],
});
