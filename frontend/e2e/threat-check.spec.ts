import { expect, test } from '@playwright/test'

test.describe('E2E Threat Check', () => {
  test('analyzes URL and shows score', async ({ page }) => {
    await page.goto('/threat-check')
    await page.getByPlaceholder('Enter URL or domain...').fill('example.com')
    await page.getByRole('button', { name: 'Analyze Risk' }).click()

    await expect(page.getByText('Digital Risk Score')).toBeVisible()
  })

  test('switches to phone tab and submit', async ({ page }) => {
    await page.goto('/threat-check')
    await page.getByRole('button', { name: 'Phone Number' }).click()
    await page.getByPlaceholder('Enter phone number...').fill('+919876543210')
    await page.getByRole('button', { name: 'Analyze Risk' }).click()
    await expect(page.getByText(/API Intelligence Breakdown/)).toBeVisible()
  })
})
