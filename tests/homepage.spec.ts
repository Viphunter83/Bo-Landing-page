import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Bo Restaurant Dubai/);
});

test('check vibe selection', async ({ page }) => {
    await page.goto('/');

    // Check if "Classic" vibe is active by default or interactable
    await expect(page.getByText('Classic')).toBeVisible();
});
