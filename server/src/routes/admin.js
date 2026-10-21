import { settingDefaults } from "../../../shared/content.js";
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import { found, HttpError } from "../utils/errors.js";
import { payload, siteConfig, login, pagination } from "../utils/validation.js";
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
    router.get(`/${resource}`, async (req, res) => {
      const orderBy =
        resource === "news"
          ? [{ publishedAt: "desc" }, { id: "asc" }]
          : [{ sortOrder: "asc" }, { id: "asc" }];
      if (!Object.keys(req.query).length)
        return res.json(await db[model].findMany({ orderBy }));
      const { page, limit } = pagination({
        page: req.query.page,
        limit: req.query.limit,
      });
      const where = {};
      const flag = resource === "news" ? "isPublished" : "isActive";
      if (req.query.status !== undefined) {
        if (!["true", "false"].includes(req.query.status))
          throw new HttpError(400, "Trạng thái không hợp lệ");
        where[flag] = req.query.status === "true";
      }
      if (req.query.search) {
        if (
          typeof req.query.search !== "string" ||
          req.query.search.length > 200
        )
          throw new HttpError(400, "Từ khóa quá dài");
        where[resource === "rooms" ? "name" : "title"] = {
          contains: req.query.search,
          mode: "insensitive",
        };
      }
      if (req.query.category) {
        if (
          resource !== "news" ||
          !["90s", "tam-dao"].includes(req.query.category)
        )
          throw new HttpError(400, "Chuyên mục không hợp lệ");
        where.category = req.query.category;
      }
      if (req.query.section) {
        if (
          resource !== "content" ||
          !["restaurant", "cafe", "promotion", "experience"].includes(
            req.query.section,
          )
        )
          throw new HttpError(400, "Nhóm không hợp lệ");
        where.section = req.query.section;
      }
      const [data, total] = await db.$transaction(
        [
          db[model].findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
          }),
          db[model].count({ where }),
        ],
        { isolationLevel: "RepeatableRead" },
      );
      res.json({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    });
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
    router.patch(`/${resource}/:id`, async (req, res) => {
      const { _version, ...body } = req.body || {};
      const data = payload(resource, body, true);
      if (
        _version &&
        (typeof _version !== "string" || !Number.isFinite(Date.parse(_version)))
      )
        throw new HttpError(400, "Phiên bản không hợp lệ");
      try {
        res.json(
          await db[model].update({
            where: {
              id: req.params.id,
              ...(_version ? { updatedAt: new Date(_version) } : {}),
            },
            data,
          }),
        );
      } catch (error) {
        if (_version && error.code === "P2025")
          throw new HttpError(
            409,
            "Nội dung đã thay đổi trên máy chủ. Hãy giữ bản nháp và tải lại trước khi hợp nhất.",
          );
        throw error;
      }
    });
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
    const { _snapshot, ...body } = req.body || {};
    const config = siteConfig(body);
    await db.$transaction(
      async (tx) => {
        if (_snapshot) {
          const current = Object.fromEntries(
            (await tx.siteConfig.findMany()).map((x) => [x.key, x.value]),
          );
          if (
            typeof _snapshot !== "object" ||
            Array.isArray(_snapshot) ||
            Object.entries(_snapshot).some(
              ([k, v]) => (current[k] ?? settingDefaults[k] ?? "") !== v,
            )
          )
            throw new HttpError(
              409,
              "Nội dung đã thay đổi trên máy chủ. Hãy tải lại và đối chiếu bản nháp.",
            );
        }
        for (const [key, value] of Object.entries(config))
          await tx.siteConfig.upsert({
            where: { key },
            create: { key, value },
            update: { value },
          });
      },
      { isolationLevel: "Serializable" },
    );
    res.json(
      Object.fromEntries(
        (await db.siteConfig.findMany()).map((x) => [x.key, x.value]),
      ),
    );
  });
  return router;
}
