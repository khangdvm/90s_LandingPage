import { test, expect } from "@playwright/test";
import { PrismaClient } from "../server/node_modules/@prisma/client/index.js";
const api = "http://localhost:3100";
let token;
const headers = () => ({ Authorization: "Bearer " + token });
async function login(page) {
  await page.goto("/admin/login");
  await page
    .getByLabel("Email", { exact: true })
    .fill(process.env.E2E_ADMIN_EMAIL);
  await page
    .getByLabel("Mật khẩu", { exact: true })
    .fill(process.env.E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
}
async function saved(page) {
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(page.locator(".cms-success")).toContainText(
    "Lưu thay đổi thành công.",
  );
}
test.beforeAll(async ({ request }) => {
  if (!new URL(process.env.DATABASE_URL).pathname.endsWith("_test"))
    throw Error("Only _test DB");
  const r = await request.post(api + "/api/admin/login", {
    data: {
      email: process.env.E2E_ADMIN_EMAIL,
      password: process.env.E2E_ADMIN_PASSWORD,
    },
  });
  expect(r.status()).toBe(200);
  token = (await r.json()).token;
});
test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.__errors = errors;
  await page.goto("/admin/login");
  await page.evaluate(
    (t) => sessionStorage.setItem("90s.cms.session", t),
    token,
  );
});
test.afterEach(async ({ page }) => {
  expect(page.__errors).toEqual([]);
});
test("real upload, gallery order and room detail refresh/back/404 across mobile sizes", async ({
  page,
  request,
}) => {
  let room;
  try {
    await page.goto("/admin/rooms?new=1");
    await page
      .getByLabel("Tên phòng", { exact: false })
      .fill("QA Upload Gallery");
    await page
      .getByLabel("Đường dẫn (slug)", { exact: false })
      .fill("qa-upload-gallery");
    await page
      .getByLabel("Chọn ảnh từ máy", { exact: true })
      .setInputFiles("public/assets/images/hero/hero-01.png");
    await expect(page.getByAltText("Ảnh xem trước nội dung")).toBeVisible();
    await expect(
      page.getByLabel("URL hoặc đường dẫn ảnh", { exact: true }),
    ).toHaveValue(/^\/uploads\//);
    for (const v of [
      "assets/images/rooms/rooms-collage.png",
      "assets/images/hero/hero-01.png",
    ]) {
      await page
        .getByRole("button", { name: "Thêm ảnh gallery", exact: true })
        .click();
      await page
        .getByLabel(/^URL ảnh \d$/)
        .last()
        .fill(v);
    }
    await page
      .getByRole("button", { name: "Đưa lên", exact: true })
      .last()
      .click();
    await page
      .getByRole("button", { name: "Dùng làm ảnh đại diện", exact: true })
      .first()
      .click();
    await expect(
      page.getByLabel("URL hoặc đường dẫn ảnh", { exact: true }),
    ).toHaveValue("assets/images/hero/hero-01.png");
    const pending = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/admin/rooms") && r.request().method() === "POST",
    );
    await saved(page);
    room = await (await pending).json();
    expect(room.gallery[0]).toBe("assets/images/hero/hero-01.png");
    await page.goto("/phong/" + room.slug);
    await expect(
      page.getByRole("heading", { name: room.name, exact: true }),
    ).toBeVisible();
    await expect(page.locator(".room-gallery button")).toHaveCount(2);
    await page
      .getByRole("button", { name: "Xem ảnh phòng 2", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Xem ảnh phòng 2", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(page).toHaveTitle(room.name + " — 90s Homestay");
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
      "href",
      "http://localhost:5175/phong/" + room.slug,
    );
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page
      .getByRole("link", { name: "← Về trang chủ", exact: true })
      .click();
    await expect(page).toHaveURL("/");
    await page.goBack();
    await expect(page).toHaveURL(/\/phong\/qa-upload-gallery$/);
    await request.patch(api + "/api/admin/rooms/" + room.id, {
      headers: headers(),
      data: { isActive: false },
    });
    await page.reload();
    await expect(
      page.getByRole("heading", {
        name: "Không tìm thấy nội dung",
        exact: true,
      }),
    ).toBeVisible();
    await page.goto("/unknown-route");
    await expect(
      page.getByRole("heading", {
        name: "Không tìm thấy nội dung",
        exact: true,
      }),
    ).toBeVisible();
  } finally {
    if (room)
      await request.delete(api + "/api/admin/rooms/" + room.id, {
        headers: headers(),
      });
  }
});
test("draft survives refresh and real 401 login; cancel clears only its own draft", async ({
  page,
}) => {
  await page.goto("/admin/rooms?new=1");
  await page
    .getByLabel("Tên phòng", { exact: false })
    .fill("QA Bản nháp phục hồi");
  page.on("dialog", (d) => d.accept());
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Khôi phục bản nháp", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Khôi phục bản nháp", exact: true })
    .click();
  await expect(page.getByLabel("Tên phòng", { exact: false })).toHaveValue(
    "QA Bản nháp phục hồi",
  );
  await page.evaluate(() => {
    const k = "90s.cms.session",
      p = sessionStorage.getItem(k).split(".");
    p[2] = (p[2][0] === "A" ? "B" : "A") + p[2].slice(1);
    sessionStorage.setItem(k, p.join("."));
  });
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("alert")).toContainText(
    "Phiên đăng nhập đã hết hạn",
  );
  await page
    .getByLabel("Email", { exact: true })
    .fill(process.env.E2E_ADMIN_EMAIL);
  await page
    .getByLabel("Mật khẩu", { exact: true })
    .fill(process.env.E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/rooms\?new=1$/);
  await page
    .getByRole("button", { name: "Khôi phục bản nháp", exact: true })
    .click();
  await expect(page.getByLabel("Tên phòng", { exact: false })).toHaveValue(
    "QA Bản nháp phục hồi",
  );
  await page
    .getByRole("button", { name: "Hủy chỉnh sửa", exact: true })
    .click();
  await expect(page.getByRole("table")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        Object.keys(localStorage).filter((k) => k.endsWith("rooms.new")).length,
    ),
  ).toBe(0);
});
test("navigation warns, settings draft recovery and concurrent edit cannot overwrite", async ({
  page,
  request,
}) => {
  const old = await (
    await request.get(api + "/api/admin/site-config", { headers: headers() })
  ).json();
  try {
    await page.goto("/admin/settings");
    await page
      .getByLabel("Tiêu đề website", { exact: true })
      .fill("QA Draft Settings");
    const dismissed = new Promise((resolve) =>
      page.once("dialog", async (d) => {
        await d.dismiss();
        resolve();
      }),
    );
    await page.getByRole("link", { name: "Phòng nghỉ", exact: true }).click();
    await dismissed;
    await expect(page).toHaveURL("/admin/settings");
    const accepted = new Promise((resolve) =>
      page.once("dialog", async (d) => {
        await d.accept();
        resolve();
      }),
    );
    await page.getByRole("link", { name: "Phòng nghỉ", exact: true }).click();
    await accepted;
    await expect(page).toHaveURL("/admin/rooms");
    await page.getByRole("link", { name: "Cài đặt", exact: true }).click();
    await page
      .getByRole("button", { name: "Khôi phục bản nháp", exact: true })
      .click();
    await expect(
      page.getByLabel("Tiêu đề website", { exact: true }),
    ).toHaveValue("QA Draft Settings");
    await request.patch(api + "/api/admin/site-config", {
      headers: headers(),
      data: { siteTitle: "QA Server Newer" },
    });
    await page
      .getByRole("button", { name: "Lưu thay đổi", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "Nội dung đã thay đổi trên máy chủ",
    );
    const current = await (
      await request.get(api + "/api/admin/site-config", { headers: headers() })
    ).json();
    expect(current.siteTitle).toBe("QA Server Newer");
    page.once("dialog", (d) => d.accept());
    await page
      .getByRole("button", { name: "Hoàn tác chỉnh sửa", exact: true })
      .click();
  } finally {
    await request.patch(api + "/api/admin/site-config", {
      headers: headers(),
      data: old,
    });
  }
});
test("rich editor preview, safe rendering, draft/publish/unpublish and stable slug", async ({
  page,
  request,
}) => {
  let article;
  try {
    await page.goto("/admin/news?new=1");
    await page.getByLabel(/^Tiêu đề(?: \*)?$/).fill("QA Tin định dạng");
    await expect(
      page.getByLabel("Đường dẫn (slug)", { exact: false }),
    ).toHaveValue("qa-tin-dinh-dang");
    await page
      .getByRole("button", { name: "Thêm khối nội dung", exact: true })
      .click();
    await page
      .getByLabel("Loại nội dung", { exact: true })
      .selectOption("heading");
    await page
      .getByLabel("Nội dung / chú thích", { exact: true })
      .fill("Tiêu đề bài QA");
    await page
      .getByRole("button", { name: "Thêm khối nội dung", exact: true })
      .click();
    await page
      .getByLabel("Nội dung / chú thích", { exact: true })
      .nth(1)
      .fill("<script>window.hacked=true</script>");
    await page.getByLabel("Đậm", { exact: true }).nth(1).check();
    await page
      .getByRole("button", { name: "Thêm khối nội dung", exact: true })
      .click();
    await page
      .getByLabel("Loại nội dung", { exact: true })
      .nth(2)
      .selectOption("list");
    await page
      .getByLabel("Nội dung / chú thích", { exact: true })
      .nth(2)
      .fill("Mục một\nMục hai");
    await page.getByLabel("Nghiêng", { exact: true }).nth(2).check();
    await page
      .getByLabel("Liên kết HTTP/HTTPS", { exact: true })
      .nth(2)
      .fill("https://example.com/qa");
    await page
      .getByRole("button", { name: "Thêm khối nội dung", exact: true })
      .click();
    await page
      .getByLabel("Loại nội dung", { exact: true })
      .nth(3)
      .selectOption("image");
    await page
      .getByLabel("Nội dung / chú thích", { exact: true })
      .nth(3)
      .fill("Ảnh trong bài QA");
    await page
      .getByLabel("URL ảnh trong bài", { exact: true })
      .fill("assets/images/hero/hero-01.png");

    await page
      .getByRole("button", { name: "Xem trước bài viết", exact: true })
      .click();
    await expect(page.locator(".rich-document")).toContainText(
      "<script>window.hacked=true</script>",
    );
    expect(await page.evaluate(() => window.hacked)).toBeUndefined();
    const pending = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/admin/news") && r.request().method() === "POST",
    );
    await saved(page);
    article = await (await pending).json();
    expect(
      (await request.get(api + "/api/news/" + article.slug)).status(),
    ).toBe(404);
    await page
      .getByRole("button", { name: "Đăng QA Tin định dạng", exact: true })
      .click();
    await expect(page.locator(".cms-success")).toContainText(
      "Cập nhật trạng thái thành công.",
    );
    await page.goto("/tin-tuc/" + article.slug);
    await expect(
      page.getByRole("heading", { name: "Tiêu đề bài QA", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".rich-document strong")).toHaveText(
      "<script>window.hacked=true</script>",
    );
    expect(await page.evaluate(() => window.hacked)).toBeUndefined();
    await expect(page.locator(".rich-document li em")).toHaveText([
      "Mục một",
      "Mục hai",
    ]);
    await expect(page.locator(".rich-document li a").first()).toHaveAttribute(
      "href",
      "https://example.com/qa",
    );
    await expect(
      page.getByRole("img", { name: "Ảnh trong bài QA", exact: true }),
    ).toBeVisible();
    await page.goto("/admin/news?edit=" + article.id);
    await page.getByLabel(/^Tiêu đề(?: \*)?$/).fill("QA Tin sửa tiêu đề");
    await expect(
      page.getByLabel("Đường dẫn (slug)", { exact: false }),
    ).toHaveValue(article.slug);
    await saved(page);
    await page
      .getByRole("button", { name: "Gỡ đăng QA Tin sửa tiêu đề", exact: true })
      .click();
    await page.goto("/tin-tuc/" + article.slug);
    await expect(
      page.getByRole("heading", {
        name: "Không tìm thấy nội dung",
        exact: true,
      }),
    ).toBeVisible();
  } finally {
    if (article)
      await request.delete(api + "/api/admin/news/" + article.id, {
        headers: headers(),
      });
  }
});
test("section switches, managed brand, sample confirmation and structured menu zero/null prices", async ({
  page,
  request,
}) => {
  const config = await (
    await request.get(api + "/api/admin/site-config", { headers: headers() })
  ).json();
  const card = await (
    await request.get(api + "/api/admin/content/hotpot", { headers: headers() })
  ).json();
  const db = new PrismaClient();
  const keys = {
    "ca-pheEnabled": "false",
    brandName: "QA Thương hiệu",
    footerText: "QA Footer",
    businessNotice: "QA Thông báo",
    "phong-nghiTitle": "QA Tiêu đề phòng",
    contentConfirmed: "true",
    unpricedLabel: "Hỏi giá",
  };
  try {
    await request.patch(api + "/api/admin/site-config", {
      headers: headers(),
      data: keys,
    });
    await page.goto("/");
    await expect(page.locator("#ca-phe")).toHaveCount(0);
    await expect(page.locator('header a[href$="#ca-phe"]')).toHaveCount(0);
    await expect(page.locator(".footer-brand")).toContainText("QA Footer");
    await expect(
      page.getByRole("heading", { name: "QA Tiêu đề phòng", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("note")).toHaveCount(0);
    await page.goto("/admin/content?edit=hotpot");
    await page
      .getByLabel("Tên món", { exact: true })
      .first()
      .fill("QA Món chưa giá");
    await page
      .getByLabel("Giá (để trống nếu chưa có)", { exact: true })
      .first()
      .fill("");
    await page
      .getByLabel("Tên món", { exact: true })
      .nth(1)
      .fill("QA Món giá 0");
    await page
      .getByLabel("Giá (để trống nếu chưa có)", { exact: true })
      .nth(1)
      .fill("0");
    await saved(page);
    await page.goto("/");
    await page
      .getByRole("button", { name: "Xem thực đơn", exact: true })
      .click();
    await expect(
      page
        .getByRole("dialog")
        .locator("li")
        .filter({ hasText: "QA Món chưa giá" }),
    ).toContainText("Hỏi giá");
    await expect(
      page
        .getByRole("dialog")
        .locator("li")
        .filter({ hasText: "QA Món giá 0" }),
    ).toContainText("0đ");
  } finally {
    await request.patch(api + "/api/admin/content/hotpot", {
      headers: headers(),
      data: { menuItems: card.menuItems },
    });
    await request.patch(api + "/api/admin/site-config", {
      headers: headers(),
      data: config,
    });
    await db.siteConfig.deleteMany({
      where: {
        key: { in: Object.keys(keys).filter((k) => !Object.hasOwn(config, k)) },
      },
    });
    await db.$disconnect();
  }
});
test("server search/status pages and deletion of the last row clamp the page", async ({
  page,
  request,
}) => {
  const ids = [];
  try {
    for (let i = 0; i < 11; i++) {
      const r = await request.post(api + "/api/admin/hero-slides", {
        headers: headers(),
        data: {
          title: "QA Pages " + String(i).padStart(2, "0"),
          isActive: i % 2 === 0,
          sortOrder: i,
        },
      });
      expect(r.status()).toBe(201);
      ids.push((await r.json()).id);
    }
    await page.goto("/admin/hero");
    await page.getByLabel("Tìm kiếm", { exact: true }).fill("QA Pages");
    await expect(page.locator(".cms-toolbar")).toContainText("11 slide");
    await expect(page.locator("tbody tr")).toHaveCount(10);
    await page.getByRole("button", { name: "Trang sau", exact: true }).click();
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await page
      .getByRole("button", { name: "Xóa QA Pages 10", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Xác nhận xóa", exact: true })
      .click();
    await expect(
      page.getByRole("navigation", { name: "Phân trang quản trị" }),
    ).toContainText("Trang 1 / 1");
    await expect(page.locator("tbody tr")).toHaveCount(10);
    await page
      .getByLabel("Lọc trạng thái", { exact: true })
      .selectOption("false");
    await expect(page.locator(".cms-toolbar")).toContainText("5 slide");
    await expect(page.locator("tbody tr")).toHaveCount(5);
  } finally {
    for (const id of ids)
      await request.delete(api + "/api/admin/hero-slides/" + id, {
        headers: headers(),
      });
  }
});
test("actual JWT expiry timer keeps draft and login restores its screen", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/admin/hero?new=1");
  await page
    .getByLabel(/^Tiêu đề(?: \*)?$/)
    .fill("QA Hết phiên theo thời gian");
  await page.clock.fastForward(2 * 60 * 60 * 1000 + 1000);
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("alert")).toContainText(
    "Phiên đăng nhập đã hết hạn",
  );
  await page.clock.setSystemTime(new Date());
  await page
    .getByLabel("Email", { exact: true })
    .fill(process.env.E2E_ADMIN_EMAIL);
  await page
    .getByLabel("Mật khẩu", { exact: true })
    .fill(process.env.E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/hero\?new=1$/);
  await page
    .getByRole("button", { name: "Khôi phục bản nháp", exact: true })
    .click();
  await expect(page.getByLabel(/^Tiêu đề(?: \*)?$/)).toHaveValue(
    "QA Hết phiên theo thời gian",
  );
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Hủy chỉnh sửa", exact: true })
    .click();
  await expect(page.getByRole("table")).toBeVisible();
});
test("many rooms, long content and a genuinely missing image remain usable", async ({
  page,
  request,
}) => {
  const ids = [];
  try {
    for (let i = 0; i < 8; i++) {
      const r = await request.post(api + "/api/admin/rooms", {
        headers: headers(),
        data: {
          name: "QA Nhiều phòng " + i + (i === 0 ? " rất dài ".repeat(80) : ""),
          slug: "qa-many-rooms-" + i,
          price: 0,
          maxGuests: 2,
          imageUrl: "assets/images/does-not-exist.png",
          sortOrder: 0,
        },
      });
      expect(r.status()).toBe(201);
      ids.push((await r.json()).id);
    }
    await page.goto("/");
    await expect(page.locator("#room-layout .room-side-card")).toHaveCount(3);
    await expect(
      page.locator("#room-layout .image-unavailable").first(),
    ).toBeVisible();
    await page.setViewportSize({ width: 320, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Xem tất cả phòng", exact: true })
      .click();
    await expect(
      page.getByRole("dialog").locator(".all-room-card"),
    ).toHaveCount(12);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  } finally {
    for (const id of ids)
      await request.delete(api + "/api/admin/rooms/" + id, {
        headers: headers(),
      });
  }
});
