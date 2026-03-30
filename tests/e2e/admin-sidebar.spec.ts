import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/admin";

test.describe("Админка: навигация и выход", () => {
  test("сайдбар: разделы и настройки", async ({ page }) => {
    await loginAsAdmin(page);
    const nav = page.locator("aside").first();
    await nav.getByRole("link", { name: "Заказы", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/orders/);
    await nav.getByRole("link", { name: "Товары", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/products$/);
    await nav.getByRole("link", { name: "Настройки", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/settings/);
    await expect(page.getByRole("heading", { name: "Настройки", exact: true })).toBeVisible();
  });

  test("выход очищает сессию", async ({ page }) => {
    await loginAsAdmin(page);
    const logoutReq = page.waitForResponse(
      (r) => r.url().includes("/api/auth/logout") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Выйти" }).click();
    await logoutReq;
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.goto("/admin/orders");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
