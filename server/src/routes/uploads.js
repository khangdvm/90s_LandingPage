import { Router, static as serve } from "express";
import multer from "multer";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { rename, unlink } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ffprobe from "@ffprobe-installer/ffprobe";
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
  const videoParser = multer({
    storage: multer.diskStorage({
      destination(req, file, done) {
        mkdir(uploadDir, { recursive: true }).then(
          () => done(null, uploadDir),
          done,
        );
      },
      filename(req, file, done) {
        done(null, ".incoming-" + randomUUID());
      },
    }),
    limits: { fileSize: 50 * 1024 * 1024, files: 1, fields: 0 },
  }).single("video");
  router.post(
    "/uploads/video",
    (req, res, next) =>
      videoParser(req, res, (error) =>
        error
          ? res
              .status(400)
              .json({ error: "Chỉ chọn một video MP4/WebM, tối đa 50 MB." })
          : next(),
      ),
    async (req, res) => {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Vui lòng chọn video." });
      try {
        if (!["video/mp4", "video/webm"].includes(file.mimetype))
          throw Error("type");
        const { stdout } = await promisify(execFile)(
          ffprobe.path,
          [
            "-v",
            "error",
            "-protocol_whitelist",
            "file,pipe",
            "-max_alloc",
            "67108864",
            "-show_format",
            "-show_streams",
            "-of",
            "json",
            file.path,
          ],
          { timeout: 15000, maxBuffer: 1024 * 1024 },
        );
        const info = JSON.parse(stdout);
        const streams = info.streams || [];
        const isMp4 = file.mimetype === "video/mp4";
        if (
          !(
            Number(info.format?.duration) > 0 &&
            Number(info.format.duration) <= 600
          ) ||
          !(isMp4
            ? /mp4/.test(info.format?.format_name)
            : /webm/.test(info.format?.format_name)) ||
          !streams.some(
            (x) =>
              x.codec_type === "video" &&
              x.width <= 8192 &&
              x.height <= 8192 &&
              (isMp4
                ? x.codec_name === "h264"
                : ["vp8", "vp9", "av1"].includes(x.codec_name)),
          ) ||
          streams.some(
            (x) =>
              x.codec_type === "audio" &&
              !["aac", "opus", "vorbis", "mp3"].includes(x.codec_name),
          )
        )
          throw Error("format");
        const name = randomUUID() + (isMp4 ? ".mp4" : ".webm");
        await rename(file.path, path.join(uploadDir, name));
        return res.status(201).json({ url: "/uploads/" + name });
      } catch {
        return res
          .status(400)
          .json({
            error:
              "Video không hợp lệ. Dùng MP4 H.264 hoặc WebM VP8/VP9/AV1, tối đa 10 phút.",
          });
      } finally {
        await unlink(file.path).catch((error) => {
          if (error.code !== "ENOENT")
            console.error("Cannot remove temporary upload", error.code);
        });
      }
    },
  );
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
        return res.status(400).json({
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
