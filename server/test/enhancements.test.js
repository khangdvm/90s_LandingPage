import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import sharp from "sharp";
import { createApp } from "../src/app.js";
import { payload, siteConfig } from "../src/utils/validation.js";
import { image, contact, target, validDoc } from "../../shared/content.js";
// imports from shared package use repository root, not server root

test("purpose-specific links reject confirmed regressions and dangerous inputs", () => {
  assert.throws(() => siteConfig({ zaloUrl: "#lien-he" }));
  assert.throws(() => payload("rooms", { imageUrl: "#phong-nghi" }, true));
  assert.throws(() =>
    payload("hero-slides", { ctaTarget: "assets/images/misc/logo.png" }, true),
  );
  for (const bad of [
    "javascript:alert(1)",
    "data:image/svg+xml,test",
    "/assets/../secret",
    "assets/%2e%2e/a.png",
    "//evil.test/a.png",
    "https://user:pass@example.com/a",
  ]) {
    assert.equal(image(bad), false, bad);
    assert.equal(target(bad), false, bad);
  }
  assert.ok(image("assets/images/rooms/rooms-collage.png"));
  assert.ok(target("/phong/phong-doi"));
  assert.ok(target("#phong-nghi"));
  assert.ok(contact("https://zalo.me/0123456789"));
  assert.equal(
    validDoc([
      { type: "paragraph", text: "safe", href: "javascript:alert(1)" },
    ]),
    false,
  );
});
test(
  "real PostgreSQL upgrade, uploads, structured content, pagination and conflicts",
  { skip: process.env.RUN_DB_TESTS !== "1" },
  async (t) => {
    if (!new URL(process.env.DATABASE_URL).pathname.endsWith("_test"))
      throw Error("Dedicated _test database required");
    const { PrismaClient } = await import("@prisma/client");
    const db = new PrismaClient();
    const app = createApp({ db, jwtSecret: process.env.JWT_SECRET });
    const created = [];
    t.after(async () => {
      for (const [model, id] of created)
        await db[model].deleteMany({ where: { id } });
      await db.$disconnect();
    });
    const login = await request(app)
      .post("/api/admin/login")
      .send({
        email: process.env.SEED_ADMIN_EMAIL,
        password: process.env.SEED_ADMIN_PASSWORD,
      })
      .expect(200);
    const token = login.body.token;
    const auth = (method, path) =>
      request(app)
        [method]("/api/admin" + path)
        .set("Authorization", "Bearer " + token);
    await t.test(
      "legacy names, galleries and plaintext preserved",
      async () => {
        const cards = await db.contentCard.findMany();
        for (const card of cards.filter((c) => c.section === "restaurant"))
          assert.deepEqual(
            card.menuItems.map((x) => x.name),
            card.dishes,
          );
        assert.equal(await db.room.count(), 4);
        assert.ok(
          (await db.news.findMany()).every(
            (x) => typeof x.content === "string" && Array.isArray(x.contentDoc),
          ),
        );
      },
    );
    await t.test(
      "authenticated decoded uploads and cross-origin serving",
      async () => {
        await request(app)
          .post("/api/admin/uploads")
          .attach("image", Buffer.from("x"), "x.png")
          .expect(401);
        await auth("post", "/uploads")
          .attach("image", Buffer.from("<script>alert(1)</script>"), {
            filename: "x.png",
            contentType: "image/png",
          })
          .expect(400);
        await auth("post", "/uploads")
          .attach("image", Buffer.from("<svg/>"), {
            filename: "x.svg",
            contentType: "image/svg+xml",
          })
          .expect(400);
        await auth("post", "/uploads")
          .attach("image", Buffer.alloc(8 * 1024 * 1024 + 1), {
            filename: "big.png",
            contentType: "image/png",
          })
          .expect(400);
        const png = await sharp({
          create: { width: 20, height: 10, channels: 3, background: "#c00" },
        })
          .png()
          .toBuffer();
        const upload = await auth("post", "/uploads")
          .attach("image", png, {
            filename: "../../evil.png",
            contentType: "image/png",
          })
          .expect(201);
        assert.match(upload.body.url, /^\/uploads\/[a-f0-9-]+\.webp$/);
        const served = await request(app)
          .get(upload.body.url)
          .set("Origin", "http://localhost:5173")
          .expect(200);
        assert.equal(
          served.headers["cross-origin-resource-policy"],
          "cross-origin",
        );
        assert.match(served.headers["content-type"], /image\/webp/);
      },
    );
    await t.test("room gallery and optimistic version conflict", async () => {
      const made = await auth("post", "/rooms")
        .send({
          name: "QA Gallery",
          slug: "qa-gallery",
          price: 0,
          maxGuests: 2,
          gallery: ["assets/images/hero/hero-01.png"],
        })
        .expect(201);
      created.push(["room", made.body.id]);
      const changed = await auth("patch", "/rooms/" + made.body.id)
        .send({ description: "server changed", _version: made.body.updatedAt })
        .expect(200);
      await auth("patch", "/rooms/" + made.body.id)
        .send({ description: "stale overwrite", _version: made.body.updatedAt })
        .expect(409);
      const pub = await request(app).get("/api/rooms/qa-gallery").expect(200);
      assert.equal(pub.body.description, changed.body.description);
      assert.equal(pub.body.gallery.length, 1);
      await auth("patch", "/rooms/" + made.body.id)
        .send({ isActive: false })
        .expect(200);
      await request(app).get("/api/rooms/qa-gallery").expect(404);
    });
    await t.test(
      "menu null and zero prices, rich content and draft secrecy",
      async () => {
        const menuItems = [
          {
            name: "Giá chưa xác nhận",
            price: null,
            unit: "phần",
            description: "",
            imageUrl: "",
            isActive: true,
            sortOrder: 1,
          },
          {
            name: "Giá 0",
            price: 0,
            unit: "",
            description: "",
            imageUrl: "",
            isActive: false,
            sortOrder: 0,
          },
        ];
        const card = await auth("post", "/content")
          .send({ section: "restaurant", title: "QA Menu", menuItems })
          .expect(201);
        created.push(["contentCard", card.body.id]);
        assert.deepEqual(card.body.menuItems, menuItems);
        const contentDoc = [
          { type: "heading", text: "QA heading" },
          {
            type: "paragraph",
            text: "<script>window.hacked=true</script>",
            bold: true,
          },
          { type: "list", text: "Một\nHai" },
        ];
        const news = await auth("post", "/news")
          .send({
            title: "QA Rich",
            slug: "qa-rich",
            category: "90s",
            contentDoc,
          })
          .expect(201);
        created.push(["news", news.body.id]);
        await request(app).get("/api/news/qa-rich").expect(404);
        await auth("patch", "/news/" + news.body.id)
          .send({ isPublished: true })
          .expect(200);
        const pub = await request(app).get("/api/news/qa-rich").expect(200);
        assert.deepEqual(pub.body.contentDoc, contentDoc);
      },
    );
    await t.test("stable server pagination, search and filters", async () => {
      for (let i = 0; i < 12; i++) {
        const r = await auth("post", "/hero-slides")
          .send({ title: "QA Paging " + i, isActive: i % 2 === 0 })
          .expect(201);
        created.push(["heroSlide", r.body.id]);
      }
      const first = await auth(
        "get",
        "/hero-slides?page=1&limit=5&search=QA%20Paging",
      ).expect(200);
      const second = await auth(
        "get",
        "/hero-slides?page=2&limit=5&search=QA%20Paging",
      ).expect(200);
      assert.equal(first.body.pagination.total, 12);
      assert.equal(first.body.data.length, 5);
      assert.equal(second.body.data.length, 5);
      assert.equal(
        new Set([...first.body.data, ...second.body.data].map((x) => x.id))
          .size,
        10,
      );
      const filtered = await auth(
        "get",
        "/hero-slides?page=1&limit=5&search=QA%20Paging&status=false",
      ).expect(200);
      assert.equal(filtered.body.pagination.total, 6);
      assert.ok(filtered.body.data.every((x) => !x.isActive));
    });
  },
);
