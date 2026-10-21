export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.code === "P2034")
    return res.status(409).json({
      error:
        "Nội dung đã thay đổi trên máy chủ. Hãy tải lại và đối chiếu bản nháp.",
    });
  if (error.code === "P2002")
    return res.status(409).json({ error: "Unique value already exists" });
  if (error.code === "P2025")
    return res.status(404).json({ error: "Not found" });
  if (error.type === "entity.parse.failed")
    return res.status(400).json({ error: "Malformed JSON" });
  if (error.type === "entity.too.large")
    return res.status(413).json({ error: "Payload too large" });
  const status = error.status || 500;
  res
    .status(status)
    .json({
      error:
        status >= 500
          ? "Internal server error"
          : status === 404
            ? "Not found"
            : error.message,
    });
}
