import { useState } from "react";
export function previewUrl(value) {
  if (!value || value.startsWith("PLACEHOLDER_")) return null;
  if (/^\/?assets\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes("..")) {
    const base =
      import.meta.env.BASE_URL === "./" ? "/" : import.meta.env.BASE_URL;
    return `${base}${value.replace(/^\//, "")}`;
  }
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
function Preview({ url }) {
  const [broken, setBroken] = useState(false);
  return broken ? (
    <p className="cms-help">
      Không thể tải ảnh xem trước. Hãy kiểm tra đường dẫn.
    </p>
  ) : (
    <img
      className="cms-image-preview"
      src={url}
      alt="Ảnh xem trước nội dung"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  );
}
export default function ImagePreview({ value }) {
  const url = previewUrl(value);
  return url ? <Preview key={url} url={url} /> : null;
}
