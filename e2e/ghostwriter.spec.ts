import { expect, test } from "@playwright/test";

test("turns a typed thought into copyable posts in demo mode", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /start speaking/i }).click();
  await page.getByLabel("transcript").fill("I learned that publishing a rough version of an idea is better than endlessly polishing it alone.");
  await page.getByRole("button", { name: /turn this into posts/i }).click();
  await expect(page.getByRole("heading", { name: /here’s what you were trying to say/i })).toBeVisible();
  await page.getByRole("button", { name: "Copy" }).first().click();
  await expect(page.getByRole("button", { name: "Copied ✓" }).first()).toBeVisible();
});
