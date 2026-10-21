import { PrismaClient } from "../server/node_modules/@prisma/client/index.js";
import { test, expect } from "@playwright/test";
const api = "http://localhost:3100";
let token;
const auth = () => ({ Authorization: "Bearer " + token });
const read = async (request, path) =>
  (await request.get(api + "/api/admin/" + path, { headers: auth() })).json();
const patch = async (request, path, data) => {
  const r = await request.patch(api + "/api/admin/" + path, {
    headers: auth(),
    data,
  });
  expect(r.status()).toBe(200);
};
async function save(page) {
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(page.locator(".cms-success")).toContainText(
    "Lưu thay đổi thành công.",
  );
}
test.beforeAll(async ({ request }) => {
  if (!new URL(process.env.DATABASE_URL).pathname.endsWith("_test"))
    throw Error("Only a dedicated test database is allowed");
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
  page.__errors = [];
  page.on("pageerror", (e) => page.__errors.push(e.message));
  await page.goto("/admin/login");
  await page.evaluate(
    (t) => sessionStorage.setItem("90s.cms.session", t),
    token,
  );
});
test.afterEach(async ({ page }) => expect(page.__errors).toEqual([]));
test("delete every menu item stays empty after reopen and on public", async ({
  page,
  request,
}) => {
  const card = await read(request, "content/hotpot");
  try {
    await page.goto("/admin/content?edit=hotpot");
    await expect(
      page.getByLabel("Tên món", { exact: true }).first(),
    ).toBeVisible();
    while (
      await page.getByRole("button", { name: "Xóa món", exact: true }).count()
    )
      await page
        .getByRole("button", { name: "Xóa món", exact: true })
        .last()
        .click();
    await save(page);
    expect((await read(request, "content/hotpot")).menuItems).toEqual([]);
    await page.goto("/admin/content?edit=hotpot");
    await expect(
      page.getByRole("heading", {
        name: "Chỉnh sửa thẻ nội dung",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByLabel("Tên món", { exact: true })).toHaveCount(0);
    await page.goto("/");
    await page
      .getByRole("button", { name: "Xem thực đơn", exact: true })
      .click();
    await expect(page.locator(".menu-dishes li")).toHaveCount(0);
    await expect(page.getByRole("dialog")).toContainText("Chưa có món");
  } finally {
    await patch(request, "content/hotpot", { menuItems: card.menuItems });
  }
});
test("browser Back and Forward match editor URL without leaving stale forms", async ({
  page,
}) => {
  await page.goto("/admin/rooms");
  await page
    .getByRole("button", { name: "Sửa Phòng đôi view núi", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Chỉnh sửa phòng", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL("/admin/rooms");
  await expect(page.getByRole("table")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Chỉnh sửa phòng", exact: true }),
  ).toHaveCount(0);
  await page.goForward();
  await expect(page).toHaveURL(/edit=double/);
  await expect(page.getByLabel("Tên phòng", { exact: false })).toHaveValue(
    "Phòng đôi view núi",
  );
});
test("plaintext article preview contains the legacy content", async ({
  page,
  request,
}) => {
  const rows = await read(request, "news");
  await page.goto("/admin/news?edit=" + rows[0].id);
  await expect(
    page.getByLabel("Nội dung bài viết", { exact: true }),
  ).toBeVisible();
  const text = await page
    .getByLabel("Nội dung bài viết", { exact: true })
    .inputValue();
  expect(text.length).toBeGreaterThan(0);
  await page
    .getByRole("button", { name: "Xem trước bài viết", exact: true })
    .click();
  await expect(page.locator(".cms-stack .public-text")).toHaveText(text);
});
test("real upload cannot be bypassed by preview and does not lose other edits", async ({
  page,
  request,
}) => {
  let release;
  const held = new Promise((r) => (release = r));
  let received;
  const ready = new Promise((r) => (received = r));
  let item;
  await page.route("**/api/admin/uploads", async (route) => {
    received();
    await held;
    await route.continue();
  });
  try {
    await page.goto("/admin/news?new=1");
    await page.getByLabel(/^Tiêu đề(?: \*)?$/).fill("Audit Upload Article");
    await page
      .getByLabel("Đường dẫn (slug)", { exact: false })
      .fill("audit-upload-article");
    await page
      .getByRole("button", { name: "Thêm khối nội dung", exact: true })
      .click();
    await page
      .getByLabel("Loại nội dung", { exact: true })
      .selectOption("image");
    await page
      .getByLabel("Chọn ảnh từ máy", { exact: true })
      .first()
      .setInputFiles("public/assets/images/hero/hero-01.png");
    await ready;
    await expect(
      page.getByRole("button", { name: "Xem trước bài viết", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Xóa khối", exact: true }),
    ).toBeDisabled();
    await page
      .getByLabel("Tóm tắt", { exact: true })
      .fill("Giữ thay đổi này khi upload hoàn tất");
    await page
      .getByRole("button", { name: "Lưu thay đổi", exact: true })
      .click();
    await expect(
      page.getByText("Chờ upload ảnh hoàn tất trước khi lưu.", { exact: true }),
    ).toBeVisible();
    const uploaded = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/admin/uploads") &&
        r.request().method() === "POST",
    );
    release();
    expect((await uploaded).status()).toBe(201);
    await expect(
      page.getByLabel("URL ảnh trong bài", { exact: true }),
    ).toHaveValue(/^\/uploads\//);
    await expect(page.getByLabel("Tóm tắt", { exact: true })).toHaveValue(
      "Giữ thay đổi này khi upload hoàn tất",
    );
    const pending = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/admin/news") && r.request().method() === "POST",
    );
    await save(page);
    item = await (await pending).json();
    expect(item.contentDoc[0].src).toMatch(/^\/uploads\//);
  } finally {
    release();
    if (item)
      await request.delete(api + "/api/admin/news/" + item.id, {
        headers: auth(),
      });
  }
});
test("public card survives an unavailable CTA and still opens its details", async ({
  page,
  request,
}) => {
  const card = await read(request, "content/grill");
  const config = await read(request, "site-config");
  try {
    await patch(request, "site-config", { "ca-pheEnabled": "false" });
    await patch(request, "content/grill", { ctaTarget: "#ca-phe" });
    await page.goto("/");
    const button = page.locator("#nha-hang [data-food=grill]");
    await expect(button).toBeVisible();
    await button.click();
    await expect(page.getByRole("dialog")).toContainText(card.title);
  } finally {
    await patch(request, "content/grill", { ctaTarget: card.ctaTarget });
    if (Object.hasOwn(config, "ca-pheEnabled"))
      await patch(request, "site-config", {
        "ca-pheEnabled": config["ca-pheEnabled"],
      });
    else {
      const db = new PrismaClient();
      await db.siteConfig.deleteMany({ where: { key: "ca-pheEnabled" } });
      await db.$disconnect();
    }
  }
});
test("detail consultation closes with Escape and restores keyboard focus", async ({
  page,
}) => {
  await page.goto("/phong/double");
  const open = page.getByRole("button", { name: "Nhận tư vấn", exact: true });
  await open.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(open).toBeFocused();
});

async function restoreKeys(request, before, keys) {
  const existing = Object.fromEntries(
    keys.filter((k) => Object.hasOwn(before, k)).map((k) => [k, before[k]]),
  );
  if (Object.keys(existing).length)
    await patch(request, "site-config", existing);
  const missing = keys.filter((k) => !Object.hasOwn(before, k));
  if (missing.length) {
    const db = new PrismaClient();
    try {
      await db.siteConfig.deleteMany({ where: { key: { in: missing } } });
    } finally {
      await db.$disconnect();
    }
  }
}
test("invalid contact values cannot become broken call or external links", async ({
  page,
  request,
}) => {
  await page.goto("/admin/settings");
  await page.getByLabel("Hotline", { exact: true }).fill("---");
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(
    page.getByText("Số điện thoại không hợp lệ.", { exact: true }),
  ).toBeVisible();
  expect(
    (
      await request.patch(api + "/api/admin/site-config", {
        headers: auth(),
        data: { hotline: "---" },
      })
    ).status(),
  ).toBe(400);
  await page.getByLabel("Hotline", { exact: true }).fill("1900 1234");
  await page
    .getByLabel("Liên kết Zalo", { exact: true })
    .fill("http:zalo.me/invalid");
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(
    page.locator("#cms-zaloUrl-help .cms-field-error"),
  ).toBeVisible();
});
test("failed editor load has a working retry and missing records have an exit", async ({
  page,
  context,
}) => {
  await page.goto("/admin/rooms?edit=audit-does-not-exist");
  await expect(page.getByRole("alert")).toContainText(
    "Nội dung không còn tồn tại",
  );
  await page.getByRole("button", { name: "Về danh sách", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  try {
    await context.setOffline(true);
    await page
      .getByRole("button", { name: "Sửa Phòng đôi view núi", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "Không thể kết nối máy chủ",
    );
    await context.setOffline(false);
    await page.getByRole("button", { name: "Thử lại", exact: true }).click();
    await expect(page.getByLabel("Tên phòng", { exact: false })).toHaveValue(
      "Phòng đôi view núi",
    );
  } finally {
    await context.setOffline(false);
  }
});
test("manual revert clears autosave and recovered custom slugs remain editable without silent changes", async ({
  page,
}) => {
  await page.goto("/admin/rooms?new=1");
  await page.getByLabel("Tên phòng", { exact: false }).fill("Audit Temporary");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Object.keys(localStorage).filter((k) => k.endsWith("rooms.new"))
            .length,
      ),
    )
    .toBe(1);
  await page.getByLabel("Tên phòng", { exact: false }).fill("");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Object.keys(localStorage).filter((k) => k.endsWith("rooms.new"))
            .length,
      ),
    )
    .toBe(0);
  await page
    .getByLabel("Tên phòng", { exact: false })
    .fill("Audit Restore Slug");
  await page
    .getByLabel("Đường dẫn (slug)", { exact: false })
    .fill("audit-custom-slug");
  page.on("dialog", (d) => d.accept());
  await page.reload();
  await page
    .getByRole("button", { name: "Khôi phục bản nháp", exact: true })
    .click();
  await page.getByLabel("Tên phòng", { exact: false }).fill("Audit New Name");
  await expect(
    page.getByLabel("Đường dẫn (slug)", { exact: false }),
  ).toHaveValue("audit-custom-slug");
  await page
    .getByRole("button", { name: "Hủy chỉnh sửa", exact: true })
    .click();
});
test("repeated settings saves retain unsaved guards and draft recovery", async ({
  page,
  request,
}) => {
  const before = await read(request, "site-config");
  try {
    await page.goto("/admin/settings");
    await page
      .getByLabel("Nội dung footer", { exact: true })
      .fill("Audit Footer Saved");
    await save(page);
    await page
      .getByLabel("Nội dung footer", { exact: true })
      .fill("Audit Footer Draft");
    const declined = new Promise((resolve) =>
      page.once("dialog", async (d) => {
        await d.dismiss();
        resolve();
      }),
    );
    await page.getByRole("link", { name: "Phòng nghỉ", exact: true }).click();
    await declined;
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
      page.getByLabel("Nội dung footer", { exact: true }),
    ).toHaveValue("Audit Footer Draft");
    await save(page);
    expect((await read(request, "site-config")).footerText).toBe(
      "Audit Footer Draft",
    );
  } finally {
    await restoreKeys(request, before, ["footerText"]);
  }
});
test("drafts from two real admin accounts never appear in each other screens", async ({
  page,
}) => {
  const db = new PrismaClient();
  let second;
  try {
    const admin = await db.admin.findUniqueOrThrow({
      where: { email: process.env.E2E_ADMIN_EMAIL },
    });
    second = await db.admin.create({
      data: {
        email: "audit-second-" + Date.now() + "@example.test",
        name: "Audit second administrator",
        passwordHash: admin.passwordHash,
      },
    });
    const { default: jwt } = await import(
      "../server/node_modules/jsonwebtoken/index.js"
    );
    const secondToken = jwt.sign({}, process.env.JWT_SECRET, {
      algorithm: "HS256",
      subject: second.id,
      expiresIn: "2h",
      issuer: "90s-cms",
      audience: "90s-admin",
    });
    await page.goto("/admin/rooms?edit=double");
    await page
      .getByLabel("Tên phòng", { exact: false })
      .fill("Audit Draft Account A");
    await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
    await expect(page).toHaveURL("/admin/login");
    await page.evaluate(
      (t) => sessionStorage.setItem("90s.cms.session", t),
      secondToken,
    );
    await page.goto("/admin/rooms?edit=double");
    await expect(page.getByLabel("Tên phòng", { exact: false })).toHaveValue(
      "Phòng đôi view núi",
    );
    await expect(
      page.getByRole("button", { name: "Khôi phục bản nháp", exact: true }),
    ).toHaveCount(0);
    await page
      .getByLabel("Tên phòng", { exact: false })
      .fill("Audit Draft Account B");
    await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
    await expect(page).toHaveURL("/admin/login");
    await page.evaluate(
      (t) => sessionStorage.setItem("90s.cms.session", t),
      token,
    );
    await page.goto("/admin/rooms?edit=double");
    await page
      .getByRole("button", { name: "Khôi phục bản nháp", exact: true })
      .click();
    await expect(page.getByLabel("Tên phòng", { exact: false })).toHaveValue(
      "Audit Draft Account A",
    );
    page.once("dialog", (d) => d.accept());
    await page
      .getByRole("button", { name: "Hủy chỉnh sửa", exact: true })
      .click();
  } finally {
    if (second) await db.admin.delete({ where: { id: second.id } });
    await db.$disconnect();
  }
});
test("direct detail pages hide empty-section navigation without changing admin settings", async ({
  page,
  request,
}) => {
  const rows = (await read(request, "content")).filter(
    (x) => x.section === "cafe",
  );
  const before = await read(request, "site-config");
  try {
    for (const row of rows)
      await patch(request, "content/" + row.id, { isActive: false });
    await page.goto("/phong/double");
    await expect(
      page.getByRole("heading", { name: "Phòng đôi view núi", exact: true }),
    ).toBeVisible();
    await expect(page.locator('header a[href$="#ca-phe"]')).toHaveCount(0);
    expect((await read(request, "site-config"))["ca-pheEnabled"]).toBe(
      before["ca-pheEnabled"],
    );
  } finally {
    for (const row of rows)
      await patch(request, "content/" + row.id, { isActive: row.isActive });
  }
});
test("news with an unavailable section link falls back to its real article route", async ({
  page,
  request,
}) => {
  const row = (await read(request, "news")).find((x) => x.category === "90s");
  const before = await read(request, "site-config");
  try {
    await patch(request, "site-config", { "ca-pheEnabled": "false" });
    await patch(request, "news/" + row.id, { href: "#ca-phe" });
    await page.goto("/");
    await page
      .getByRole("link", { name: "Đọc thêm: " + row.title, exact: true })
      .click();
    await expect(page).toHaveURL("/tin-tuc/" + row.slug);
    await expect(
      page.getByRole("heading", { name: row.title, exact: true }),
    ).toBeVisible();
  } finally {
    await patch(request, "news/" + row.id, { href: row.href });
    await restoreKeys(request, before, ["ca-pheEnabled"]);
  }
});
test("menu order, hiding an item and nested image upload persist without losing other edits", async ({
  page,
  request,
}) => {
  const row = await read(request, "content/hotpot");
  let release;
  const held = new Promise((r) => (release = r));
  let received;
  const ready = new Promise((r) => (received = r));
  await page.route("**/api/admin/uploads", async (route) => {
    received();
    await held;
    await route.continue();
  });
  try {
    await page.goto("/admin/content?edit=hotpot");
    await page
      .getByLabel("Tên món", { exact: true })
      .first()
      .fill("Audit Dish A");
    await page
      .getByLabel("Tên món", { exact: true })
      .nth(1)
      .fill("Audit Dish B");
    await page
      .getByRole("button", { name: "Đưa món lên", exact: true })
      .nth(1)
      .click();
    await expect(
      page.getByLabel("Tên món", { exact: true }).first(),
    ).toHaveValue("Audit Dish B");
    await page.getByLabel("Hiển thị món", { exact: true }).first().uncheck();
    await page
      .getByLabel("Chọn ảnh từ máy", { exact: true })
      .nth(2)
      .setInputFiles("public/assets/images/hero/hero-01.png");
    await ready;
    await expect(
      page.getByRole("button", { name: "Xóa món", exact: true }).first(),
    ).toBeDisabled();
    await expect(
      page.getByLabel("Tên món", { exact: true }).nth(1),
    ).toBeDisabled();
    await page
      .getByLabel(/^Tiêu đề(?: \*)?$/)
      .fill("Audit Restaurant New Title");
    const uploaded = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/admin/uploads") &&
        r.request().method() === "POST",
    );
    release();
    expect((await uploaded).status()).toBe(201);
    await expect(
      page.getByLabel("Ảnh món", { exact: true }).nth(1),
    ).toHaveValue(/^\/uploads\//);
    await expect(page.getByLabel(/^Tiêu đề(?: \*)?$/)).toHaveValue(
      "Audit Restaurant New Title",
    );
    await save(page);
    const current = await read(request, "content/hotpot");
    expect(current.menuItems[0].name).toBe("Audit Dish B");
    expect(current.menuItems[0].isActive).toBe(false);
    expect(current.menuItems[1].imageUrl).toMatch(/^\/uploads\//);
    await page.goto("/");
    await page
      .getByRole("button", { name: "Xem thực đơn", exact: true })
      .click();
    await expect(page.locator(".menu-dishes")).toContainText("Audit Dish A");
    await expect(page.locator(".menu-dishes")).not.toContainText(
      "Audit Dish B",
    );
  } finally {
    release();
    await patch(request, "content/hotpot", {
      title: row.title,
      menuItems: row.menuItems,
    });
  }
});

test("image upload errors and network retry recover on the same form", async ({
  page,
  context,
}) => {
  await page.goto("/admin/rooms?edit=double");
  await expect(page.getByLabel("Tên phòng", { exact: false })).toHaveValue(
    "Phòng đôi view núi",
  );
  const choose = page.getByLabel("Chọn ảnh từ máy", { exact: true });
  await choose.setInputFiles({
    name: "broken.png",
    mimeType: "image/png",
    buffer: Buffer.from("not an image"),
  });
  await expect(page.getByRole("alert")).toContainText("không phải ảnh hợp lệ");
  try {
    await context.setOffline(true);
    await choose.setInputFiles("public/assets/images/hero/hero-01.png");
    await expect(page.getByRole("alert")).toContainText(
      "Không thể kết nối máy chủ",
    );
    await context.setOffline(false);
    await page
      .getByRole("button", { name: "Thử lại upload", exact: true })
      .click();
    await expect(
      page.getByLabel("URL hoặc đường dẫn ảnh", { exact: true }),
    ).toHaveValue(/^\/uploads\//);
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.getByAltText("Ảnh xem trước nội dung")).toBeVisible();
    page.once("dialog", (d) => d.accept());
    await page
      .getByRole("button", { name: "Hủy chỉnh sửa", exact: true })
      .click();
    await expect(page.getByRole("table")).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
test("a hero CTA with a legacy placeholder opens consultation instead of a dead anchor", async ({
  page,
  request,
}) => {
  const slide = (await read(request, "hero-slides"))[0];
  const before = await read(request, "site-config");
  try {
    await patch(request, "site-config", { "lien-heEnabled": "false" });
    await patch(request, "hero-slides/" + slide.id, {
      ctaTarget: "#",
      ctaText: "Audit Consultation",
    });
    await page.goto("/");
    await page
      .locator(".hero-slide.active")
      .getByRole("link", { name: "Audit Consultation", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText("Nhận tư vấn");
    await expect(page.getByRole("dialog")).toContainText(
      "Giao diện này không gửi yêu cầu tự động.",
    );
  } finally {
    await patch(request, "hero-slides/" + slide.id, {
      ctaTarget: slide.ctaTarget,
      ctaText: slide.ctaText,
    });
    await restoreKeys(request, before, ["lien-heEnabled"]);
  }
});

test("selected dates and guests reach room consultation and survive Back", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Ngày dự kiến", exact: false })
    .click();
  await page.getByLabel("Ngày đến dự kiến", { exact: true }).fill("2099-10-21");
  await page.getByLabel("Ngày về dự kiến", { exact: true }).fill("2099-10-22");
  await page
    .getByLabel("Số khách mỗi phòng", { exact: true })
    .selectOption("4");
  await page.getByLabel("View yêu thích", { exact: true }).selectOption("town");
  await page
    .getByRole("button", { name: "Xem phòng phù hợp", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Xem Phòng gia đình", exact: true })
    .click();
  await expect(page).toHaveURL("/phong/family");
  await page.getByRole("button", { name: "Nhận tư vấn", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("21/10/2099");
  await expect(page.getByRole("dialog")).toContainText("22/10/2099");
  await expect(page.getByRole("dialog")).toContainText("4 khách/phòng");
  await page.keyboard.press("Escape");
  await page.goBack();
  await expect(page.locator("[data-view=town]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#room-result")).toContainText("cho 4 khách");
  await expect(page.locator("#open-stay")).toContainText("21/10/2099");
});
test("returning from a news article keeps category and server page", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Về Tam Đảo", exact: true }).click();
  await page.getByRole("button", { name: "Trang 2", exact: true }).click();
  await expect(page.locator("#news-grid article")).toHaveCount(2);
  await page
    .locator("#news-grid")
    .getByRole("link", { name: /Đọc thêm:/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/tin-tuc\//);
  await page.goBack();
  await expect(page.locator("[data-category=tam-dao]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.locator("#news-pagination [aria-current=page]"),
  ).toContainText("2");
  await expect(page.locator("#news-grid article")).toHaveCount(2);
});

test("an upload retry cannot follow a different menu item after reordering", async ({
  page,
  context,
}) => {
  await page.goto("/admin/content?edit=hotpot");
  await expect(
    page.getByLabel("Tên món", { exact: true }).first(),
  ).toBeVisible();
  try {
    await context.setOffline(true);
    await page
      .getByLabel("Chọn ảnh từ máy", { exact: true })
      .nth(1)
      .setInputFiles("public/assets/images/hero/hero-01.png");
    await expect(page.getByRole("alert")).toContainText(
      "Không thể kết nối máy chủ",
    );
    await context.setOffline(false);
    await page
      .getByRole("button", { name: "Đưa món lên", exact: true })
      .nth(1)
      .click();
    await expect(
      page.getByRole("button", { name: "Thử lại upload", exact: true }),
    ).toHaveCount(0);
    await expect(page.getByRole("alert")).toHaveCount(0);
    page.once("dialog", (d) => d.accept());
    await page
      .getByRole("button", { name: "Hủy chỉnh sửa", exact: true })
      .click();
  } finally {
    await context.setOffline(false);
  }
});
