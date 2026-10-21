import { useState } from "react";
import { ImageInput } from "./ContentEditors.jsx";
import { useUploads } from "../hooks/useUploads.js";
export default function MediaEditor({ value = [], onChange, disabled }) {
  const [revision, setRevision] = useState(0);
  const uploads = useUploads();
  const locked = disabled || uploads.pending > 0;
  const change = (index, key, next) =>
    onChange(
      value.map((item, i) => (i === index ? { ...item, [key]: next } : item)),
    );
  const restructure = (items) => {
    setRevision((x) => x + 1);
    onChange(items);
  };
  return (
    <div className="cms-stack">
      <p className="cms-help">
        Mục đầu tiên làm media chính, các mục còn lại xuất hiện trong trang chi
        tiết. Dùng ảnh, video hoặc kết hợp cả hai. Video MP4 (H.264)/WebM, tối
        đa 50 MB; ảnh tối đa 8 MB. Có thể dán URL file trực tiếp. Để bộ media
        trống nếu muốn dùng ảnh chính và gallery cũ.
      </p>
      {value.map((item, i) => (
        <fieldset key={`${revision}-${i}`}>
          <legend>Media {i + 1}</legend>
          <label>
            Loại media
            <select
              aria-label={`Loại media ${i + 1}`}
              disabled={locked}
              value={item.type}
              onChange={(e) =>
                restructure(
                  value.map((x, j) =>
                    j === i ? { type: e.target.value, src: "", alt: x.alt } : x,
                  ),
                )
              }
            >
              <option value="image">Ảnh</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label>
            URL media
            <input
              aria-label={`URL media ${i + 1}`}
              value={item.src}
              disabled={locked}
              onChange={(e) => change(i, "src", e.target.value)}
            />
          </label>
          <label>
            Chú thích
            <input
              aria-label={`Chú thích media ${i + 1}`}
              maxLength={500}
              value={item.alt}
              disabled={locked}
              onChange={(e) => change(i, "alt", e.target.value)}
            />
          </label>
          <ImageInput
            value={item.src}
            onChange={(src) => change(i, "src", src)}
            disabled={locked}
            video={item.type === "video"}
          />
          {item.type === "video" && (
            <label>
              Ảnh poster (tùy chọn)
              <input
                aria-label={`Poster video ${i + 1}`}
                value={item.poster || ""}
                disabled={locked}
                onChange={(e) => change(i, "poster", e.target.value)}
              />
            </label>
          )}
          <button
            type="button"
            disabled={locked || i === 0}
            onClick={() => {
              const next = [...value];
              [next[i - 1], next[i]] = [next[i], next[i - 1]];
              restructure(next);
            }}
          >
            Đưa media lên
          </button>
          <button
            type="button"
            disabled={locked}
            onClick={() => restructure(value.filter((_, j) => j !== i))}
          >
            Xóa media
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        disabled={locked || value.length >= 30}
        onClick={() =>
          restructure([...value, { type: "image", src: "", alt: "" }])
        }
      >
        Thêm ảnh hoặc video
      </button>
    </div>
  );
}
