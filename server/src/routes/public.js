import { Router } from "express";
import { found, HttpError } from "../utils/errors.js";
import { pagination, sections } from "../utils/validation.js";
export function publicRoutes(db) {
  const router = Router();
  const orderBy = [{ sortOrder: "asc" }, { id: "asc" }];
  router.get("/health", (req, res) => res.json({ status: "ok" }));
  router.get("/rooms", async (req, res) =>
    res.json(await db.room.findMany({ where: { isActive: true }, orderBy })),
  );
  router.get("/rooms/:slug", async (req, res) =>
    res.json(
      found(
        await db.room.findFirst({
          where: { slug: req.params.slug, isActive: true },
        }),
      ),
    ),
  );
  router.get("/hero-slides", async (req, res) =>
    res.json(
      await db.heroSlide.findMany({ where: { isActive: true }, orderBy }),
    ),
  );
  router.get("/news", async (req, res) => {
    const { page, limit } = pagination(req.query);
    const where = {
      isPublished: true,
      ...(req.query.category ? { category: req.query.category } : {}),
    };
    const [data, total] = await db.$transaction(
      [
        db.news.findMany({
          where,
          orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.news.count({ where }),
      ],
      { isolationLevel: "RepeatableRead" },
    );
    res.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  });
  router.get("/news/:slug", async (req, res) =>
    res.json(
      found(
        await db.news.findFirst({
          where: { slug: req.params.slug, isPublished: true },
        }),
      ),
    ),
  );
  router.get("/content/item/:id", async (req, res) => res.json(found(
    await db.contentCard.findFirst({ where: { id: req.params.id, isActive: true } }),
  )));
  router.get("/content/:section", async (req, res) => {
    if (!sections.includes(req.params.section))
      throw new HttpError(400, "Invalid section");
    res.json(
      await db.contentCard.findMany({
        where: { section: req.params.section, isActive: true },
        orderBy,
      }),
    );
  });
  router.get("/site-config", async (req, res) => {
    const config = Object.fromEntries(
      (await db.siteConfig.findMany()).map((x) => [x.key, x.value]),
    );
    // Keep contact data available even if a separate content endpoint fails.
    const counts = await Promise.allSettled([
      db.room.count({ where: { isActive: true } }),
      db.news.count({ where: { isPublished: true } }),
      db.contentCard.groupBy({
        by: ["section"],
        where: { isActive: true },
        _count: { _all: true },
      }),
    ]);
    if (counts[0].status === "fulfilled" && counts[0].value === 0)
      config["phong-nghiEnabled"] = "false";
    if (counts[1].status === "fulfilled" && counts[1].value === 0)
      config["tin-tucEnabled"] = "false";
    if (counts[2].status === "fulfilled")
      for (const [section, id] of Object.entries({
        experience: "ve-90s",
        restaurant: "nha-hang",
        cafe: "ca-phe",
        promotion: "uu-dai",
      })) {
        if (
          !counts[2].value.some(
            (x) => x.section === section && x._count._all > 0,
          )
        )
          config[id + "Enabled"] = "false";
      }
    res.json(config);
  });
  return router;
}
