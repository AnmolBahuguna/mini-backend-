import { expect, test } from '@playwright/test'

test.describe('E2E Evidence Vault', () => {
  test('redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/evidence')
    await expect(page).toHaveURL('/auth/login')
  })
})
