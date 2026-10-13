import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import {
  roomData,
  heroData,
  newsData,
  contentData,
  configData,
} from "./seed-data.js";
const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD;
if (
  !email ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
  !password ||
  password.length < 12 ||
  Buffer.byteLength(password) > 72
)
  throw new Error(
    "Provide SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (12 characters minimum; 72 bytes maximum)",
  );
const db = new PrismaClient();
try {
  const passwordHash = await bcrypt.hash(password, 12);
  await db.$transaction(
    async (tx) => {
      // Repeated seeds preserve staff edits and existing administrator passwords.
      await tx.admin.upsert({
        where: { email },
        create: { email, passwordHash, name: "90s Admin" },
        update: {},
      });
      for (const [model, rows] of [
        ["room", roomData],
        ["heroSlide", heroData],
        ["news", newsData],
        ["contentCard", contentData],
      ]) {
        for (const row of rows)
          await tx[model].upsert({
            where: { id: row.id },
            create: row,
            update: {},
          });
      }
      for (const [key, value] of Object.entries(configData))
        await tx.siteConfig.upsert({
          where: { key },
          create: { key, value },
          update: {},
        });
    },
    { timeout: 30000 },
  );
  console.log(
    "Seed complete: 1 admin requirement, 4 rooms, 3 slides, 16 sample news, 10 content cards, 7 settings (existing records preserved).",
  );
} finally {
  await db.$disconnect();
}
