import { test, expect } from '@playwright/test';

test('visitor can add to cart and initiate checkout', async ({ page }) => {
    // 1. Mock the /api/checkout endpoint to avoid touching real Stripe
    await page.route('/api/checkout', async route => {
        const json = { url: 'http://localhost:3000/?payment=success&mock=true' };
        await route.fulfill({ json });
    });

    // 2. Go to homepage
    await page.goto('/');

    // 3. Open a Dish (e.g., Pho Bo Special)
    // Wait for the menu to load and click the button containing the text
    const dishCard = page.getByRole('button').filter({ hasText: 'Pho Bo Special' }).first();
    await expect(dishCard).toBeVisible({ timeout: 10000 });
    await dishCard.click({ force: true });

    // 4. Add to Order
    // Wait for modal to be visible
    const modal = page.locator('.fixed.inset-0.z-50'); // Modal overlay class
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Check for dish title in modal to confirm it's the right one
    await expect(modal.getByRole('heading', { name: 'Pho Bo Special' })).toBeVisible();

    // Click Add to Order
    await modal.getByRole('button', { name: 'Add to Order' }).click();

    // Ensure modal closes
    await expect(modal).toBeHidden();

    // 5. Cart opens automatically on add
    // Verify Cart is open by checking for "Your Order"
    await expect(page.getByText('Your Order')).toBeVisible();

    // 6. Verify item in cart (scope to drawer to avoid conflict with menu)
    const cart = page.getByTestId('cart-drawer');

    // DEBUG: Check if cart is empty
    const emptyMsg = cart.getByText('Your cart is empty');
    if (await emptyMsg.isVisible()) {
        console.log('Cart is empty!');
    }

    await expect(cart).toContainText('Pho Bo Special');

    // 7. Select "Pickup" to avoid delivery validation
    await page.getByRole('button', { name: 'Pickup' }).click();

    // 8. Select "Link" payment (Online Stripe)
    await page.getByRole('button', { name: 'Link' }).click();

    // 8. Enter Email (Required)
    const emailInput = page.getByPlaceholder(/Email/i);
    await emailInput.fill('test@example.com');

    // 9. Click "Pay Now"
    // Note: Button text might be "Pay Now" or "Оплатить" depending on lang. Default is EN.
    await page.getByRole('button', { name: 'Pay Now' }).click();

    // 10. Verify we are redirected (mocked)
    // We allow either raw URL check or UI success message check
    try {
        await expect(page).toHaveURL(/payment=success/, { timeout: 10000 });
    } catch (e) {
        // Fallback: check if we are on a success page or element exists
        console.log('URL check failed, checking for error/success UI elements...');
        throw e;
    }
});
