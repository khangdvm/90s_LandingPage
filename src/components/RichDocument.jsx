import { useSiteConfig } from "../data/SiteConfigContext.jsx";
import { MediaPlayer } from "./MediaGallery.jsx";
import SafeImage from "./SafeImage.jsx";
import { assetUrl, externalUrl, contentTarget } from "../data/data.js";
export default function RichDocument({ blocks, legacy = "" }) {
  const config = useSiteConfig().data || {};
  const hrefFor = (value) => {
    const url = contentTarget(value);
    if (!url.startsWith("#")) return url;
    return config[url.slice(1) + "Enabled"] === "false"
      ? ""
      : import.meta.env.BASE_URL + url;
  };
  if (!Array.isArray(blocks) || !blocks.length)
    return <div className="public-text">{legacy}</div>;
  return (
    <div className="rich-document">
      {blocks.map((b, i) => {
        if (b.type === "video")
          return (
            <figure key={i}>
              <MediaPlayer
                key={b.src}
                item={{ type: "video", src: b.src, alt: b.text }}
                className="detail-media"
              />
              <figcaption>{b.text}</figcaption>
            </figure>
          );
        if (b.type === "image")
          return assetUrl(b.src) ? (
            <figure key={i}>
              <SafeImage
                src={assetUrl(b.src)}
                alt={b.text}
                onError={(e) => {
                  e.currentTarget.hidden = true;
                }}
              />
              <figcaption>{b.text}</figcaption>
            </figure>
          ) : null;
        const format = (value) => {
          let text = value;
          if (b.bold) text = <strong>{text}</strong>;
          if (b.italic) text = <em>{text}</em>;
          if (hrefFor(b.href))
            text = (
              <a
                href={hrefFor(b.href)}
                target={externalUrl(b.href) ? "_blank" : undefined}
                rel={externalUrl(b.href) ? "noopener noreferrer" : undefined}
              >
                {text}
              </a>
            );
          return text;
        };
        const text = format(b.text);
        if (b.type === "heading") return <h2 key={i}>{text}</h2>;
        if (b.type === "list")
          return (
            <ul key={i}>
              {b.text.split("\n").map((line, j) => (
                <li key={j}>{format(line)}</li>
              ))}
            </ul>
          );
        return <p key={i}>{text}</p>;
      })}
    </div>
  );
}
