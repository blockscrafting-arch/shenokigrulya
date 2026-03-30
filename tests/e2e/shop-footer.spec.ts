import { expect, test } from "@playwright/test";

test.describe("Футер и юридические ссылки", () => {
  test("с главной: оферта и политика открываются", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "Публичная оферта" }).click();
    await expect(page).toHaveURL(/\/offer$/);
    await expect(page.getByRole("heading", { name: /публичная оферта/i })).toBeVisible();

    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "Политика конфиденциальности" }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.getByRole("heading", { name: /политика конфиденциальности/i })).toBeVisible();
  });

  test("mailto в футере", async ({ page }) => {
    await page.goto("/");
    const mail = page.getByRole("contentinfo").getByRole("link", { name: /partners@kkushneriov\.ru/i });
    await expect(mail).toHaveAttribute("href", /^mailto:/);
  });
});
