import { assetUrl } from "../data/data.js";
const positions = ["0% 0%", "100% 0%", "0% 100%", "100% 100%"];
export default function ContentPhoto({
  item,
  className = "",
  label,
  as: Tag = "span",
}) {
  const url = assetUrl(item.image);
  const collage = /collage\.[a-z]+(?:[?#].*)?$/i.test(url);
  return (
    <Tag
      className={`photo ${className}`}
      role="img"
      aria-label={label}
      style={{
        backgroundImage: url ? `url(${JSON.stringify(url)})` : "none",
        backgroundSize: collage ? "200% 200%" : "cover",
        backgroundPosition: collage
          ? positions[item.q] || positions[0]
          : "center",
      }}
    />
  );
}
