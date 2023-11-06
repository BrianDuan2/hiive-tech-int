import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('localhost:3000');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Time Keeper/);
});

test('happy path', async ({ page }) => {
  await page.goto('localhost:3000');

  //Check that Local row is visible
  await expect(page.getByRole('cell', {name: 'Local(You)'})).toBeVisible();
 
  //Add Timezones
  await page.getByText('Add Timezone').click();
  await page.getByRole('textbox').fill("east");
  await page.locator("[id='timezone']").selectOption("America/New_York");
  await page.getByRole('button', { name: "Save" }).click();

  await page.getByText('Add Timezone').click();
  await page.getByRole('textbox').fill("central");
  await page.locator("[id='timezone']").selectOption("America/Chicago");
  await page.getByRole('button', { name: "Save" }).click();

  //Check that rows are created
  await expect(page.getByRole('cell', {name: 'east', exact: true})).toBeVisible();
  await expect(page.getByRole('cell', {name: 'central', exact: true})).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Delete , east' })).toHaveCount(1);
  await expect(page.getByRole('cell', { name: 'Delete , central' })).toHaveCount(1);

  //Attempt to delete each time zone
  await page.getByRole('button',{ name: 'Delete , east' }).click();
  await page.getByRole('button', { name: 'Delete , central' }).click();

  await expect(page.getByRole('cell', { name: 'Delete , east' })).toBeHidden();
  await expect(page.getByRole('cell', { name: 'Delete , central' })).toBeHidden();
});

test('Attempt to Delete Local', async ({ page }) => {
  await page.goto('localhost:3000');

  await expect(page.getByRole('cell', {name: 'Local(You)'})).toBeVisible();
  await page.getByRole('button', { name: 'Delete , Local' }).click();

  await expect(page.getByRole('cell', { name: 'Delete , Local' })).toBeVisible(); //This Assert will fail with the current app
});

test('Attempt to Create multiple rows for a single time zone', async ({ page }) => {
  await page.goto('localhost:3000');

  await expect(page.getByRole('cell', {name: 'Local(You)'})).toBeVisible();

  await page.getByText('Add Timezone').click();
  await page.getByRole('textbox').fill("central");
  await page.locator("[id='timezone']").selectOption("America/Chicago");
  await page.getByRole('button', { name: "Save" }).click();

  //Add row for timezone with existing row
  await page.getByText('Add Timezone').click();
  await page.getByRole('textbox').fill("central2");
  await page.locator("[id='timezone']").selectOption("America/Chicago");
  await page.getByRole('button', { name: "Save" }).click();

  await expect(page.getByRole('cell', {name: 'central', exact: true})).toBeVisible(); //This Assert will fail with the current app
});

test('Check that timezones are sorted properly', async ({ page }) => {
  await page.goto('localhost:3000');

  await expect(page.getByRole('cell', {name: 'Local(You)'})).toBeVisible();

  //Add Timezones
  await page.getByText('Add Timezone').click();
  await page.getByRole('textbox').fill("mountain");
  await page.locator("[id='timezone']").selectOption("America/Denver");
  await page.getByRole('button', { name: "Save" }).click();

  await page.getByText('Add Timezone').click();
  await page.getByRole('textbox').fill("central");
  await page.locator("[id='timezone']").selectOption("America/Chicago");
  await page.getByRole('button', { name: "Save" }).click();

  const table = page.locator('table');
  await expect(table).toHaveCount(1);
  var secondRow = table.locator('tr').nth(2).locator('td').nth(1);
  await expect(secondRow).toHaveText('America/Denver');
  var thirdrow = table.locator('tr').nth(3).locator('td').nth(1);
  await expect(thirdrow).toHaveText('America/Chicago');
});