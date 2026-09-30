import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const pages = [
  "/",
  "/work",
  "/work/ddmind",
  "/work/ddmind/grid-demo",
  "/notes",
  "/notes/why-virtualization-matters",
  "/about",
  "/about/this-site",
  "/resume",
  "/contact",
];

for (const path of pages) {
  test(`a11y: ${path} has no WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    // Map to a compact shape so a failure prints the rule id, not a huge tree.
    expect(violations.map((v) => ({ id: v.id, nodes: v.nodes.length }))).toEqual([]);
  });
}

test("a11y: grid demo stays accessible after rows render", async ({ page }) => {
  await page.goto("/work/ddmind/grid-demo");
  await page.getByRole("button", { name: /Paged \+ virtualized/ }).click();
  await expect(page.getByRole("row").nth(1)).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(violations.map((v) => ({ id: v.id, nodes: v.nodes.length }))).toEqual([]);
});
