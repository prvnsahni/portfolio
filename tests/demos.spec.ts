import { expect, test } from "@playwright/test";

test("grid demo: paged + virtualized keeps the DOM small", async ({ page }) => {
  await page.goto("/work/ddmind/grid-demo");
  await page.getByRole("button", { name: /Paged \+ virtualized/ }).click();
  const result = page.getByTestId("result-optimized");
  await expect(result.getByText("Time to rows")).toBeVisible();
  const nodesText = await result.locator("dt:has-text('DOM nodes in grid') + dd").innerText();
  expect(Number(nodesText.replace(/,/g, ""))).toBeLessThan(1_000);
  await expect(page.getByRole("row").nth(1)).toContainText(/\d/);
});

test("memo demo: React.memo child skips re-renders once the handler is stable", async ({ page }) => {
  await page.goto("/notes/react-memo-usememo-usecallback");
  const rerender = page.getByRole("button", { name: /Re-render parent/ });
  await page.getByRole("checkbox").check();
  const memoCount = page.getByText("React.memo child").locator("..").getByText(/renders:/);
  const before = await memoCount.innerText();
  await rerender.click();
  await rerender.click();
  await expect(memoCount).toHaveText(before);
});
