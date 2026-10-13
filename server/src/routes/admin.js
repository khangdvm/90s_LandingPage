import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import { found, HttpError } from "../utils/errors.js";
import { payload, siteConfig, login } from "../utils/validation.js";
export function adminRoutes(db, secret) {
  const router = Router();
  const dummyHash = bcrypt.hashSync("unused-timing-comparison", 12);
  router.post(
    "/login",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 20,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Too many login attempts" },
    }),
    async (req, res) => {
      const credentials = login(req.body);
      const admin = await db.admin.findUnique({
        where: { email: credentials.email },
      });
      const valid = await bcrypt.compare(
        credentials.password,
        admin?.passwordHash || dummyHash,
      );
      if (!admin || !valid)
        throw new HttpError(401, "Invalid email or password");
      const token = jwt.sign({}, secret, {
        algorithm: "HS256",
        subject: admin.id,
        expiresIn: "2h",
        issuer: "90s-cms",
        audience: "90s-admin",
      });
      res.json({
        token,
        admin: { id: admin.id, email: admin.email, name: admin.name },
      });
    },
  );
  for (const [resource, model] of Object.entries({
    rooms: "room",
    "hero-slides": "heroSlide",
    news: "news",
    content: "contentCard",
  })) {
    router.get(`/${resource}`, async (req, res) =>
      res.json(
        await db[model].findMany({
          orderBy:
            resource === "news"
              ? [{ publishedAt: "desc" }, { id: "asc" }]
              : [{ sortOrder: "asc" }, { id: "asc" }],
        }),
      ),
    );
    router.get(`/${resource}/:id`, async (req, res) =>
      res.json(
        found(await db[model].findUnique({ where: { id: req.params.id } })),
      ),
    );
    router.post(`/${resource}`, async (req, res) =>
      res
        .status(201)
        .json(await db[model].create({ data: payload(resource, req.body) })),
    );
    router.patch(`/${resource}/:id`, async (req, res) =>
      res.json(
        await db[model].update({
          where: { id: req.params.id },
          data: payload(resource, req.body, true),
        }),
      ),
    );
    router.delete(`/${resource}/:id`, async (req, res) => {
      await db[model].delete({ where: { id: req.params.id } });
      res.status(204).end();
    });
  }
  router.get("/site-config", async (req, res) =>
    res.json(
      Object.fromEntries(
        (await db.siteConfig.findMany()).map((x) => [x.key, x.value]),
      ),
    ),
  );
  router.patch("/site-config", async (req, res) => {
    const config = siteConfig(req.body);
    await db.$transaction(
      Object.entries(config).map(([key, value]) =>
        db.siteConfig.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        }),
      ),
    );
    res.json(
      Object.fromEntries(
        (await db.siteConfig.findMany()).map((x) => [x.key, x.value]),
      ),
    );
  });
  return router;
}
