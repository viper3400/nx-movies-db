import { expect, test, type Locator, type Page } from "@playwright/test";

const selectors = {
  title: "[data-testid='video-field-title']",
  language: "[data-testid='video-field-language']",
  diskId: "[data-testid='video-field-diskid']",
  diskIdSuggestion: "[data-testid='video-field-diskid-suggestion']",
  year: "[data-testid='video-field-year']",
  save: "[data-testid='editable-form-save']",
  discard: "[data-testid='editable-form-discard']",
};

async function openEditPage(page: Page, id: string) {
  await page.goto(`/edit/${id}`);
  const titleField = page.locator(selectors.title);
  await titleField.waitFor({ state: "visible" });

  return {
    titleField,
    languageField: page.locator(selectors.language),
    diskIdField: page.locator(selectors.diskId),
    yearField: page.locator(selectors.year),
    saveButton: page.locator(selectors.save),
    discardButton: page.locator(selectors.discard),
  };
}

async function waitUntilSaved(saveButton: Locator) {
  await expect(saveButton).toBeDisabled({ timeout: 15_000 });
}

async function findVideoByTitle(page: Page, title: string) {
  const response = await page.request.post("/api/graphql-proxy", {
    data: {
      query: `
        query FindVideoByTitle($title: String!) {
          videos(
            title: $title,
            diskid: "",
            filterFavorites: false,
            filterFlagged: false,
            mediaType: [],
            genreName: [],
            randomOrder: false,
            userName: "tester@example.com",
            queryPlot: false,
            take: 1,
            skip: 0
          ) {
            videos {
              id
              ownerid
            }
          }
        }
      `,
      variables: { title },
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  const video = body.data?.videos?.videos?.[0];
  if (!video?.id) {
    return null;
  }

  return { id: String(video.id), ownerId: video.ownerid };
}

async function reloadUntilInputValue(page: Page, selector: string, expected: string) {
  await expect
    .poll(async () => {
      await page.reload({ waitUntil: "domcontentloaded" });
      const field = page.locator(selector);
      await field.waitFor({ state: "visible" });
      return field.inputValue();
    }, { timeout: 15_000 })
    .toBe(expected);
}

async function createManualEntry(page: Page, title: string) {
  const uniqueToken = Date.now();
  const diskPrefix = `R${String((uniqueToken % 80) + 10).padStart(2, "0")}F${String((Math.floor(uniqueToken / 100) % 80) + 10).padStart(2, "0")}`;

  await page.goto("/edit/new");

  const titleField = page.locator(selectors.title);
  const diskIdField = page.locator(selectors.diskId);
  const diskIdSuggestion = page.locator(selectors.diskIdSuggestion);
  const saveButton = page.locator(selectors.save);

  await titleField.waitFor({ state: "visible" });
  await titleField.fill(title);
  await titleField.press("Tab");
  await diskIdField.fill(diskPrefix);
  await diskIdSuggestion.waitFor({ state: "visible" });
  await diskIdSuggestion.click();
  await expect(diskIdField).toHaveValue(new RegExp(`^${diskPrefix}D\\d{2}$`));
  await expect(saveButton).toBeEnabled();

  await saveButton.click();
  await waitUntilSaved(saveButton);
  let createdId = new URL(page.url()).pathname.match(/\/edit\/(\d+)$/)?.[1] ?? null;

  if (!createdId) {
    await expect
      .poll(() => new URL(page.url()).pathname.match(/\/edit\/(\d+)$/)?.[1] ?? null, {
        timeout: 15_000,
      })
      .not.toBeNull()
      .catch(() => undefined);
    createdId = new URL(page.url()).pathname.match(/\/edit\/(\d+)$/)?.[1] ?? null;
  }

  if (!createdId) {
    const createdVideo = await expect
      .poll(async () => findVideoByTitle(page, title), { timeout: 15_000 })
      .not.toBeNull()
      .then(async () => findVideoByTitle(page, title));
    createdId = createdVideo?.id ?? null;
    if (createdId) {
      await page.goto(`/edit/${createdId}`);
    }
  }

  expect(createdId).toBeTruthy();

  return {
    id: createdId!,
    diskId: await diskIdField.inputValue(),
  };
}

test.describe("Edit page (vanilla Playwright)", () => {
  test("user can start a new video entry", async ({ page }) => {
    await page.goto("/edit/new");

    const titleField = page.locator(selectors.title);
    const languageField = page.locator(selectors.language);
    const saveButton = page.locator(selectors.save);

    await titleField.waitFor({ state: "visible" });
    await expect(titleField).toHaveValue("");
    await expect(languageField).toHaveValue("en");
    await expect(saveButton).toBeDisabled();

    await titleField.fill("SerenityJS Showcase Title");
    await titleField.press("Tab");

    await expect(titleField).toHaveValue("SerenityJS Showcase Title");
    await expect(saveButton).toBeEnabled();
  });

  test("user can edit and save an existing film title", async ({ page }) => {
    const uniqueToken = Date.now();
    const originalTitle = `Playwright Existing ${uniqueToken}`;
    const editedTitle = `${originalTitle} (Edited)`;
    const created = await createManualEntry(page, originalTitle);

    const { titleField, languageField, diskIdField, yearField, saveButton } = await openEditPage(page, created.id);

    await expect(titleField).toHaveValue(originalTitle);
    await expect(languageField).toHaveValue("en");
    await expect(diskIdField).toHaveValue(created.diskId);
    const originalYear = await yearField.inputValue();
    await expect(yearField).toHaveValue(originalYear);
    await expect(saveButton).toBeDisabled();

    await titleField.fill(editedTitle);
    await titleField.press("Tab");
    await expect(saveButton).toBeEnabled();

    await saveButton.click();
    await waitUntilSaved(saveButton);
    await reloadUntilInputValue(page, selectors.title, editedTitle);
    await expect(titleField).toHaveValue(editedTitle);

    await titleField.fill(originalTitle);
    await titleField.press("Tab");
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await waitUntilSaved(saveButton);
    await reloadUntilInputValue(page, selectors.title, originalTitle);
    await expect(titleField).toHaveValue(originalTitle);
  });

  test("user can discard edits to restore the original value", async ({ page }) => {
    const originalTitle = `Playwright Discard ${Date.now()}`;
    const draftTitle = `${originalTitle} Draft`;
    const created = await createManualEntry(page, originalTitle);

    const { titleField, saveButton, discardButton } = await openEditPage(page, created.id);

    await expect(titleField).toHaveValue(originalTitle);

    await titleField.fill(draftTitle);
    await titleField.press("Tab");

    await expect(saveButton).toBeEnabled();
    await expect(discardButton).toBeEnabled();

    await discardButton.click();
    await expect(saveButton).toBeDisabled();
    await expect(titleField).toHaveValue(originalTitle);
  });

  test("user can edit disk info and year, then revert", async ({ page }) => {
    const originalTitle = `Playwright Disk ${Date.now()}`;
    const created = await createManualEntry(page, originalTitle);
    await page.goto(`/edit/${created.id}`);
    const titleField = page.locator(selectors.title);
    await titleField.waitFor({ state: "visible" });

    const originalDiskId = await page.locator(selectors.diskId).inputValue();
    const originalYear = await page.locator(selectors.year).inputValue();
    const editedDiskId = originalDiskId.replace(/D\d{2}$/, "D99");
    const editedYear = String(Number(originalYear || "2000") + 1);

    await page.locator(selectors.diskId).waitFor({ state: "attached" });
    await expect(page.locator(selectors.diskId)).toHaveValue(originalDiskId);
    await expect(page.locator(selectors.year)).toHaveValue(originalYear);

    await page.locator(selectors.diskId).fill(editedDiskId);
    await page.locator(selectors.diskId).press("Tab");
    await page.locator(selectors.year).fill(editedYear);
    await page.locator(selectors.year).press("Tab");
    await expect(page.locator(selectors.save)).toBeEnabled();

    await page.locator(selectors.save).click();
    await waitUntilSaved(page.locator(selectors.save));
    await reloadUntilInputValue(page, selectors.diskId, editedDiskId);
    await expect(page.locator(selectors.diskId)).toHaveValue(editedDiskId);
    await expect(page.locator(selectors.year)).toHaveValue(editedYear);

    await page.locator(selectors.diskId).fill(originalDiskId);
    await page.locator(selectors.diskId).press("Tab");
    await page.locator(selectors.year).fill(originalYear);
    await page.locator(selectors.year).press("Tab");
    await page.locator(selectors.save).click();
    await waitUntilSaved(page.locator(selectors.save));
    await reloadUntilInputValue(page, selectors.diskId, originalDiskId);
    await expect(page.locator(selectors.diskId)).toHaveValue(originalDiskId);
    await expect(page.locator(selectors.year)).toHaveValue(originalYear);
  });

  test("user can create, update, and discard a manual entry", async ({ page }) => {
    const uniqueToken = Date.now();
    const createdTitle = `Playwright Created ${uniqueToken}`;
    const updatedTitle = `${createdTitle} Updated`;
    const temporaryTitle = `${createdTitle} Draft`;

    const created = await createManualEntry(page, createdTitle);
    const createdId = created.id;
    await page.goto(`/edit/${createdId}`);

    const titleField = page.locator(selectors.title);
    const saveButton = page.locator(selectors.save);
    const discardButton = page.locator(selectors.discard);

    await titleField.waitFor({ state: "visible" });
    await expect(titleField).toHaveValue(createdTitle);

    // Capture the new id just to ensure we landed on a persisted entity
    const createdPath = new URL(page.url()).pathname;
    expect(createdPath).toMatch(/\/edit\/\d+$/);

    // Update title and ensure persistence
    await titleField.fill(updatedTitle);
    await titleField.press("Tab");
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await waitUntilSaved(saveButton);
    await reloadUntilInputValue(page, selectors.title, updatedTitle);
    await expect(titleField).toHaveValue(updatedTitle);

    // Now draft a change and discard it
    await titleField.fill(temporaryTitle);
    await titleField.press("Tab");
    await expect(saveButton).toBeEnabled();
    await expect(discardButton).toBeEnabled();

    await discardButton.click();
    await expect(titleField).toHaveValue(updatedTitle);
    await expect(saveButton).toBeDisabled();
  });
});
