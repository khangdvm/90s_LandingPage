import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
const api = "http://localhost:3100";
let token;
const headers = () => ({ Authorization: `Bearer ${token}` });
const photo = "assets/images/hero/hero-01.png";
test.beforeAll(async ({ request }) => {
  const login = await request.post(api + "/api/admin/login", {
    data: {
      email: process.env.E2E_ADMIN_EMAIL,
      password: process.env.E2E_ADMIN_PASSWORD,
    },
  });
  expect(login.status()).toBe(200);
  token = (await login.json()).token;
});
test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    (t) => sessionStorage.setItem("90s.cms.session", t),
    token,
  );
  page.__errors = [];
  page.on("pageerror", (e) => page.__errors.push(e.message));
});
test.afterEach(async ({ page }) => expect(page.__errors).toEqual([]));
async function save(page) {
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(page.locator(".cms-success")).toContainText(
    "Lưu thay đổi thành công.",
  );
}
async function upload(request) {
  const r = await request.post(api + "/api/admin/uploads/video", {
    headers: headers(),
    multipart: {
      video: {
        name: "clip.mp4",
        mimeType: "video/mp4",
        buffer: await readFile("tests/fixtures/sample.mp4"),
      },
    },
  });
  expect(r.status()).toBe(201);
  return (await r.json()).url;
}
async function playback(video) {
  await expect(video).toBeVisible();
  await expect(video).toHaveJSProperty("controls", true);
  await expect
    .poll(() => video.evaluate((v) => v.readyState))
    .toBeGreaterThanOrEqual(2);
  await video.evaluate((v) => v.play());
  await expect
    .poll(() => video.evaluate((v) => v.currentTime))
    .toBeGreaterThan(0);
  await video.evaluate((v) => v.pause());
}

test("CMS uploads a real video, mixes photos, reorders and plays on room detail", async ({
  page,
  request,
}) => {
  test.setTimeout(60000);
  let id;
  const slug = "qa-mixed-media-" + Date.now();
  try {
    await page.goto("/admin/rooms?new=1");
    await page
      .getByLabel("Tên phòng", { exact: false })
      .fill("QA Phòng ảnh và video");
    await page.getByLabel("Đường dẫn (slug)", { exact: false }).fill(slug);
    await page
      .getByLabel("Tiêu đề phụ", { exact: true })
      .fill("Không gian qua ảnh và chuyển động");
    await page
      .getByRole("button", { name: "Thêm ảnh hoặc video", exact: true })
      .click();
    await page
      .getByLabel("Loại media 1", { exact: true })
      .selectOption("video");
    await page
      .getByLabel("Chú thích media 1", { exact: true })
      .fill("Video phòng");
    await page
      .getByLabel("Chọn video từ máy", { exact: true })
      .setInputFiles("tests/fixtures/sample.mp4");
    await expect(page.getByLabel("URL media 1", { exact: true })).toHaveValue(
      /^\/uploads\/.+\.mp4$/,
    );
    await page
      .getByRole("button", { name: "Thêm ảnh hoặc video", exact: true })
      .click();
    await page.getByLabel("URL media 2", { exact: true }).fill(photo);
    await page
      .getByLabel("Chú thích media 2", { exact: true })
      .fill("Ảnh phòng");
    await save(page);
    const rooms = await (
      await request.get(api + "/api/admin/rooms", { headers: headers() })
    ).json();
    id = rooms.find((room) => room.slug === slug)?.id;
    expect(id).toBeTruthy();
    await page.goto("/phong/" + slug);
    await expect(
      page.getByRole("heading", { name: "QA Phòng ảnh và video", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Không gian qua ảnh và chuyển động", { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".updated-at time")).toHaveAttribute(
      "datetime",
      /T/,
    );
    await playback(page.locator("video.detail-media"));
    await page.getByRole("button", { name: "Xem ảnh 2", exact: true }).click();
    await expect(page.locator("img.detail-media")).toHaveAttribute(
      "src",
      /hero-01\.png$/,
    );
    await expect(page.locator("video.detail-media")).toHaveCount(0);
    await page.goto("/admin/rooms?edit=" + id);
    await page
      .getByRole("button", { name: "Đưa media lên", exact: true })
      .nth(1)
      .click();
    await save(page);
    await page.goto("/phong/" + slug);
    await expect(page.locator("img.detail-media")).toBeVisible();
    await page.setViewportSize({ width: 320, height: 780 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Xem video 2", exact: true })
      .click();
    await playback(page.locator("video.detail-media"));
    await page
      .getByRole("button", { name: "Xem hạng phòng khác", exact: true })
      .click();
    await expect(page).toHaveURL(/\/#phong-nghi$/);
    await expect(page.locator("#phong-nghi")).toBeVisible();
  } finally {
    if (id)
      await request.delete(api + "/api/admin/rooms/" + id, {
        headers: headers(),
      });
  }
});

test("complete articles render headings, subtitle, images, times and real room links", async ({
  page,
  request,
}) => {
  const rows = await (
    await request.get(api + "/api/admin/news", { headers: headers() })
  ).json();
  for (const row of rows.filter((r) => /^(90s|tam-dao)-\d+$/.test(r.id))) {
    expect(row.title).not.toContain("Bài mẫu");
    expect(row.subtitle).toBeTruthy();
    expect(row.content).not.toBe(row.excerpt);
    expect(row.contentDoc.some((b) => b.type === "heading")).toBe(true);
    expect(row.contentDoc.some((b) => b.type === "image")).toBe(true);
  }
  await page.goto("/tin-tuc/90s-1");
  await expect(
    page.getByRole("heading", { name: "Một điểm hẹn giữa núi", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".detail-subtitle")).toContainText(
    "Dành một khoảng nghỉ",
  );
  await expect(page.locator(".rich-document figure img")).toBeVisible();
  await expect(page.locator(".updated-at time")).toHaveAttribute(
    "datetime",
    /T/,
  );
  await page
    .getByRole("link", {
      name: "Xem phòng đôi view núi và thông tin lưu trú tại 90s",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/phong\/double$/);
  await expect(
    page.getByRole("heading", { name: "Phòng đôi view núi", exact: true }),
  ).toBeVisible();
});

test("content detail supports mixed media, room CTA, refresh and disabled 404", async ({
  page,
  request,
}) => {
  test.setTimeout(60000);
  let id;
  try {
    const videoUrl = await upload(request);
    await page.goto("/admin/content?new=1");
    await page
      .getByLabel("Nhóm nội dung", { exact: true })
      .selectOption("experience");
    await page
      .getByLabel("Tiêu đề", { exact: false })
      .first()
      .fill("QA Nội dung đầy đủ");
    await page
      .getByLabel("Tiêu đề phụ", { exact: true })
      .fill("Phụ đề nội dung");
    await page
      .getByLabel("Mô tả", { exact: true })
      .fill("Đọc thông tin, xem media và khám phá hạng phòng phù hợp.");
    await page
      .getByLabel("Nhãn nút liên hệ", { exact: true })
      .fill("Xem phòng đôi");
    await page
      .getByLabel("Liên kết nút", { exact: true })
      .fill("/phong/double");
    await page
      .getByRole("button", { name: "Thêm ảnh hoặc video", exact: true })
      .click();
    await page.getByLabel("URL media 1", { exact: true }).fill(photo);
    await page
      .getByRole("button", { name: "Thêm ảnh hoặc video", exact: true })
      .click();
    await page
      .getByLabel("Loại media 2", { exact: true })
      .selectOption("video");
    await page.getByLabel("URL media 2", { exact: true }).fill(videoUrl);
    await save(page);
    const rows = await (
      await request.get(api + "/api/admin/content", { headers: headers() })
    ).json();
    id = rows.find((row) => row.title === "QA Nội dung đầy đủ")?.id;
    expect(id).toBeTruthy();
    await page.goto("/noi-dung/" + id);
    await expect(
      page.getByRole("heading", { name: "QA Nội dung đầy đủ", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Phụ đề nội dung", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Xem video 2", exact: true })
      .click();
    await playback(page.locator("video.detail-media"));
    await page.reload();
    await expect(page.locator("img.detail-media")).toBeVisible();
    const menuUpdate = await request.patch(api + "/api/admin/content/" + id, {
      headers: headers(),
      data: {
        section: "restaurant",
        menuItems: [
          {
            name: "QA Món có ảnh",
            price: 0,
            unit: "phần",
            description: "Mô tả món",
            imageUrl: photo,
            isActive: true,
            sortOrder: 0,
          },
        ],
      },
    });
    expect(menuUpdate.status()).toBe(200);
    await page.reload();
    await expect(page.locator(".menu-dishes img")).toHaveAttribute(
      "alt",
      "QA Món có ảnh",
    );
    await expect(page.locator(".menu-dishes")).toContainText("0đ / phần");
    await page
      .getByRole("button", { name: "Nhận tư vấn", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText(
      "bữa ăn và bàn phù hợp",
    );
    await page.locator("#close-modal").click();
    await page
      .getByRole("link", { name: "Xem phòng đôi", exact: true })
      .click();
    await expect(page).toHaveURL(/\/phong\/double$/);
    const r = await request.patch(api + "/api/admin/content/" + id, {
      headers: headers(),
      data: { isActive: false },
    });
    expect(r.status()).toBe(200);
    await page.goto("/noi-dung/" + id);
    await expect(
      page.getByRole("heading", {
        name: "Không tìm thấy nội dung",
        exact: true,
      }),
    ).toBeVisible();
  } finally {
    if (id)
      await request.delete(api + "/api/admin/content/" + id, {
        headers: headers(),
      });
  }
});

test("hero video plays without autoplay sound and stops when moving to next image", async ({
  page,
  request,
}) => {
  const slides = await (
    await request.get(api + "/api/admin/hero-slides", { headers: headers() })
  ).json();
  const slide = slides[0];
  try {
    const videoUrl = await upload(request);
    const r = await request.patch(api + "/api/admin/hero-slides/" + slide.id, {
      headers: headers(),
      data: {
        media: [
          { type: "video", src: videoUrl, alt: "Video giới thiệu" },
          { type: "image", src: photo, alt: "Ảnh giới thiệu" },
        ],
      },
    });
    expect(r.status()).toBe(200);
    await page.goto("/");
    await expect(page.locator(".hero-slide")).toHaveCount(slides.length + 1);
    const video = page.locator(".hero-slide.active video");
    await expect(video).not.toHaveAttribute("autoplay");
    await playback(video);
    await video.evaluate((v) => v.play());
    await page.locator("#hero-next").click();
    await expect(page.locator(".hero-slide.active img")).toBeVisible();
    await expect
      .poll(() => page.locator(".hero-slide video").evaluate((v) => v.paused))
      .toBe(true);
  } finally {
    await request.patch(api + "/api/admin/hero-slides/" + slide.id, {
      headers: headers(),
      data: { media: slide.media || [] },
    });
  }
});

test("article editor uploads a video block and keeps image, subtitle and room link", async ({
  page,
  request,
}) => {
  test.setTimeout(60000);
  let id;
  const slug = "qa-video-article-" + Date.now();
  try {
    const created = await request.post(api + "/api/admin/news", {
      headers: headers(),
      data: {
        title: "QA Bài viết có video",
        subtitle: "Ảnh và video trong cùng bài",
        slug,
        category: "90s",
        isPublished: true,
        imageUrl: photo,
        content: "Nội dung giới thiệu không bị mất khi soạn media.",
      },
    });
    expect(created.status()).toBe(201);
    id = (await created.json()).id;
    await page.goto("/admin/news?edit=" + id);
    await page
      .getByRole("button", { name: "Thêm khối nội dung", exact: true })
      .click();
    await page
      .getByLabel("Loại nội dung", { exact: true })
      .last()
      .selectOption("video");
    await page
      .getByLabel("Nội dung / chú thích", { exact: true })
      .last()
      .fill("Video giới thiệu chuyến đi");
    await page
      .getByLabel("Chọn video từ máy", { exact: true })
      .setInputFiles("tests/fixtures/sample.mp4");
    await expect(
      page.getByLabel("URL video trong bài", { exact: true }),
    ).toHaveValue(/^\/uploads\/.+\.mp4$/);
    await page
      .getByRole("button", { name: "Thêm khối nội dung", exact: true })
      .click();
    await page
      .getByLabel("Nội dung / chú thích", { exact: true })
      .last()
      .fill("Xem hạng phòng phù hợp");
    await page
      .getByLabel("Liên kết HTTP/HTTPS hoặc trang chi tiết", { exact: true })
      .last()
      .fill("/phong/double");
    await page
      .getByRole("button", { name: "Thêm khối nội dung", exact: true })
      .click();
    await page
      .getByLabel("Nội dung / chú thích", { exact: true })
      .last()
      .fill("Xem danh sách phòng");
    await page
      .getByLabel("Liên kết HTTP/HTTPS hoặc trang chi tiết", { exact: true })
      .last()
      .fill("#phong-nghi");
    await page
      .getByRole("button", { name: "Xem trước bài viết", exact: true })
      .click();
    await playback(page.locator(".rich-document video"));
    await save(page);
    await page.goto("/tin-tuc/" + slug);
    await expect(page.locator(".detail-subtitle")).toHaveText(
      "Ảnh và video trong cùng bài",
    );
    await expect(page.locator(".media-gallery img.detail-media")).toBeVisible();
    await playback(page.locator(".rich-document video"));
    await expect(page.locator(".rich-document")).toContainText(
      "Nội dung giới thiệu không bị mất khi soạn media.",
    );
    await page
      .getByRole("link", { name: "Xem danh sách phòng", exact: true })
      .click();
    await expect(page).toHaveURL(/\/#phong-nghi$/);
    await page.goto("/tin-tuc/" + slug);
    await page
      .getByRole("link", { name: "Xem hạng phòng phù hợp", exact: true })
      .click();
    await expect(page).toHaveURL(/\/phong\/double$/);
  } finally {
    if (id)
      await request.delete(api + "/api/admin/news/" + id, {
        headers: headers(),
      });
  }
});

test("drafts from before media/subtitle fields restore and save with current defaults", async ({
  page,
  request,
}) => {
  let id;
  const name = "QA Bản nháp phiên bản cũ " + Date.now();
  page.on("dialog", (dialog) => dialog.accept());
  try {
    await page.goto("/admin/rooms?new=1");
    await page.getByLabel("Tên phòng", { exact: false }).fill(name);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const key = Object.keys(localStorage).find(
            (k) => k.startsWith("90s.draft.") && k.endsWith(".rooms.new"),
          );
          return key ? JSON.parse(localStorage.getItem(key)).value.name : "";
        }),
      )
      .toBe(name);
    await page.evaluate(() => {
      const key = Object.keys(localStorage).find(
        (k) => k.startsWith("90s.draft.") && k.endsWith(".rooms.new"),
      );
      const old = JSON.parse(localStorage.getItem(key));
      delete old.value.media;
      delete old.value.subtitle;
      old.value.obsoleteField = "Không gửi trường đã bỏ lên API";
      localStorage.setItem(key, JSON.stringify(old));
    });
    await page.reload();
    await page
      .getByRole("button", { name: "Khôi phục bản nháp", exact: true })
      .click();
    await expect(page.getByLabel("Tên phòng", { exact: false })).toHaveValue(
      name,
    );
    await expect(page.getByLabel("Tiêu đề phụ", { exact: true })).toHaveValue(
      "",
    );
    await save(page);
    const rows = await (
      await request.get(api + "/api/admin/rooms", { headers: headers() })
    ).json();
    const room = rows.find((row) => row.name === name);
    id = room?.id;
    expect(id).toBeTruthy();
    expect(room.media).toEqual([]);
    expect(room.subtitle).toBe("");
  } finally {
    if (id)
      await request.delete(api + "/api/admin/rooms/" + id, {
        headers: headers(),
      });
  }
});
