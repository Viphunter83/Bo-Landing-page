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
    // We click on the text to be sure
    await page.getByText('Pho Bo Special').first().click();

    // 4. Add to Order
    // First ensure modal is ready
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 }).catch(() => {
        // Fallback if role missing, check for text
        return expect(page.getByText('Ingredients')).toBeVisible({ timeout: 5000 });
    });

    await page.getByRole('button', { name: 'Add to Order' }).click();

    // Ensure modal closes
    await expect(page.getByRole('button', { name: 'Add to Order' })).toBeHidden();

    // 5. Cart opens automatically on add
    // Verify Cart is open by checking for "Your Order"
    await expect(page.getByText('Your Order')).toBeVisible();

    // 6. Verify item in cart (scope to drawer to avoid conflict with menu)
    const cart = page.getByTestId('cart-drawer');

    // DEBUG: Check if cart is empty
    const emptyMsg = cart.getByText('Your cart is empty');
    if (await emptyMsg.isVisible()) {
        console.log('Cart is empty!');
        // Error out with clear message
        // await expect(emptyMsg).toBeHidden(); 
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
    try {
        await expect(page).toHaveURL(/payment=success/, { timeout: 5000 });
    } catch (e) {
        // DEBUG: Check for error message in UI
        const errorMsg = page.locator('.bg-red-500\\/90');
        if (await errorMsg.isVisible()) {
            console.log('UI Error Message:', await errorMsg.innerText());
        }
        throw e;
    }
});
