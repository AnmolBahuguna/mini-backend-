import { expect, test } from '@playwright/test'

test.describe('E2E Report Flow', () => {
  test('fills and submits report form', async ({ page }) => {
    await page.goto('/community/report')

    const selects = page.locator('select')
    await selects.nth(0).selectOption({ label: 'URL/Link' })
    await page.getByPlaceholder('Enter suspicious URL / phone / UPI').fill('http://fraud.example')
    await page.getByPlaceholder('Describe what happened').fill('x'.repeat(80))
    await selects.nth(1).selectOption({ label: 'Delhi' })

    await page.getByRole('button', { name: 'Submit Report' }).click()
    await expect(page.getByRole('button', { name: 'Submitting...' })).toBeVisible()
  })
})
