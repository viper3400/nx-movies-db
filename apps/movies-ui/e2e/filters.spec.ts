import { test, expect } from "@playwright/test";

test.describe("Filter UI", () => {
  test("renders all filter controls with expected options", async ({ page }) => {
    await page.goto("/movies");

    const filterButton = page.getByRole("button", { name: /filter/i });
    await expect(filterButton).toBeVisible();
    await filterButton.click();

    await expect(page.getByText("Filtereinstellungen")).toBeVisible();

    await expect(page.getByRole("switch", { name: "Lieblingsfilme" })).toBeVisible();
    await expect(page.getByRole("switch", { name: "Nochmal sehen" })).toBeVisible();

    const mediaAccordion = page.getByRole("button", { name: "Filtereinstellung für Medientyp" });
    await expect(mediaAccordion).toBeVisible();
    await mediaAccordion.click();

    const expectMediaCheckbox = async (name: string) => {
      await expect(page.getByRole("checkbox", { name, exact: true })).toBeVisible({ timeout: 15_000 });
    };

    for (const label of [
      "DVD",
      "Netflix",
      "4K",
      "Disney+",
      "CD-RW",
      "4K + 3D",
      "DVD-R",
      "DVD-RW",
      "DVD_R",
      "DVD+RW",
      "DVD-DL",
      "DVD+DL",
      "LaserDisc",
      "HDD",
      "Blu-ray 3D",
      "Blu-ray",
      "CD",
      "wanted",
      "pre-record",
    ]) {
      await expectMediaCheckbox(label);
    }

    const genreAccordion = page.getByRole("button", { name: "Filtereinstellung für Genre" });
    await expect(genreAccordion).toBeVisible();
    await genreAccordion.click();

    const expectGenreCheckbox = async (name: string) => {
      await expect(page.getByRole("checkbox", { name, exact: true })).toBeVisible({ timeout: 15_000 });
    };

    for (const label of [
      "Action",
      "Adventure",
      "Animation",
      "Comedy",
      "Crime",
      "Documentary",
      "Drama",
      "Family",
      "Fantasy",
      "Film-Noir",
      "Horror",
      "Musical",
      "Mystery",
      "Romance",
      "Sci-Fi",
      "Short",
      "Thriller",
      "War",
      "Western",
      "Adult",
      "Music",
      "Biography",
      "History",
      "Sport",
      "Special",
      "Undefined",
    ]) {
      await expectGenreCheckbox(label);
    }

    const tvAccordion = page.getByRole("button", { name: "Filtereinstellung für TV Serien" });
    await expect(tvAccordion).toBeVisible();
    await tvAccordion.click();
    for (const label of [
      "Exklusive TV Serien",
      "Inklusive TV Serien",
      "Nur TV Serien",
    ]) {
      await expect(page.getByRole("radio", { name: label, exact: true })).toBeVisible({ timeout: 15_000 });
    }

    const deletedAccordion = page.getByRole("button", { name: "Filtereinstellung für gelöschte Filme" });
    await expect(deletedAccordion).toBeVisible();
    await deletedAccordion.click();
    for (const label of [
      "Exklusive Gelöschte",
      "Inklusive Gelöschte",
      "Nur Gelöschte",
    ]) {
      await expect(page.getByRole("radio", { name: label, exact: true })).toBeVisible({ timeout: 15_000 });
    }
  });
});
