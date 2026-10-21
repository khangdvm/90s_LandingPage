import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createApp } from "../src/app.js";
import {
  DEMO_ROOMS,
  DEMO_HERO_SLIDES,
  DEMO_NEWS_DATA,
  DEMO_CONTACT_INFO,
} from "../../src/data/demoFixtures.js";
import {
  snapshot,
  roomData,
  heroData,
  newsData,
  contentData,
  configData,
} from "../prisma/seed-data.js";
// Dedicated migrated and seeded PostgreSQL database required; never use production.
test(
  "PostgreSQL CMS integration",
  { skip: process.env.RUN_DB_TESTS !== "1" },
  async (t) => {
    if (!new URL(process.env.DATABASE_URL).pathname.endsWith("_test"))
      throw new Error("Dedicated _test database required");
    const { PrismaClient } = await import("@prisma/client");
    const db = new PrismaClient();
    const app = createApp({ db, jwtSecret: process.env.JWT_SECRET });
    let token;
    const created = [];
    const auth = (method, path) =>
      request(app)[method](path).set("Authorization", `Bearer ${token}`);
    t.after(async () => {
      for (const [model, id] of created)
        await db[model].deleteMany({ where: { id } });
      await db.$disconnect();
    });
    await t.test(
      "seed corresponds to original demo fixtures; password hashing",
      async () => {
        assert.deepEqual(snapshot.rooms, DEMO_ROOMS);
        assert.deepEqual(snapshot.heroSlides, DEMO_HERO_SLIDES);
        assert.deepEqual(snapshot.news, DEMO_NEWS_DATA);
        assert.deepEqual(snapshot.contact, DEMO_CONTACT_INFO);
        for (const [model, rows] of [
          ["room", roomData],
          ["heroSlide", heroData],
          ["news", newsData],
          ["contentCard", contentData],
        ]) {
          assert.equal(await db[model].count(), rows.length);
          for (const row of rows) {
            const actual = await db[model].findUnique({
              where: { id: row.id },
            });
            for (const [key, value] of Object.entries(row))
              assert.deepEqual(actual[key], value, `${model}.${key}`);
          }
        }
        assert.deepEqual(
          Object.fromEntries(
            (await db.siteConfig.findMany({ where: { key: { in: Object.keys(configData) } } })).map((x) => [x.key, x.value]),
          ),
          configData,
        );
        const admin = await db.admin.findUnique({
          where: { email: process.env.SEED_ADMIN_EMAIL },
        });
        assert.notEqual(admin.passwordHash, process.env.SEED_ADMIN_PASSWORD);
        assert.ok(
          await bcrypt.compare(
            process.env.SEED_ADMIN_PASSWORD,
            admin.passwordHash,
          ),
        );
      },
    );
    await t.test("health and admin authentication", async () => {
      await request(app).get("/api/health").expect(200, { status: "ok" });
      await request(app)
        .post("/api/admin/login")
        .send({ email: process.env.SEED_ADMIN_EMAIL, password: "incorrect" })
        .expect(401);
      await request(app)
        .post("/api/admin/login")
        .send({ email: "missing@example.test", password: "incorrect" })
        .expect(401);
      const login = await request(app)
        .post("/api/admin/login")
        .send({
          email: process.env.SEED_ADMIN_EMAIL,
          password: process.env.SEED_ADMIN_PASSWORD,
        })
        .expect(200);
      token = login.body.token;
      assert.ok(token);
      assert.ok(!JSON.stringify(login.body).includes("passwordHash"));
      for (const resource of [
        "rooms",
        "hero-slides",
        "news",
        "content",
        "site-config",
      ]) {
        await request(app).get(`/api/admin/${resource}`).expect(401);
        for (const method of ["post", "patch", "delete"])
          await request(app)
            [method](`/api/admin/${resource}/missing`)
            .expect(401);
        await auth("get", `/api/admin/${resource}`).expect(200);
      }
      const removed = jwt.sign({}, process.env.JWT_SECRET, {
        subject: "missing-admin",
        expiresIn: "1h",
        issuer: "90s-cms",
        audience: "90s-admin",
      });
      await request(app)
        .get("/api/admin/rooms")
        .set("Authorization", `Bearer ${removed}`)
        .expect(401);
      const expired = jwt.sign({}, process.env.JWT_SECRET, {
        subject: login.body.admin.id,
        expiresIn: -1,
        issuer: "90s-cms",
        audience: "90s-admin",
      });
      await request(app)
        .get("/api/admin/rooms")
        .set("Authorization", `Bearer ${expired}`)
        .expect(401);
    });
    const suffix = Date.now();
    for (const [resource, model, body, flag, path] of [
      [
        "rooms",
        "room",
        {
          name: "Test room",
          slug: `test-room-${suffix}`,
          price: 100,
          maxGuests: 2,
        },
        "isActive",
        "/api/rooms",
      ],
      [
        "hero-slides",
        "heroSlide",
        { title: "Test hero" },
        "isActive",
        "/api/hero-slides",
      ],
      [
        "news",
        "news",
        { title: "Test news", slug: `test-news-${suffix}`, category: "90s" },
        "isPublished",
        "/api/news",
      ],
      [
        "content",
        "contentCard",
        { title: "Test cafe", section: "cafe" },
        "isActive",
        "/api/content/cafe",
      ],
    ])
      await t.test(`${resource}: CRUD and publication`, async () => {
        const row = await auth("post", `/api/admin/${resource}`)
          .send({ ...body, [flag]: false })
          .expect(201);
        const id = row.body.id;
        created.push([model, id]);
        await auth("get", `/api/admin/${resource}/${id}`).expect(200);
        await auth("get", `/api/admin/${resource}/missing`).expect(404);
        await auth("post", `/api/admin/${resource}`).send({}).expect(400);
        await auth("patch", `/api/admin/${resource}/${id}`)
          .send({ unknown: true })
          .expect(400);
        const hidden = await request(app).get(`${path}?limit=50`).expect(200);
        assert.ok(!(hidden.body.data || hidden.body).some((x) => x.id === id));
        if (body.slug) {
          await request(app).get(`${path}/${body.slug}`).expect(404);
          await auth("post", `/api/admin/${resource}`).send(body).expect(409);
        }
        await auth("patch", `/api/admin/${resource}/${id}`)
          .send({ [flag]: true })
          .expect(200);
        const visible = await request(app).get(`${path}?limit=50`).expect(200);
        assert.ok((visible.body.data || visible.body).some((x) => x.id === id));
        if (body.slug)
          await request(app).get(`${path}/${body.slug}`).expect(200);
        await auth("delete", `/api/admin/${resource}/${id}`).expect(204);
        await auth("get", `/api/admin/${resource}/${id}`).expect(404);
        await auth("delete", `/api/admin/${resource}/${id}`).expect(404);
      });
    await t.test("public ordering and news category pagination", async () => {
      const rooms = await request(app).get("/api/rooms").expect(200);
      assert.deepEqual(
        rooms.body.map((x) => x.id),
        roomData.map((x) => x.id),
      );
      const slides = await request(app).get("/api/hero-slides").expect(200);
      assert.deepEqual(
        slides.body.map((x) => x.id),
        heroData.map((x) => x.id),
      );
      for (const category of ["90s", "tam-dao"]) {
        const first = await request(app)
          .get(`/api/news?category=${category}&page=1&limit=6`)
          .expect(200);
        assert.deepEqual(first.body.pagination, {
          page: 1,
          limit: 6,
          total: 8,
          totalPages: 2,
        });
        assert.equal(first.body.data.length, 6);
        assert.ok(first.body.data.every((x) => x.category === category));
        const second = await request(app)
          .get(`/api/news?category=${category}&page=2&limit=6`)
          .expect(200);
        assert.equal(second.body.data.length, 2);
        assert.ok(
          second.body.data.every(
            (x) => !first.body.data.some((y) => y.id === x.id),
          ),
        );
      }
      const empty = await request(app).get("/api/news?page=100").expect(200);
      assert.deepEqual(empty.body.data, []);
      for (const q of [
        "page=0",
        "limit=51",
        "category=bad",
        "page=1.2",
        "page=1&page=2",
      ])
        await request(app).get(`/api/news?${q}`).expect(400);
      await request(app).get("/api/rooms/missing").expect(404);
      await request(app).get("/api/news/missing").expect(404);
      await request(app).get("/api/content/bad").expect(400);
    });
    await t.test("site config update and atomic validation", async () => {
      try {
        await auth("patch", "/api/admin/site-config")
          .send({ siteTitle: "Integration title" })
          .expect(200);
        const config = await request(app).get("/api/site-config").expect(200);
        assert.equal(config.body.siteTitle, "Integration title");
        await auth("patch", "/api/admin/site-config")
          .send({ siteTitle: "Must not persist", unknown: "bad" })
          .expect(400);
        const unchanged = await request(app)
          .get("/api/site-config")
          .expect(200);
        assert.equal(unchanged.body.siteTitle, "Integration title");
      } finally {
        await db.siteConfig.update({
          where: { key: "siteTitle" },
          data: { value: configData.siteTitle },
        });
      }
    });
  },
);
