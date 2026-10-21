import SafeImage from "./SafeImage.jsx";
import { assetUrl, externalUrl } from "../data/data.js";
export default function RichDocument({ blocks, legacy = "" }) {
  if (!Array.isArray(blocks) || !blocks.length)
    return <div className="public-text">{legacy}</div>;
  return (
    <div className="rich-document">
      {blocks.map((b, i) => {
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
          if (externalUrl(b.href))
            text = (
              <a href={b.href} target="_blank" rel="noopener noreferrer">
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
