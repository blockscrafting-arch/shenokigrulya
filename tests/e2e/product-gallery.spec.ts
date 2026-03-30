import { expect, test } from "@playwright/test";

test.describe("Галерея товара", () => {
  test("миниатюры переключают слайд", async ({ page }) => {
    await page.goto("/");
    const thumbs = page.getByRole("button").filter({ has: page.locator("img") });
    const count = await thumbs.count();
    expect(count).toBeGreaterThan(1);
    await thumbs.nth(1).click();
    await expect(page.locator(".swiper").first()).toBeVisible();
  });

  test("переключение первой и второй миниатюры", async ({ page }) => {
    await page.goto("/");
    const thumbs = page.getByRole("button").filter({ has: page.locator("img") });
    await expect(thumbs.first()).toBeVisible();
    await thumbs.nth(1).click();
    await expect(page.locator(".swiper").first()).toBeVisible();
    await thumbs.first().click();
    await expect(page.locator(".swiper-slide-active, .swiper .swiper-slide-active").first()).toBeVisible();
  });
});
