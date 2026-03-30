import { expect, test } from "@playwright/test";
import { ADMIN_LOGIN, ADMIN_PASSWORD } from "./helpers/admin";

test.describe("Админка: вход", () => {
  test("успешный вход и редирект", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator('input[autocomplete="username"]').fill(ADMIN_LOGIN);
    await page.locator('input[autocomplete="current-password"]').fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /^Войти$/ }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test("неверный пароль", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator('input[autocomplete="username"]').fill(ADMIN_LOGIN);
    await page.locator('input[autocomplete="current-password"]').fill("wrong-password-xyz");
    await page.getByRole("button", { name: /^Войти$/ }).click();
    await expect(page.getByText("Неверный логин или пароль")).toBeVisible({ timeout: 10_000 });
  });

  test("неаутентификованный заход на /admin/orders — логин с redirect в query", async ({ page }) => {
    await page.goto("/admin/orders");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page).toHaveURL(/redirect=/);
  });

  test("чистый /admin ведёт на логин", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
