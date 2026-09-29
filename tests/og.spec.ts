import { expect, test } from "@playwright/test";

// One representative page per OG route: root, a case study, a study note.
const ogPages = ["/", "/work/ddmind", "/notes/why-virtualization-matters"];

for (const path of ogPages) {
  test(`${path} exposes an OG image that renders as PNG`, async ({ page, request }) => {
    await page.goto(path);

    const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute("content");
    expect(ogImage).toBeTruthy();

    const width = await page.locator('meta[property="og:image:width"]').first().getAttribute("content");
    const height = await page.locator('meta[property="og:image:height"]').first().getAttribute("content");
    expect(width).toBe("1200");
    expect(height).toBe("630");

    // Twitter should get a large-image card backed by an explicit image.
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute("content");
    expect(twitterCard).toBe("summary_large_image");
    const twitterImage = await page.locator('meta[name="twitter:image"]').first().getAttribute("content");
    expect(twitterImage).toBeTruthy();

    // The meta content is absolute (production metadataBase); re-request the
    // same path against the local server under test.
    const url = new URL(ogImage!);
    const res = await request.get(url.pathname + url.search);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
    const body = await res.body();
    expect(body.length).toBeGreaterThan(2000);
  });
}

test("each case study has its own OG image path", async ({ page }) => {
  const seen = new Set<string>();
  for (const slug of ["ddmind", "ccm", "paper-tiger"]) {
    await page.goto(`/work/${slug}`);
    const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute("content");
    expect(ogImage).toContain(`/work/${slug}/`);
    seen.add(ogImage!);
  }
  expect(seen.size).toBe(3);
});
