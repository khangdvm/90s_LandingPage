import { serveUploads, uploadRoutes } from "./routes/uploads.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { publicRoutes } from "./routes/public.js";
import { adminRoutes } from "./routes/admin.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { HttpError } from "./utils/errors.js";
import { requireAdmin } from "./middleware/auth.js";
export function createApp({
  db,
  jwtSecret,
  frontendUrl = "http://localhost:5173",
}) {
  if (typeof jwtSecret !== "string" || Buffer.byteLength(jwtSecret) < 32)
    throw new Error("JWT_SECRET must contain at least 32 bytes");
  const url = new URL(frontendUrl);
  if (!["http:", "https:"].includes(url.protocol) || url.origin !== frontendUrl)
    throw new Error(
      "FRONTEND_URL must be an HTTP(S) origin without a trailing slash",
    );
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        callback(
          origin && origin !== frontendUrl
            ? new HttpError(403, "Origin not allowed")
            : null,
          !!origin,
        );
      },
    }),
  );
  // Authentication precedes body parsing on protected routes, including unknown admin paths.
  app.use("/api/admin", (req, res, next) => {
    if (req.method === "POST" && req.path === "/login") return next();
    return requireAdmin(db, jwtSecret)(req, res, next);
  });
  app.use("/uploads", serveUploads);
  app.use("/api/admin", uploadRoutes());
  app.use(express.json({ limit: "256kb", strict: true }));
  app.use("/api/admin", adminRoutes(db, jwtSecret));
  app.use("/api", publicRoutes(db));
  app.use((req, res) => res.status(404).json({ error: "Not found" }));
  app.use(errorHandler);
  return app;
}
