import { expect, test } from "@playwright/test";

test("all ten visual assets load and the page remains within the viewport", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Wajah terlihat sama.Jejaknya berbeda.",
  );
  const assets = new Set<string>();
  for (const item of await page.locator('img[src*="/assets/images/"]').all()) {
    await item.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        item.evaluate(
          (node) =>
            (node as HTMLImageElement).complete &&
            (node as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
    assets.add((await item.getAttribute("src"))!);
  }
  expect(assets.size).toBe(10);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("gallery filters preserve usable cards and restore the complete gallery", async ({
  page,
}) => {
  await page.goto("/");
  const cards = page.locator(".gallery-card");
  await expect(cards).toHaveCount(6);
  await page.getByRole("button", { name: "Wajah asli 1", exact: true }).click();
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Wajah asli");
  await expect(page.getByRole("status")).toHaveText("1 contoh visual");
  await page.getByRole("button", { name: "Serangan 5", exact: true }).click();
  await expect(cards).toHaveCount(5);
  await expect(
    page.getByRole("button", { name: "Lihat detail Wajah asli", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Semua 6", exact: true }).click();
  await expect(cards).toHaveCount(6);
});

test("gallery detail supports previous, next, keyboard, escape, and focus restoration", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Lihat detail Foto cetak",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(
    "Foto cetak",
  );
  await expect(
    page.getByRole("button", { name: "Tutup detail", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Contoh berikutnya" }).click();
  await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(
    "Layar ponsel",
  );
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(
    "Foto cetak",
  );
  await page.getByRole("button", { name: "Contoh sebelumnya" }).click();
  await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(
    "Wajah asli",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(
    await page.locator("body").evaluate((node) => node.style.overflow),
  ).toBe("");
});

test("dialog wraps between first and last examples and traps focus", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Lihat detail Wajah asli", exact: true })
    .click();
  await page.keyboard.press("ArrowLeft");
  await expect(
    page.getByRole("dialog").getByRole("heading", { level: 2 }),
  ).toHaveText("Presentasi lain");
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("dialog").getByRole("heading", { level: 2 }),
  ).toHaveText("Wajah asli");
  for (let index = 0; index < 7; index++) await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() => !!document.activeElement?.closest("dialog")),
  ).toBe(true);
  await page.getByRole("button", { name: "Tutup detail", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("clicking the backdrop dismisses the detail", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Lihat detail Manekin", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("full image and face view switch without requesting inference", async ({
  page,
}) => {
  const remoteRequests: string[] = [];
  page.on("request", (request) => {
    if (
      !request.url().startsWith("http://127.0.0.1:4174/") &&
      !request.url().startsWith("ws:")
    )
      remoteRequests.push(request.url());
  });
  await page.goto("/");
  const focus = page.getByRole("button", { name: "Fokus wajah", exact: true });
  await focus.click();
  await expect(focus).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".photo-label")).toHaveText("Tampilan wajah");
  await page.getByRole("button", { name: "Gambar penuh", exact: true }).click();
  await expect(focus).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".photo-label")).toHaveText("Tampilan penuh");
  expect(remoteRequests).toEqual([]);
});

test("model tabs support pointer and vertical keyboard navigation", async ({
  page,
}) => {
  await page.goto("/");
  const cnx = page.getByRole("tab", { name: /ConvNeXt-Large/ });
  await cnx.click();
  await expect(cnx).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("384 × 384");
  await cnx.press("ArrowDown");
  await expect(page.getByRole("tabpanel")).toContainText("normalisasi");
  await expect(page.getByRole("tab", { name: /FSFM ViT/ })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(page.getByRole("tabpanel")).toContainText("448 × 448");
});

test("navigation and primary CTA reach real sections", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Eksplorasi contoh", exact: true })
    .click();
  await expect(page).toHaveURL(/#jenis-serangan$/);
  await expect(
    page.getByRole("heading", { name: /Satu wajah\.\s*Banyak kemungkinan\./ }),
  ).toBeInViewport();
  if (isMobile)
    await page
      .getByRole("button", { name: "Buka navigasi", exact: true })
      .click();
  const nav = page.getByRole("navigation", {
    name: isMobile ? "Navigasi seluler" : "Navigasi utama",
    exact: true,
  });
  await nav.getByRole("link", { name: "Metode", exact: true }).click();
  await expect(page).toHaveURL(/#metode$/);
  await expect(
    page.getByRole("heading", {
      name: /Lihat konteksnya\.\s*Perhatikan detailnya\./,
    }),
  ).toBeInViewport();
  if (isMobile) await expect(page.locator("#mobile-nav")).toHaveCount(0);
});

test("mobile navigation closes with Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile-specific navigation");
  await page.goto("/");
  const button = page.getByRole("button", {
    name: "Buka navigasi",
    exact: true,
  });
  await button.click();
  await expect(
    page.getByRole("navigation", { name: "Navigasi seluler", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(button).toBeFocused();
});

test("project notes expand and all links have real destinations", async ({
  page,
}) => {
  await page.goto("/");
  const question = page.getByRole("button", {
    name: "Apakah galeri ini menjalankan deteksi?",
    exact: true,
  });
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("region", {
      name: "Apakah galeri ini menjalankan deteksi?",
      exact: true,
    }),
  ).toContainText("tanpa mengirim gambar");
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "false");
  const invalid = await page
    .locator("a")
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute("href"))
        .filter(
          (href) =>
            !href ||
            href === "#" ||
            href.startsWith("javascript:") ||
            (href.startsWith("#") && !document.getElementById(href.slice(1))),
        ),
    );
  expect(invalid).toEqual([]);
  await expect(
    page.locator("footer").getByRole("link", { name: "Notebook modelling" }),
  ).toHaveAttribute("href", /\/notebooks\/Modelling.ipynb$/);
});

test("reduced motion keeps gallery and dialog content usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page
      .locator("html")
      .evaluate((node) => getComputedStyle(node).scrollBehavior),
  ).toBe("auto");
  await page
    .getByRole("button", { name: "Lihat detail Foto cetak", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByRole("heading", { level: 2 }),
  ).toHaveText("Foto cetak");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Lihat detail Foto cetak", exact: true }),
  ).toBeVisible();
});
