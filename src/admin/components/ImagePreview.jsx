import { assetUrl } from "../../data/data.js";
import { useState } from "react";
export function previewUrl(value) {
  return assetUrl(value) || null;
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
