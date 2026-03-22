import { expect, test } from '@playwright/test'

test.describe('E2E Alerts Flow', () => {
  test('filters alerts page and shows severity badges', async ({ page }) => {
    await page.goto('/alerts')

    const selects = page.locator('select')
    await selects.nth(0).selectOption('Phishing')
    await selects.nth(1).selectOption('HIGH')

    await expect(page.getByText('UPI phishing campaign')).toBeVisible()
    await expect(page.getByText('HIGH')).toBeVisible()
  })
})
