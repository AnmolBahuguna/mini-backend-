import { expect, test } from '@playwright/test'

test.describe('E2E Auth Flow', () => {
  test('login form renders and can submit', async ({ page }) => {
    await page.goto('/auth/login')

    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await page.getByPlaceholder('you@example.com').fill('user@example.com')
    await page.getByPlaceholder('Password').fill('Password1')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page).toHaveURL('/')
  })

  test('signup page submits form', async ({ page }) => {
    await page.goto('/auth/signup')

    await page.getByPlaceholder('Your full name').fill('E2E User')
    await page.getByPlaceholder('you@example.com').fill('e2e@example.com')
    await page.getByPlaceholder('+91XXXXXXXXXX').fill('+919999999999')
    await page.getByRole('combobox').selectOption({ label: 'Delhi' })
    await page.getByPlaceholder('Password').fill('Password1')
    await page.getByPlaceholder('Confirm password').fill('Password1')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Create Account' }).click()

    await expect(page).toHaveURL('/')
  })
})
