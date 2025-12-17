import { test, expect } from '@playwright/test';

test('homepage renders correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Check title
  await expect(page).toHaveTitle(/ChainCash/);

  // Check hero text
  await expect(page.locator('h1')).toContainText('Fund Games');
  await expect(page.locator('h1')).toContainText('Own the Future');

  // Check connect button exists (Nautilus)
  await expect(page.getByRole('button', { name: 'Connect Nautilus' })).toBeVisible();

  // Check active campaigns section is visible
  await expect(page.getByText('Active Campaigns')).toBeVisible();

  // Check if at least one campaign card is loaded (from mock data)
  // We wait a bit for the mock data delay
  await page.waitForTimeout(2000);
  await expect(page.getByText('Cosmic Crusaders')).toBeVisible();

  // Take a screenshot for visual verification
  await page.screenshot({ path: 'homepage.png', fullPage: true });
});
