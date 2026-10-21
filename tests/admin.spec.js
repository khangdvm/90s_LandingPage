import { PrismaClient } from "../server/node_modules/@prisma/client/index.js";
import { test, expect } from "@playwright/test";
const email = process.env.E2E_ADMIN_EMAIL,
  password = process.env.E2E_ADMIN_PASSWORD;
const api = "http://localhost:3100";
const key = "90s.cms.session";
async function login(page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: true }),
  ).toBeVisible();
}
async function authHeaders(page) {
  return {
    Authorization: `Bearer ${await page.evaluate((key) => sessionStorage.getItem(key), key)}`,
  };
}
async function rowFor(page, title) {
  const row = page
    .getByRole("row")
    .filter({ has: page.getByText(title, { exact: true }) });
  await expect(row).toBeVisible();
  return row;
}
async function create(page, resource, fill) {
  await fill();
  const pending = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/admin/${resource}`) &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  const response = await pending;
  expect(response.status()).toBe(201);
  return response.json();
}
test.beforeEach(async ({ page }) => {
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

test("login: render, invalid password, valid login and logout", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await expect(
    page.getByRole("heading", { name: "Đăng nhập", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Email hoặc mật khẩu không đúng.",
  );
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(await page.evaluate((key) => !!sessionStorage.getItem(key), key)).toBe(
    true,
  );
  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), key),
  ).toBeNull();
});
test("all protected routes redirect while logged out", async ({ page }) => {
  for (const route of [
    "/admin",
    "/admin/rooms",
    "/admin/hero",
    "/admin/news",
    "/admin/content",
    "/admin/settings",
  ]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(
      page.getByRole("heading", { name: "Đăng nhập", exact: true }),
    ).toBeVisible();
  }
});
test("dashboard counts and quick create links", async ({ page }) => {
  await login(page);
  await expect(page.locator(".cms-stat strong")).toHaveText([
    "4",
    "3",
    "16",
    "10",
  ]);
  await page.getByRole("link", { name: "Thêm phòng", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Thêm phòng", exact: true }),
  ).toBeVisible();
});
test("rooms: validation, duplicate slug, CRUD, image and state", async ({
  page,
  request,
}) => {
  await login(page);
  const headers = await authHeaders(page);
  let id;
  try {
    await page.getByRole("link", { name: "Phòng nghỉ", exact: true }).click();
    await expect(page.getByRole("table")).toBeVisible();
    await page.getByRole("button", { name: "Thêm phòng", exact: true }).click();
    await page
      .getByRole("button", { name: "Lưu thay đổi", exact: true })
      .click();
    await expect(
      page.getByText("Vui lòng nhập tên phòng.", { exact: true }),
    ).toBeVisible();
    await page.getByLabel("Tên phòng", { exact: false }).fill("E2E Phòng");
    await page.getByLabel("Đường dẫn (slug)", { exact: false }).fill("double");
    await page
      .getByLabel("Giá tham khảo (VND)", { exact: true })
      .fill("123000");
    await page
      .getByRole("button", { name: "Lưu thay đổi", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "Đường dẫn này đã tồn tại",
    );
    const item = await create(page, "rooms", async () => {
      await page
        .getByLabel("Đường dẫn (slug)", { exact: false })
        .fill(`e2e-room-${Date.now()}`);
      await page
        .getByLabel("URL hoặc đường dẫn ảnh", { exact: true })
        .fill("assets/images/rooms/rooms-collage.png");
      await expect(page.getByAltText("Ảnh xem trước nội dung")).toBeVisible();
      await page
        .getByLabel("Tổng số phòng hiển thị", { exact: true })
        .fill("3");
      await expect(
        page.getByLabel("Ô ảnh collage (0–3)", { exact: true }),
      ).toHaveCount(0);
    });
    id = item.id;
    await rowFor(page, "E2E Phòng");
    await page
      .getByRole("button", { name: "Sửa E2E Phòng", exact: true })
      .click();
    await page.getByLabel("Tên phòng", { exact: false }).fill("E2E Phòng sửa");
    await page.getByLabel("Thứ tự hiển thị", { exact: true }).fill("9");
    await page
      .getByRole("button", { name: "Lưu thay đổi", exact: true })
      .click();
    await rowFor(page, "E2E Phòng sửa");
    await page
      .getByRole("button", { name: "Tắt E2E Phòng sửa", exact: true })
      .click();
    await expect(
      (await rowFor(page, "E2E Phòng sửa")).getByText("Đã tắt", {
        exact: true,
      }),
    ).toBeVisible();
    const saved = await request.get(`${api}/api/admin/rooms/${id}`, {
      headers,
    });
    expect((await saved.json()).sortOrder).toBe(9);
    await page
      .getByRole("button", { name: "Xóa E2E Phòng sửa", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Hủy", exact: true }).click();
    await rowFor(page, "E2E Phòng sửa");
    await page
      .getByRole("button", { name: "Xóa E2E Phòng sửa", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Xác nhận xóa", exact: true })
      .click();
    await expect(page.getByText("E2E Phòng sửa", { exact: true })).toHaveCount(
      0,
    );
    expect(
      (await request.get(`${api}/api/admin/rooms/${id}`, { headers })).status(),
    ).toBe(404);
  } finally {
    if (id) await request.delete(`${api}/api/admin/rooms/${id}`, { headers });
  }
});
test("hero: create promotion, edit, reorder, toggle, delete", async ({
  page,
  request,
}) => {
  await login(page);
  const headers = await authHeaders(page);
  let id;
  try {
    await page
      .getByRole("link", { name: "Hero / Slider", exact: true })
      .click();
    await page.getByRole("button", { name: "Thêm slide", exact: true }).click();
    const item = await create(page, "hero-slides", async () => {
      await page.getByLabel(/^Tiêu đề(?: \*)?$/).fill("E2E Slide");
      await page.getByLabel("Nhãn ưu đãi", { exact: true }).fill("Ưu đãi");
      await page
        .getByLabel("Nhãn nút liên hệ", { exact: true })
        .fill("Nhận tư vấn");
      await page.getByLabel("Liên kết nút", { exact: true }).fill("#lien-he");
    });
    id = item.id;
    await rowFor(page, "E2E Slide");
    await page
      .getByRole("button", { name: "Sửa E2E Slide", exact: true })
      .click();
    await page.getByLabel(/^Tiêu đề(?: \*)?$/).fill("E2E Slide sửa");
    await page.getByLabel("Thứ tự hiển thị", { exact: true }).fill("12");
    await page
      .getByRole("button", { name: "Lưu thay đổi", exact: true })
      .click();
    await rowFor(page, "E2E Slide sửa");
    await page
      .getByRole("button", { name: "Tắt E2E Slide sửa", exact: true })
      .click();
    await expect(
      (await rowFor(page, "E2E Slide sửa")).getByText("Đã tắt", {
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Xóa E2E Slide sửa", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Xác nhận xóa", exact: true })
      .click();
    await expect(page.getByText("E2E Slide sửa", { exact: true })).toHaveCount(
      0,
    );
  } finally {
    if (id) {
      const db = new PrismaClient();
      try {
        await db.heroSlide.deleteMany({ where: { id } });
      } finally {
        await db.$disconnect();
      }
    }
  }
});
test("news: category, CRUD, publish/unpublish, date and plaintext", async ({
  page,
  request,
}) => {
  await login(page);
  const headers = await authHeaders(page);
  let id;
  try {
    await page.getByRole("link", { name: "Tin tức", exact: true }).click();
    await page
      .getByLabel("Chuyên mục", { exact: true })
      .selectOption("tam-dao");
    await expect(page.getByRole("row")).toHaveCount(9);
    await page
      .getByRole("button", { name: "Viết bài mới", exact: true })
      .click();
    const item = await create(page, "news", async () => {
      await page.getByLabel(/^Tiêu đề(?: \*)?$/).fill("E2E Tin");
      await page
        .getByLabel("Đường dẫn (slug)", { exact: false })
        .fill(`e2e-news-${Date.now()}`);
      await page
        .getByLabel("Nội dung bài viết", { exact: true })
        .fill("Nội dung văn bản thuần, không HTML.");
      await page
        .getByLabel("Ngày hiển thị trên bài", { exact: false })
        .fill("2026-10-13T10:30");
    });
    id = item.id;
    await rowFor(page, "E2E Tin");
    await page
      .getByRole("button", { name: "Đăng E2E Tin", exact: true })
      .click();
    await expect(
      (await rowFor(page, "E2E Tin")).getByText("Đã đăng", { exact: true }),
    ).toBeVisible();
    expect((await request.get(`${api}/api/news/${item.slug}`)).status()).toBe(
      200,
    );
    await page
      .getByRole("button", { name: "Gỡ đăng E2E Tin", exact: true })
      .click();
    await expect(
      (await rowFor(page, "E2E Tin")).getByText("Bản nháp", { exact: true }),
    ).toBeVisible();
    expect((await request.get(`${api}/api/news/${item.slug}`)).status()).toBe(
      404,
    );
    await page
      .getByRole("button", { name: "Sửa E2E Tin", exact: true })
      .click();
    await page.getByLabel(/^Tiêu đề(?: \*)?$/).fill("E2E Tin sửa");
    await page
      .getByRole("button", { name: "Lưu thay đổi", exact: true })
      .click();
    await rowFor(page, "E2E Tin sửa");
    await page
      .getByRole("button", { name: "Xóa E2E Tin sửa", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Xác nhận xóa", exact: true })
      .click();
    await expect(page.getByText("E2E Tin sửa", { exact: true })).toHaveCount(0);
  } finally {
    if (id) await request.delete(`${api}/api/admin/news/${id}`, { headers });
  }
});
test("content: section filter, dishes, CRUD and active state", async ({
  page,
  request,
}) => {
  await login(page);
  const headers = await authHeaders(page);
  let id;
  try {
    await page.getByRole("link", { name: "Nội dung", exact: true }).click();
    await page
      .getByLabel("Nhóm nội dung", { exact: true })
      .selectOption("restaurant");
    await expect(page.getByRole("row")).toHaveCount(5);
    await page
      .getByRole("button", { name: "Thêm nội dung", exact: true })
      .click();
    const item = await create(page, "content", async () => {
      await page.getByLabel(/^Tiêu đề(?: \*)?$/).fill("E2E Card");
      await page.getByRole("button", { name: "Thêm món", exact: true }).click();
      await page.getByLabel("Tên món", { exact: true }).fill("Món thử 1");
      await page.getByRole("button", { name: "Thêm món", exact: true }).click();
      await page
        .getByLabel("Tên món", { exact: true })
        .nth(1)
        .fill("Món thử 2");
      await expect(
        page.getByLabel("Ô ảnh collage (0–3)", { exact: true }),
      ).toHaveCount(0);
    });
    id = item.id;
    expect(item.menuItems.map((x) => x.name)).toEqual([
      "Món thử 1",
      "Món thử 2",
    ]);
    await rowFor(page, "E2E Card");
    await page
      .getByRole("button", { name: "Sửa E2E Card", exact: true })
      .click();
    await page.getByLabel(/^Tiêu đề(?: \*)?$/).fill("E2E Card sửa");
    await page.getByLabel("Thứ tự hiển thị", { exact: true }).fill("11");
    await page
      .getByRole("button", { name: "Lưu thay đổi", exact: true })
      .click();
    await rowFor(page, "E2E Card sửa");
    await page
      .getByRole("button", { name: "Tắt E2E Card sửa", exact: true })
      .click();
    await expect(
      (await rowFor(page, "E2E Card sửa")).getByText("Đã tắt", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Xóa E2E Card sửa", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Xác nhận xóa", exact: true })
      .click();
    await expect(page.getByText("E2E Card sửa", { exact: true })).toHaveCount(
      0,
    );
  } finally {
    if (id) await request.delete(`${api}/api/admin/content/${id}`, { headers });
  }
});
test("settings: load, validate contact URLs, update and restore", async ({
  page,
  request,
}) => {
  await login(page);
  const headers = await authHeaders(page);
  const original = await (
    await request.get(`${api}/api/admin/site-config`, { headers })
  ).json();
  try {
    await page.getByRole("link", { name: "Cài đặt", exact: true }).click();
    await expect(page.getByLabel("Hotline", { exact: true })).toHaveValue(
      original.hotline,
    );
    await page
      .getByLabel("Liên kết Zalo", { exact: true })
      .fill("javascript:alert(1)");
    await page
      .getByRole("button", { name: "Lưu thay đổi", exact: true })
      .click();
    await expect(
      page.getByText(
        "Liên kết sai mục đích: ảnh dùng assets/, /uploads/ hoặc HTTP/HTTPS; liên hệ dùng HTTP/HTTPS; CTA dùng section hoặc trang chi tiết.",
        { exact: true },
      ),
    ).toBeVisible();
    await page
      .getByLabel("Liên kết Zalo", { exact: true })
      .fill("https://zalo.me/test-contact");
    await page
      .getByLabel("Liên kết Facebook", { exact: true })
      .fill("https://facebook.com/test-contact");
    await page.getByLabel("Hotline", { exact: true }).fill("0123456789");
    await page
      .getByLabel("Tiêu đề website", { exact: true })
      .fill("E2E Website");
    await page
      .getByRole("button", { name: "Lưu thay đổi", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "Lưu thay đổi thành công.",
    );
    const saved = await (
      await request.get(`${api}/api/admin/site-config`, { headers })
    ).json();
    expect(saved.hotline).toBe("0123456789");
    expect(saved.zaloUrl).toBe("https://zalo.me/test-contact");
    expect(saved.facebookUrl).toBe("https://facebook.com/test-contact");
    expect(saved.siteTitle).toBe("E2E Website");
  } finally {
    await request.patch(`${api}/api/admin/site-config`, {
      headers,
      data: original,
    });
  }
});
test("real 401 clears session and returns to login", async ({ page }) => {
  await login(page);
  await page.evaluate((key) => {
    const parts = sessionStorage.getItem(key).split(".");
    parts[2] = (parts[2][0] === "A" ? "B" : "A") + parts[2].slice(1);
    sessionStorage.setItem(key, parts.join("."));
  }, key);
  await page.getByRole("link", { name: "Phòng nghỉ", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("alert")).toContainText(
    "Phiên đăng nhập đã hết hạn",
  );
  expect(
    await page.evaluate((key) => sessionStorage.getItem(key), key),
  ).toBeNull();
});
test("load failure has feedback and can retry without mocks", async ({
  page,
  context,
}) => {
  await login(page);
  await page.getByRole("link", { name: "Phòng nghỉ", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await context.setOffline(true);
  await page.getByRole("button", { name: "Tải lại", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Không thể kết nối máy chủ",
  );
  await context.setOffline(false);
  await page.getByRole("button", { name: "Tải lại", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByRole("table")).toBeVisible();
});
test("mobile/tablet/desktop admin pages and forms do not overflow", async ({
  page,
}, testInfo) => {
  await login(page);
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/admin",
      "/admin/rooms",
      "/admin/hero",
      "/admin/news",
      "/admin/content",
      "/admin/settings",
      "/admin/rooms?new=1",
    ]) {
      await page.goto(route);
      await expect(page.locator(".cms-main h1")).toBeVisible();
      await expect(
        page.getByText("Đang tải dữ liệu…", { exact: true }),
      ).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
    if (width === 375)
      await page.screenshot({
        path: testInfo.outputPath("admin-mobile.png"),
        fullPage: true,
      });
    if (width === 1440)
      await page.screenshot({
        path: testInfo.outputPath("admin-desktop.png"),
        fullPage: true,
      });
  }
});
test("public frontend reads CMS, remains usable and visually separate", async ({
  page,
}) => {
  await login(page);
  const requests = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/") && !r.url().includes("/api/admin/"))
      requests.push({ url: r.url(), authorization: r.headers().authorization });
  });
  await page.getByRole("link", { name: "Xem website ↗", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(page).toHaveTitle("90s Homestay — Hẹn nhau ở Tam Đảo");
  await expect(page.locator(".hero-slide")).toHaveCount(3);
  await page.getByRole("button", { name: "Về Tam Đảo", exact: true }).click();
  await expect(page.locator("#news-grid article")).toHaveCount(6);
  await page.getByRole("button", { name: "Trang 2", exact: true }).click();
  await expect(page.locator("#news-grid article")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Xem Phòng đôi view núi", exact: true })
    .click();
  await expect(page).toHaveURL(/\/phong\/double$/);
  await expect(
    page.getByRole("heading", { name: "Phòng đôi view núi", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nhận tư vấn", exact: true }).click();
  await expect(
    page.getByText(
      "Chọn kênh liên hệ để trao đổi lịch trình và nhận tư vấn trực tiếp.",
      {
        exact: false,
      },
    ),
  ).toBeVisible();
  expect(requests.some((request) => request.url.endsWith("/api/rooms"))).toBe(
    true,
  );
  expect(requests.every((request) => request.authorization === undefined)).toBe(
    true,
  );
});
