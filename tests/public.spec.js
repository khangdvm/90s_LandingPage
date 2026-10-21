import { test, expect } from "@playwright/test";
import { PrismaClient } from "../server/node_modules/@prisma/client/index.js";
const api = "http://localhost:3100";
let token;
const headers = () => ({ Authorization: `Bearer ${token}` });
const read = async (request, path) =>
  (
    await request.get(`${api}/api/admin/${path}`, { headers: headers() })
  ).json();
const patch = async (request, path, data) => {
  const response = await request.patch(`${api}/api/admin/${path}`, {
    headers: headers(),
    data,
  });
  expect(response.status()).toBe(200);
};
async function save(page) {
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(page.locator(".cms-success")).toContainText(
    "Lưu thay đổi thành công.",
  );
}
async function publicReady(page, roomCount = 4) {
  await page.goto("/");
  await expect(page.locator(".hero-slide")).toHaveCount(3);
  await expect(page.locator("#room-layout .room-photo-button")).toHaveCount(
    roomCount,
  );
  await expect(page.locator("#news-grid article")).toHaveCount(6);
}
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  try {
    await page.goto("http://localhost:5175/admin/login");
    await page
      .getByLabel("Email", { exact: true })
      .fill(process.env.E2E_ADMIN_EMAIL);
    await page
      .getByLabel("Mật khẩu", { exact: true })
      .fill(process.env.E2E_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
    await expect(page).toHaveURL("http://localhost:5175/admin");
    token = await page.evaluate(() =>
      sessionStorage.getItem("90s.cms.session"),
    );
    expect(token).toBeTruthy();
  } finally {
    await page.close();
  }
});
test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    (token) => sessionStorage.setItem("90s.cms.session", token),
    token,
  );
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (entry) => {
    if (
      entry.type() === "error" &&
      !entry.text().startsWith("Failed to load resource:")
    )
      errors.push(entry.text());
  });
  page.__reactErrors = errors;
});
test.afterEach(async ({ page }) => {
  expect(page.__reactErrors).toEqual([]);
});

test("admin room name, price and image -> public card, detail and consultation", async ({
  page,
  request,
}) => {
  const room = await read(request, "rooms/double");
  try {
    await page.goto("/admin/rooms");
    await page
      .getByRole("button", { name: `Sửa ${room.name}`, exact: true })
      .click();
    await page.getByLabel("Tên phòng", { exact: false }).fill("E2E Phòng CMS");
    await page
      .getByLabel("Giá tham khảo (VND)", { exact: true })
      .fill("990000");
    await page
      .getByLabel("URL hoặc đường dẫn ảnh", { exact: true })
      .fill("assets/images/hero/hero-01.png");
    await save(page);
    const saved = await read(request, "rooms/double");
    expect(saved.name).toBe("E2E Phòng CMS");
    expect(saved.price).toBe(990000);
    await publicReady(page);
    await expect(page.locator("#room-layout")).toContainText("E2E Phòng CMS");
    await expect(page.locator("#room-layout")).toContainText("990.000đ");
    const photo = page
      .getByRole("button", { name: "Xem E2E Phòng CMS", exact: true })
      .locator(".photo");
    await expect(photo).toHaveCSS("background-size", "cover");
    await expect(photo).toHaveCSS("background-image", /hero-01\.png/);
    const detail = page.waitForResponse((response) =>
      response.url().endsWith("/api/rooms/double"),
    );
    await page
      .getByRole("button", { name: "Xem E2E Phòng CMS", exact: true })
      .click();
    expect((await detail).status()).toBe(200);
    await page
      .getByRole("button", { name: "Nhận tư vấn", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText("E2E Phòng CMS");
    await expect(page.getByRole("dialog")).toContainText("990.000đ");
  } finally {
    await patch(request, "rooms/double", {
      name: room.name,
      price: room.price,
      imageUrl: room.imageUrl,
    });
  }
});
test("admin creates/reorders/disables a promotion slide -> public slider", async ({
  page,
  request,
}) => {
  let id;
  try {
    await page.goto("/admin/hero");
    await page.getByRole("button", { name: "Thêm slide", exact: true }).click();
    await page.getByLabel(/^Tiêu đề(?: \*)?$/).fill("E2E Ưu đãi CMS");
    await page.getByLabel("Nhãn ưu đãi", { exact: true }).fill("Ưu đãi");
    await page
      .getByLabel("URL hoặc đường dẫn ảnh", { exact: true })
      .fill("assets/images/hero/hero-01.png");
    await page
      .getByLabel("Nhãn nút liên hệ", { exact: true })
      .fill("Nhận tư vấn");
    await page.getByLabel("Liên kết nút", { exact: true }).fill("#lien-he");
    const created = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/admin/hero-slides") &&
        response.request().method() === "POST",
    );
    await save(page);
    id = (await (await created).json()).id;
    await page.goto("/");
    await expect(page.locator(".hero-slide")).toHaveCount(4);
    const slide = page
      .locator(".hero-slide")
      .filter({ hasText: "E2E Ưu đãi CMS" });
    await expect(slide).toHaveCount(1);
    const slides = await read(request, "hero-slides");
    const expected = slides.map((x) => x.title.replace(/\s+/g, " ").trim());
    await expect(page.locator(".hero-title")).toHaveText(expected);
    await page.goto("/admin/hero");
    await page
      .getByRole("button", { name: "Sửa E2E Ưu đãi CMS", exact: true })
      .click();
    await page.getByLabel("Thứ tự hiển thị", { exact: true }).fill("99");
    await save(page);
    await page.goto("/");
    await expect(page.locator(".hero-title").last()).toHaveText(
      "E2E Ưu đãi CMS",
    );
    await page.goto("/admin/hero");
    await page
      .getByRole("button", { name: "Tắt E2E Ưu đãi CMS", exact: true })
      .click();
    await expect(page.locator(".cms-success")).toContainText(
      "Cập nhật trạng thái thành công.",
    );
    await publicReady(page);
    await expect(page.locator(".hero-title")).not.toContainText([
      "E2E Ưu đãi CMS",
    ]);
  } finally {
    if (id)
      await request.delete(`${api}/api/admin/hero-slides/${id}`, {
        headers: headers(),
      });
  }
});
test("admin publishes news -> category, server pagination and full article modal", async ({
  page,
  request,
}) => {
  let id;
  const title = "E2E Bài viết CMS";
  try {
    await page.goto("/admin/news");
    await page
      .getByRole("button", { name: "Viết bài mới", exact: true })
      .click();
    await page.getByLabel(/^Tiêu đề(?: \*)?$/).fill(title);
    await page
      .getByLabel("Đường dẫn (slug)", { exact: false })
      .fill(`e2e-cms-news-${Date.now()}`);
    await page
      .getByLabel("Chuyên mục", { exact: true })
      .selectOption("tam-dao");
    await page.getByLabel("Tóm tắt", { exact: true }).fill("Tóm tắt CMS");
    await page
      .getByLabel("Nội dung bài viết", { exact: true })
      .fill("Nội dung đầy đủ từ CMS.\nDòng thứ hai.");
    await page
      .getByLabel("Ngày hiển thị trên bài", { exact: false })
      .fill("2026-10-13T12:00");
    await page.getByLabel("Đăng bài", { exact: true }).check();
    const created = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/admin/news") &&
        response.request().method() === "POST",
    );
    await save(page);
    const article = await (await created).json();
    id = article.id;
    await publicReady(page);
    await expect(page.locator("#news-grid")).not.toContainText(title);
    const categoryResponse = page.waitForResponse((response) =>
      response.url().includes("/api/news?category=tam-dao&page=1&limit=6"),
    );
    await page.getByRole("button", { name: "Về Tam Đảo", exact: true }).click();
    const first = await (await categoryResponse).json();
    expect(first.pagination).toEqual({
      page: 1,
      limit: 6,
      total: 9,
      totalPages: 2,
    });
    await expect(page.locator("#news-grid")).toContainText(title);
    await expect(page.locator("#news-status")).toContainText("9 bài viết");
    const detail = page.waitForResponse((response) =>
      response.url().endsWith(`/api/news/${article.slug}`),
    );
    await page
      .getByRole("link", { name: `Đọc thêm: ${title}`, exact: true })
      .click();
    expect((await detail).status()).toBe(200);
    await expect(page.locator("main")).toContainText("Nội dung đầy đủ từ CMS.");
    await page.goBack();
    await page.getByRole("button", { name: "Về Tam Đảo", exact: true }).click();
    const next = page.waitForResponse((response) =>
      response.url().includes("/api/news?category=tam-dao&page=2&limit=6"),
    );
    await page.getByRole("button", { name: "Trang 2", exact: true }).click();
    expect((await (await next).json()).pagination.page).toBe(2);
    await expect(page.locator("#news-grid article")).toHaveCount(3);
    await page.goto("/admin/news");
    await page
      .getByRole("button", { name: `Gỡ đăng ${title}`, exact: true })
      .click();
    await expect(page.locator(".cms-success")).toContainText(
      "Cập nhật trạng thái thành công.",
    );
    await publicReady(page);
    await page.getByRole("button", { name: "Về Tam Đảo", exact: true }).click();
    await expect(page.locator("#news-status")).toContainText("8 bài viết");
    await expect(page.locator("#news-grid")).not.toContainText(title);
  } finally {
    if (id)
      await request.delete(`${api}/api/admin/news/${id}`, {
        headers: headers(),
      });
  }
});
test("admin contacts, address/map and SEO -> footer and consultation", async ({
  page,
  request,
}) => {
  const config = await read(request, "site-config");
  try {
    await patch(request, "site-config", {
      contentConfirmed: "false",
      businessNotice: "Nội dung mẫu chưa được chủ website xác nhận.",
    });
    await page.goto("/admin/settings");
    await page.getByLabel("Hotline", { exact: true }).fill("0123456789");
    await page
      .getByLabel("Liên kết Zalo", { exact: true })
      .fill("https://zalo.me/cms-test");
    await page
      .getByLabel("Số điện thoại Zalo", { exact: true })
      .fill("0987654321");
    await page
      .getByLabel("Liên kết Facebook", { exact: true })
      .fill("https://facebook.com/cms-test");
    await page
      .getByLabel("Địa chỉ", { exact: true })
      .fill("Địa chỉ kiểm thử CMS");
    await page
      .getByLabel("Liên kết bản đồ", { exact: true })
      .fill("https://example.com/cms-map");
    await page
      .getByLabel("Tiêu đề website", { exact: true })
      .fill("E2E 90s CMS");
    await page
      .getByLabel("Mô tả website", { exact: true })
      .fill("Mô tả CMS cho kiểm thử");
    await save(page);
    await publicReady(page);
    await expect(page).toHaveTitle("E2E 90s CMS");
    await expect(page.getByText(/Nội dung mẫu.*chưa được/)).toHaveCount(0);
    await expect(page.locator("#demo-info")).toHaveCount(0);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Mô tả CMS cho kiểm thử",
    );
    await expect(page.locator("#contact-location")).toContainText(
      "Địa chỉ kiểm thử CMS",
    );
    await expect(page.locator("#map-link")).toHaveAttribute(
      "href",
      "https://example.com/cms-map",
    );
    for (const [name, href] of [
      ["Gọi Hotline: 0123456789", "tel:0123456789"],
      ["Chat Zalo: 0987654321", "https://zalo.me/cms-test"],
      ["Facebook", "https://facebook.com/cms-test"],
    ]) {
      const link = page
        .locator("#footer-contacts")
        .getByRole("link", { name, exact: true });
      await expect(link).toHaveAttribute("href", href);
      if (!href.startsWith("tel:")) {
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    }
    await page
      .getByRole("button", { name: "Xem Phòng đôi view núi", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Nhận tư vấn", exact: true })
      .click();
    await expect(
      page
        .getByRole("dialog")
        .getByRole("link", { name: "Gọi Hotline: 0123456789", exact: true }),
    ).toHaveAttribute("href", "tel:0123456789");
    await expect(
      page.getByRole("dialog").getByRole("link", {
        name: "Chat Zalo: 0987654321",
        exact: true,
      }),
    ).toHaveAttribute("href", "https://zalo.me/cms-test");
    await page.locator("#close-modal").click();
    await expect(page.getByText(/Nội dung mẫu.*chưa được/)).toHaveCount(0);
    await patch(request, "site-config", {
      zaloPhone: "",
      zaloUrl: "https://zalo.me/0912345678",
      businessNotice: "Chào mừng đến 90s Homestay",
    });
    await publicReady(page);
    await expect(
      page.locator("#footer-contacts").getByRole("link", {
        name: "Chat Zalo: 0912345678",
        exact: true,
      }),
    ).toHaveAttribute("href", "https://zalo.me/0912345678");
    await expect(
      page.getByText("Chào mừng đến 90s Homestay", { exact: true }).first(),
    ).toBeVisible();
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(
      page.locator("#footer-contacts").getByRole("link", {
        name: "Gọi Hotline: 0123456789",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  } finally {
    await patch(request, "site-config", { zaloPhone: "", ...config });
    const addedKeys = [
      "zaloPhone",
      "contentConfirmed",
      "businessNotice",
    ].filter((key) => !(key in config));
    if (addedKeys.length) {
      const db = new PrismaClient();
      try {
        await db.siteConfig.deleteMany({ where: { key: { in: addedKeys } } });
      } finally {
        await db.$disconnect();
      }
    }
  }
});
test("all four content sections use edited CMS text and menu dishes", async ({
  page,
  request,
}) => {
  const originals = await read(request, "content");
  const cases = [
    ["restaurant", "hotpot", "#nha-hang"],
    ["cafe", "cafe-0", "#ca-phe"],
    ["promotion", "weekday-offer", "#uu-dai"],
    ["experience", "about-90s", "#ve-90s"],
  ];
  try {
    for (const [section, id, selector] of cases) {
      const card = originals.find((x) => x.id === id),
        title = `E2E Nội dung ${section}`;
      await page.goto("/admin/content");
      await page
        .getByLabel("Nhóm nội dung", { exact: true })
        .selectOption(section);
      await page
        .getByRole("button", { name: `Sửa ${card.title}`, exact: true })
        .click();
      await page.getByLabel(/^Tiêu đề(?: \*)?$/).fill(title);
      await page
        .getByLabel("Mô tả", { exact: true })
        .fill(`Mô tả CMS ${section}`);
      if (section === "restaurant")
        await page
          .getByLabel("Tên món", { exact: true })
          .first()
          .fill("Món CMS");
      await save(page);
      await publicReady(page);
      if (section === "promotion") {
        await page
          .getByRole("button", { name: "Xem ưu đãi", exact: true })
          .click();
        await expect(page.getByRole("dialog")).toContainText(title);
        await expect(page.getByRole("dialog")).toContainText(
          "Mô tả CMS promotion",
        );
      } else {
        await expect(page.locator(selector)).toContainText(title);
        if (section === "restaurant") {
          await page
            .locator(selector)
            .getByRole("button", { name: new RegExp(title) })
            .click();
          await expect(page.getByRole("dialog")).toContainText("Món CMS");
        }
        if (section === "cafe") {
          await page
            .locator(selector)
            .getByRole("button", { name: new RegExp(title) })
            .click();
          await expect(page.getByRole("dialog")).toContainText(
            "Mô tả CMS cafe",
          );
        }
      }
    }
  } finally {
    for (const [, id] of cases) {
      const card = originals.find((x) => x.id === id);
      await patch(request, `content/${id}`, {
        title: card.title,
        description: card.description,
        dishes: card.dishes,
        menuItems: card.menuItems,
      });
    }
  }
});
test("valid empty CMS responses never resurrect demo data", async ({
  page,
  request,
}) => {
  const collections = await Promise.all(
    ["rooms", "hero-slides", "news", "content"].map((resource) =>
      read(request, resource),
    ),
  );
  const config = await read(request, "site-config");
  try {
    for (const [i, resource] of [
      "rooms",
      "hero-slides",
      "news",
      "content",
    ].entries())
      for (const row of collections[i])
        await patch(request, `${resource}/${row.id}`, {
          [resource === "news" ? "isPublished" : "isActive"]: false,
        });
    await patch(
      request,
      "site-config",
      Object.fromEntries(
        Object.keys(config).map((key) => [
          key,
          key.endsWith("Enabled") || key === "contentConfirmed" ? "true" : "",
        ]),
      ),
    );
    await page.goto("/");
    await expect(page.locator("#tin-tuc")).toHaveCount(0);
    await expect(page.locator('header a[href$="#tin-tuc"]')).toHaveCount(0);
    await expect(page.locator(".public-loading")).toHaveCount(0);
    await expect(page.locator(".hero-slide")).toHaveCount(0);
    await expect(page.locator("#room-layout .room-photo-button")).toHaveCount(
      0,
    );
    await expect(page.locator("#nha-hang [data-food]")).toHaveCount(0);
    await expect(page.locator("#ca-phe [data-cafe]")).toHaveCount(0);
    await expect(page.locator(".about-inner")).toHaveCount(0);
    await expect(page.locator("#news-grid article")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Xem ưu đãi", exact: true }),
    ).toHaveCount(0);
    await expect(page).toHaveTitle("90s Homestay");
    await expect(page.locator("#map-link")).toHaveAttribute("href", "#");
    for (const link of await page.locator("#footer-contacts a").all())
      await expect(link).toHaveAttribute("href", "#");
  } finally {
    for (const [i, resource] of [
      "rooms",
      "hero-slides",
      "news",
      "content",
    ].entries())
      for (const row of collections[i]) {
        const flag = resource === "news" ? "isPublished" : "isActive";
        await patch(request, `${resource}/${row.id}`, { [flag]: row[flag] });
      }
    await patch(request, "site-config", config);
  }
});
test("a real database endpoint failure is isolated, can retry and never crashes React", async ({
  page,
}) => {
  if (!new URL(process.env.DATABASE_URL).pathname.endsWith("_test"))
    throw new Error(
      "This failure injection requires a dedicated database ending in _test",
    );
  const db = new PrismaClient();
  let renamed = false;
  try {
    await db.$executeRawUnsafe(
      'ALTER TABLE "Room" RENAME TO "RoomEndpointFailureTest"',
    );
    renamed = true;
    await page.goto("/");
    await expect(page.locator("#room-layout")).toContainText(
      "Không thể tải nội dung.",
    );
    await expect(page.locator(".hero-slide")).toHaveCount(3);
    await expect(page.locator("#news-grid article")).toHaveCount(6);
    await db.$executeRawUnsafe(
      'ALTER TABLE "RoomEndpointFailureTest" RENAME TO "Room"',
    );
    renamed = false;
    await page
      .locator("#room-layout")
      .getByRole("button", { name: "Thử lại", exact: true })
      .click();
    await expect(page.locator("#room-layout .room-photo-button")).toHaveCount(
      4,
    );
  } finally {
    if (renamed)
      await db.$executeRawUnsafe(
        'ALTER TABLE "RoomEndpointFailureTest" RENAME TO "Room"',
      );
    await db.$disconnect();
  }
});
test("320px and desktop layouts, room filters, mobile menu and hero controls remain usable", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await publicReady(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  await expect(page.locator("#mobile-nav")).toBeVisible();
  await page
    .locator("#mobile-nav")
    .getByRole("link", { name: "Phòng nghỉ", exact: true })
    .click();
  await expect(page.locator("#mobile-nav")).toBeHidden();
  await page
    .locator("#phong-nghi")
    .getByRole("button", { name: "View thị trấn", exact: true })
    .click();
  await expect(page.locator("#room-layout .room-photo-button")).toHaveCount(2);
  await page.locator("#hero-next").click();
  await expect(page.locator(".hero-slide.active")).toContainText(
    "Thêm trải nghiệm",
  );
  await page.locator("#hero-prev").click();
  await expect(page.locator(".hero-slide.active")).toContainText(
    "Lên núi thôi.",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("public-mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await publicReady(page, 2);
  await expect(page.locator('[data-view="town"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("public-desktop.png"),
    fullPage: true,
  });
});

test("API hero retains keyboard/swipe, pause/autoplay and reduced-motion behavior", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await publicReady(page);
  await page.locator("#hero-pause").click();
  await expect(page.locator("#hero-pause")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.clock.fastForward(7000);
  await expect(page.locator(".hero-slide.active")).toContainText(
    "Lên núi thôi.",
  );
  await page.locator("#hero-pause").click();
  await page.locator("#main").focus();
  await page.mouse.move(1400, 880);
  await page.clock.fastForward(7000);
  await expect(page.locator(".hero-slide.active")).toContainText(
    "Thêm trải nghiệm",
  );
  await page.locator(".hero").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".hero-slide.active")).toContainText(
    "Lên núi thôi.",
  );
  await page.locator(".hero").evaluate((element) => {
    const start = new Event("touchstart", { bubbles: true });
    Object.defineProperty(start, "touches", {
      value: [{ clientX: 250, clientY: 250 }],
    });
    element.dispatchEvent(start);
    const end = new Event("touchend", { bubbles: true });
    Object.defineProperty(end, "changedTouches", {
      value: [{ clientX: 100, clientY: 250 }],
    });
    element.dispatchEvent(end);
  });
  await expect(page.locator(".hero-slide.active")).toContainText(
    "Thêm trải nghiệm",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await publicReady(page);
  await expect(page.locator("#hero-pause")).toBeDisabled();
  await page.clock.fastForward(7000);
  await expect(page.locator(".hero-slide.active")).toContainText(
    "Lên núi thôi.",
  );
});
