import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
import { payload, pagination, siteConfig } from "../src/utils/validation.js";
test("payload and pagination validation", () => {
  for (const body of [
    null,
    [],
    {},
    { name: "x" },
    { name: "x", slug: "x", price: -1, maxGuests: 2 },
    { name: "x", slug: "x", price: 0, maxGuests: 0 },
  ])
    assert.throws(() => payload("rooms", body));
  assert.throws(() =>
    payload("hero-slides", { title: "x", ctaTarget: "javascript:alert(1)" }),
  );
  assert.throws(() =>
    payload("news", { title: "x", slug: "x", category: "other" }),
  );
  assert.throws(() =>
    payload("news", {
      title: "x",
      slug: "x",
      category: "90s",
      publishedAt: "2026-02-31",
    }),
  );
  assert.throws(() => payload("content", { title: "x", section: "layout" }));
  assert.throws(() => siteConfig({ unknown: "x" }));
  assert.throws(() => siteConfig({ zaloUrl: "javascript:alert(1)" }));
  for (const q of [
    { page: "0" },
    { limit: "51" },
    { page: "1.2" },
    { page: ["1", "2"] },
    { category: "bad" },
  ])
    assert.throws(() => pagination(q));
  assert.deepEqual(pagination({}), { page: 1, limit: 6 });
});
test("health, auth, CORS, malformed JSON and safe errors", async () => {
  const app = createApp({
    db: {},
    jwtSecret: "unit-secret-that-is-at-least-32-bytes",
  });
  await request(app).get("/api/health").expect(200, { status: "ok" });
  await request(app).get("/api/admin/rooms").expect(401);
  await request(app).get("/api/admin/unknown").expect(401);
  await request(app)
    .get("/api/admin/rooms")
    .set("Authorization", "Bearer garbage")
    .expect(401);
  await request(app)
    .get("/api/health")
    .set("Origin", "https://untrusted.example")
    .expect(403);
  const cors = await request(app)
    .get("/api/health")
    .set("Origin", "http://localhost:5173")
    .expect(200);
  assert.equal(
    cors.headers["access-control-allow-origin"],
    "http://localhost:5173",
  );
  assert.ok(cors.headers["x-content-type-options"]);
  await request(app)
    .post("/api/admin/login")
    .set("Content-Type", "application/json")
    .send("{")
    .expect(400);
  const failure = await request(app).get("/api/rooms").expect(500);
  assert.deepEqual(failure.body, { error: "Internal server error" });
});
