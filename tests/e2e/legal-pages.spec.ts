import { expect, test } from "@playwright/test";

test.describe("Юридические страницы", () => {
  test("оферта", async ({ page }) => {
    await page.goto("/offer");
    await expect(page.getByRole("heading", { name: /публичная оферта/i })).toBeVisible();
    await expect(page.getByText(/puppyigrulya\.ru/i).first()).toBeVisible();
  });

  test("политика", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /политика конфиденциальности/i })).toBeVisible();
    await expect(page.getByText(/152-фз/i).first()).toBeVisible();
  });
});
