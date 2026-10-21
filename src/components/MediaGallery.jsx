import { useState, useEffect, useRef } from "react";
import SafeImage from "./SafeImage.jsx";
import { mediaUrl, assetUrl, displayDateTime } from "../data/data.js";
import { validMedia } from "../../shared/content.js";

export function mediaItems(item) {
  const media = validMedia(item.media) ? item.media : [];
  const legacy = [item.image || item.imageUrl, ...(item.gallery || [])]
    .filter((src, i, all) => assetUrl(src) && all.indexOf(src) === i)
    .map((src) => ({ type: "image", src, alt: item.name || item.title || "" }));
  return media.length ? media : legacy;
}

export function MediaPlayer({
  item,
  className = "",
  preview = false,
  active = true,
  ...props
}) {
  const [broken, setBroken] = useState(false);
  const videoRef = useRef(null);
  useEffect(() => {
    if (!active) videoRef.current?.pause();
  }, [active]);
  const url = mediaUrl(item?.src);
  if (!url || broken)
    return (
      <span className={`image-unavailable ${className}`}>
        Không tải được media
      </span>
    );
  if (item.type === "video")
    return (
      <video
        ref={videoRef}
        {...props}
        className={className}
        src={url}
        controls={!preview}
        muted={preview}
        playsInline
        preload="metadata"
        poster={assetUrl(item.poster) || undefined}
        aria-label={item.alt || "Video"}
        onError={() => setBroken(true)}
      >
        Trình duyệt không hỗ trợ video. <a href={url}>Mở video</a>
      </video>
    );
  return (
    <SafeImage
      {...props}
      className={className}
      src={url}
      alt={item.alt || "Ảnh nội dung"}
    />
  );
}

export default function MediaGallery({ item }) {
  const items = mediaItems(item);
  const [index, setIndex] = useState(0);
  const selected = Math.min(index, Math.max(0, items.length - 1));
  if (!items.length) return null;
  return (
    <div className="media-gallery">
      <MediaPlayer
        key={items[selected].src + items[selected].type}
        item={items[selected]}
        className="detail-media"
      />
      {items[selected].alt && (
        <p className="media-caption">{items[selected].alt}</p>
      )}
      {items.length > 1 && (
        <div
          className="media-thumbnails"
          role="group"
          aria-label="Ảnh và video"
        >
          {items.map((media, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Xem ${media.type === "video" ? "video" : "ảnh"} ${i + 1}`}
              aria-pressed={i === selected}
              onClick={() => setIndex(i)}
            >
              {media.type === "image" || assetUrl(media.poster) ? (
                <SafeImage
                  src={assetUrl(
                    media.type === "image" ? media.src : media.poster,
                  )}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <span aria-hidden="true">▶</span>
              )}
              <span>
                {media.type === "video" ? "Video" : "Ảnh"} {i + 1}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function UpdatedAt({ value }) {
  const text = displayDateTime(value);
  return text ? (
    <p className="updated-at">
      Cập nhật: <time dateTime={value}>{text}</time>
    </p>
  ) : null;
}
