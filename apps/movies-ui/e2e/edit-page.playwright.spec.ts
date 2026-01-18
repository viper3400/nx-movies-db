import { expect, test, type Locator, type Page } from "@playwright/test";

const selectors = {
  title: "[data-testid='video-field-title']",
  language: "[data-testid='video-field-language']",
  diskId: "[data-testid='video-field-diskid']",
  year: "[data-testid='video-field-year']",
  save: "[data-testid='editable-form-save']",
  discard: "[data-testid='editable-form-discard']",
};

async function openEditPage(page: Page, id: string) {
  await page.goto(`/movies/edit/${id}`);
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

test.describe("Edit page (vanilla Playwright)", () => {
  test("user can start a new video entry", async ({ page }) => {
    await page.goto("/movies/edit/new");

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
    const originalTitle = "Demolition Man";
    const editedTitle = `${originalTitle} (Edited)`;

    const { titleField, languageField, diskIdField, yearField, saveButton } = await openEditPage(page, "59");

    await expect(titleField).toHaveValue(originalTitle);
    await expect(languageField).toHaveValue("german, english, spanish");
    await expect(diskIdField).toHaveValue("R04F4D01");
    await expect(yearField).toHaveValue("1993");
    await expect(saveButton).toBeDisabled();

    await titleField.fill(editedTitle);
    await titleField.press("Tab");
    await expect(saveButton).toBeEnabled();

    await saveButton.click();
    await waitUntilSaved(saveButton);

    await page.reload();
    await titleField.waitFor({ state: "visible" });
    await expect(titleField).toHaveValue(editedTitle);

    await titleField.fill(originalTitle);
    await titleField.press("Tab");
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await waitUntilSaved(saveButton);

    await page.reload();
    await titleField.waitFor({ state: "visible" });
    await expect(titleField).toHaveValue(originalTitle);
  });

  test("user can discard edits to restore the original value", async ({ page }) => {
    const originalTitle = "Demolition Man";
    const draftTitle = `${originalTitle} Draft`;

    const { titleField, saveButton, discardButton } = await openEditPage(page, "59");

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
    const originalDiskId = "R04F4D01";
    const editedDiskId = "R04F4D99";
    const originalYear = "1993";
    const editedYear = "1994";
    const id = 59;

    await page.goto(`/movies/edit/${id}`);
    const titleField = page.locator(selectors.title);
    await titleField.waitFor({ state: "visible" });

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

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator(selectors.diskId)).toHaveValue(editedDiskId);
    await expect(page.locator(selectors.year)).toHaveValue(editedYear);

    await page.locator(selectors.diskId).fill(originalDiskId);
    await page.locator(selectors.diskId).press("Tab");
    await page.locator(selectors.year).fill(originalYear);
    await page.locator(selectors.year).press("Tab");
    await page.locator(selectors.save).click();
    await waitUntilSaved(page.locator(selectors.save));

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator(selectors.diskId)).toHaveValue(originalDiskId);
    await expect(page.locator(selectors.year)).toHaveValue(originalYear);
  });
});
