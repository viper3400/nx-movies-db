import { test, expect } from '@playwright/test';

test('basic search for luca, toggle seen today, toggle flag, toggle fav', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/movies');
  await expect(page).toHaveScreenshot();
  await page.getByRole('textbox', { name: 'Suche (Ergebnisse: 0)' }).click();
  await page.getByRole('textbox', { name: 'Suche (Ergebnisse: 0)' }).fill('luca');
  await page.getByRole('textbox', { name: 'Suche (Ergebnisse: 0)' }).press('Enter');
  await expect(page).toHaveScreenshot();
  await page.locator('div').filter({ hasText: /^Blu-rayR26F1D08$/ }).getByRole('button').first().click();
  await expect(page).toHaveScreenshot();
  await page.locator('div').filter({ hasText: /^Blu-rayR26F1D08$/ }).getByRole('button').nth(1).click();
  await expect(page).toHaveScreenshot();
  await page.getByTestId('seen-today-button').first().click();
  await expect(page).toHaveScreenshot();
  await page.getByRole('button', { name: 'close chip' }).click();
  await expect(page).toHaveScreenshot();
  await page.getByRole('button', { name: 'Löschen' }).click();
  await expect(page).toHaveScreenshot();
  await page.locator('div').filter({ hasText: /^Blu-rayR26F1D08$/ }).getByRole('button').first().click();
  await expect(page).toHaveScreenshot();
  await page.locator('div').filter({ hasText: /^Blu-rayR26F1D08$/ }).getByRole('button').nth(1).click();
  await expect(page).toHaveScreenshot();
});

test('basic filter test', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/movies');
  await expect(page).toHaveScreenshot();
  await page.getByRole('button', { name: 'Filter' }).click();
  await expect(page).toHaveScreenshot();
  await page.getByRole('button', { name: 'Filtereinstellung für gelö' }).click();
  await expect(page).toHaveScreenshot();
  await page.getByRole('radio', { name: 'Nur Gelöschte' }).check();
  await expect(page).toHaveScreenshot();
  await page.getByRole('button', { name: 'Filtereinstellung für Genre' }).click();
  await expect(page).toHaveScreenshot();
  await page.getByRole('checkbox', { name: 'Action' }).check();
  await expect(page).toHaveScreenshot();
  await page.getByRole('button', { name: 'Filtereinstellung für Medientyp Kein Filter gesetzt' }).click();
  await expect(page).toHaveScreenshot();
  await page.getByRole('checkbox', { name: 'Blu-ray', exact: true }).check();
  await page.getByRole('button', { name: 'Anwenden' }).click();
  await expect(page).toHaveScreenshot();
  await page.getByRole('textbox', { name: 'Suche (Ergebnisse: 0)' }).click();
  await page.getByRole('textbox', { name: 'Suche (Ergebnisse: 0)' }).press('Enter');
  await expect(page).toHaveScreenshot();
});

test('basic seen movies test', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000/movies');
  await expect(page).toHaveScreenshot();
  await page.getByRole('button', { name: 'open navigation menu' }).click();
  await page.getByRole('listitem').filter({ hasText: 'Gesehene Filme' }).click();
  await expect(page).toHaveScreenshot();
  await page.getByRole('button', { name: 'open navigation menu' }).click();
  await expect(page).toHaveScreenshot();
  await page.getByRole('link', { name: 'Filmsuche' }).click();
  await expect(page).toHaveScreenshot();
});
