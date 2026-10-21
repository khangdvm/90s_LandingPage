import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { readFile, readdir } from "node:fs/promises";
import { createApp } from "../src/app.js";
import { uploadDir } from "../src/routes/uploads.js";
import { validMedia, video, validDoc } from "../../shared/content.js";
import { editorialNews } from "../prisma/editorial-data.js";

test("media validation and complete editorial defaults", () => {
  assert.equal(Object.keys(editorialNews).length, 16);
  for (const article of Object.values(editorialNews)) {
    assert.ok(
      article.title && article.subtitle && article.excerpt && article.imageUrl,
    );
    assert.notEqual(article.content, article.excerpt);
    assert.ok(
      article.contentDoc.filter((b) => b.type === "paragraph").length >= 3,
    );
    assert.ok(article.contentDoc.some((b) => b.type === "heading"));
    assert.ok(validDoc(article.contentDoc));
    assert.ok(article.contentDoc.some((b) => b.href === "/phong/double"));
    assert.ok(!article.title.includes("Bài mẫu"));
  }
  for (const bad of [
    "javascript:alert(1)",
    "//evil.test/a.mp4",
    "/uploads/../../a.mp4",
    "https://youtube.com/watch?v=123",
    "https://user:pass@example.com/a.mp4",
  ])
    assert.equal(video(bad), false);
  assert.ok(video("https://example.com/clip.mp4?token=abc"));
  assert.ok(
    validMedia([
      { type: "video", src: "assets/video.webm", alt: "Video" },
      { type: "image", src: "assets/test.png", alt: "Ảnh" },
    ]),
  );
  assert.equal(
    validMedia([{ type: "video", src: "#phong-nghi", alt: "" }]),
    false,
  );
  assert.equal(
    validMedia(
      Array(31).fill({ type: "image", src: "assets/test.png", alt: "" }),
    ),
    false,
  );
  assert.equal(
    validDoc([{ type: "video", text: "", src: "javascript:alert(1)" }]),
    false,
  );
  assert.ok(
    validDoc([{ type: "video", text: "Clip", src: "assets/demo.mp4" }]),
  );
});

test(
  "real video upload, range playback, media CRUD and content detail visibility",
  { skip: process.env.RUN_DB_TESTS !== "1" },
  async (t) => {
    if (!new URL(process.env.DATABASE_URL).pathname.endsWith("_test"))
      throw Error("Only _test database");
    const { PrismaClient } = await import("@prisma/client");
    const db = new PrismaClient();
    const app = createApp({ db, jwtSecret: process.env.JWT_SECRET });
    const created = [];
    t.after(async () => {
      for (const [model, id] of created)
        await db[model].deleteMany({ where: { id } });
      await db.$disconnect();
    });
    const auth = await request(app)
      .post("/api/admin/login")
      .send({
        email: process.env.SEED_ADMIN_EMAIL,
        password: process.env.SEED_ADMIN_PASSWORD,
      })
      .expect(200);
    const headers = { Authorization: "Bearer " + auth.body.token };
    const clip = await readFile(
      new URL("../../tests/fixtures/sample.mp4", import.meta.url),
    );
    await request(app)
      .post("/api/admin/uploads/video")
      .attach("video", clip, { filename: "clip.mp4", contentType: "video/mp4" })
      .expect(401);
    await request(app)
      .post("/api/admin/uploads/video")
      .set(headers)
      .attach("video", Buffer.from("not a video"), {
        filename: "fake.mp4",
        contentType: "video/mp4",
      })
      .expect(400);
    await request(app)
      .post("/api/admin/uploads/video")
      .set(headers)
      .attach("video", clip, {
        filename: "clip.webm",
        contentType: "video/webm",
      })
      .expect(400);
    const uploaded = await request(app)
      .post("/api/admin/uploads/video")
      .set(headers)
      .attach("video", clip, { filename: "clip.mp4", contentType: "video/mp4" })
      .expect(201);
    assert.match(uploaded.body.url, /^\/uploads\/[a-f0-9-]+\.mp4$/);
    const range = await request(app)
      .get(uploaded.body.url)
      .set("Range", "bytes=0-31")
      .expect(206);
    assert.match(range.headers["content-type"], /video\/mp4/);
    assert.match(range.headers["content-range"], /^bytes 0-31\//);
    assert.equal(range.headers["cross-origin-resource-policy"], "cross-origin");
    assert.equal(
      (await readdir(uploadDir)).filter((file) => file.startsWith(".incoming-"))
        .length,
      0,
    );
    const webm = await readFile(
      new URL("../../tests/fixtures/sample.webm", import.meta.url),
    );
    const webmUpload = await request(app)
      .post("/api/admin/uploads/video")
      .set(headers)
      .attach("video", webm, {
        filename: "clip.webm",
        contentType: "video/webm",
      })
      .expect(201);
    assert.match(webmUpload.body.url, /\.webm$/);
    await request(app)
      .get(webmUpload.body.url)
      .set("Range", "bytes=0-31")
      .expect(206);
    await request(app)
      .post("/api/admin/uploads/video")
      .set(headers)
      .attach("video", Buffer.alloc(50 * 1024 * 1024 + 1), {
        filename: "oversized.mp4",
        contentType: "video/mp4",
      })
      .expect(400);
    assert.equal(
      (await readdir(uploadDir)).filter((file) => file.startsWith(".incoming-"))
        .length,
      0,
    );
    const media = [
      { type: "video", src: uploaded.body.url, alt: "Video giới thiệu" },
      {
        type: "image",
        src: "assets/images/hero/hero-01.png",
        alt: "Không gian",
      },
    ];
    const room = await request(app)
      .post("/api/admin/rooms")
      .set(headers)
      .send({
        name: "Media QA",
        subtitle: "Phụ đề phòng",
        slug: "media-qa-" + Date.now(),
        price: 1000,
        maxGuests: 2,
        media,
      })
      .expect(201);
    created.push(["room", room.body.id]);
    const published = await request(app)
      .get("/api/rooms/" + room.body.slug)
      .expect(200);
    assert.deepEqual(published.body.media, media);
    assert.equal(published.body.subtitle, "Phụ đề phòng");
    const card = await request(app)
      .post("/api/admin/content")
      .set(headers)
      .send({
        section: "experience",
        title: "Media content",
        subtitle: "Phụ đề",
        description: "Nội dung đầy đủ",
        media,
        ctaText: "Xem phòng",
        ctaTarget: "/phong/" + room.body.slug,
      })
      .expect(201);
    created.push(["contentCard", card.body.id]);
    const detail = await request(app)
      .get("/api/content/item/" + card.body.id)
      .expect(200);
    assert.deepEqual(detail.body.media, media);
    assert.ok(detail.body.updatedAt);
    await request(app)
      .patch("/api/admin/content/" + card.body.id)
      .set(headers)
      .send({ isActive: false })
      .expect(200);
    await request(app)
      .get("/api/content/item/" + card.body.id)
      .expect(404);
    await request(app).get("/api/content/item/missing-media-qa").expect(404);
  },
);
