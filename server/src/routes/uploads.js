import { Router, static as serve } from "express";
import multer from "multer";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
export const uploadDir = path.resolve(
  process.env.UPLOAD_DIR || "./storage/uploads",
);
export const serveUploads = serve(uploadDir, {
  dotfiles: "deny",
  fallthrough: false,
  setHeaders(res) {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  },
});
export function uploadRoutes() {
  const router = Router();
  const parse = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024, files: 1, fields: 0 },
  }).single("image");
  router.post(
    "/uploads",
    (req, res, next) =>
      parse(req, res, (error) =>
        error
          ? res.status(400).json({ error: "Chỉ chọn một ảnh, tối đa 8 MB." })
          : next(),
      ),
    async (req, res) => {
      if (
        !req.file ||
        !["image/jpeg", "image/png", "image/webp"].includes(req.file.mimetype)
      )
        return res
          .status(400)
          .json({ error: "Chỉ nhận ảnh JPEG, PNG hoặc WebP." });
      let output;
      try {
        const img = sharp(req.file.buffer, {
          limitInputPixels: 40000000,
          animated: false,
        });
        const info = await img.metadata();
        if (!["jpeg", "png", "webp"].includes(info.format)) throw Error();
        output = await img
          .rotate()
          .resize({
            width: 2400,
            height: 2400,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 85 })
          .toBuffer();
      } catch {
        return res
          .status(400)
          .json({
            error: "Nội dung file không phải ảnh hợp lệ hoặc ảnh quá lớn.",
          });
      }
      await mkdir(uploadDir, { recursive: true });
      const name = randomUUID() + ".webp";
      await (
        await import("node:fs/promises")
      ).writeFile(path.join(uploadDir, name), output, { flag: "wx" });
      res.status(201).json({ url: "/uploads/" + name });
    },
  );
  return router;
}
