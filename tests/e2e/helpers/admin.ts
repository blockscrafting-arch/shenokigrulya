import { expect, type Page } from "@playwright/test";

export const ADMIN_LOGIN = process.env.E2E_ADMIN_LOGIN ?? "admin";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "admin123";

/** Логин в админку и ожидание дашборда */
export async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.locator('input[autocomplete="username"]').fill(ADMIN_LOGIN);
  await page.locator('input[autocomplete="current-password"]').fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /^Войти$/ }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}
