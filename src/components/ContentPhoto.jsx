import { useEffect, useState } from "react";
import { assetUrl } from "../data/data.js";
const positions = ["0% 0%", "100% 0%", "0% 100%", "100% 100%"];
export default function ContentPhoto({
  item,
  className = "",
  label,
  as: Tag = "span",
}) {
  const url = assetUrl(item.image);
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    setBroken(false);
    if (!url) return;
    const img = new Image();
    img.onerror = () => setBroken(true);
    img.src = url;
    return () => {
      img.onerror = null;
    };
  }, [url]);
  const collage = /collage\.[a-z]+(?:[?#].*)?$/i.test(url);
  return (
    <Tag
      className={`photo ${className}`}
      role="img"
      aria-label={label}
      style={{
        backgroundImage:
          url && !broken ? `url(${JSON.stringify(url)})` : "none",
        backgroundSize: collage ? "200% 200%" : "cover",
        backgroundPosition: collage
          ? positions[item.q] || positions[0]
          : "center",
      }}
    >
      {(!url || broken) && (
        <span className="image-unavailable">Chưa có ảnh</span>
      )}
    </Tag>
  );
}
