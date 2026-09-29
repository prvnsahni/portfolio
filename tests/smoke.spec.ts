import { expect, test } from "@playwright/test";

const pages = ["/", "/work", "/work/ddmind", "/work/ccm", "/work/paper-tiger", "/work/block-power", "/work/qbench", "/notes", "/about", "/resume", "/contact"];

for (const path of pages) {
  test(`${path} renders without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("no horizontal scroll on the home page", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test("unknown project returns 404", async ({ page }) => {
  const res = await page.goto("/work/does-not-exist");
  expect(res?.status()).toBe(404);
});

test("resume PDFs are downloadable", async ({ request }) => {
  for (const v of ["Combined", "React", "Angular"]) {
    const res = await request.get(`/resume/Praveen_Kumar_Resume_${v}.pdf`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("pdf");
  }
});
