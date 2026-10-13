import "dotenv/config";
import { createApp } from "./app.js";
import { prisma } from "./utils/db.js";
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("Invalid PORT");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const app = createApp({
  db: prisma,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL,
});
await prisma.$connect();
const server = app.listen(port, "0.0.0.0", () =>
  console.log(`CMS API listening on port ${port}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  });
