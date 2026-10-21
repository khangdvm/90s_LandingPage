import ImagePreview from "./ImagePreview.jsx";
import { useState } from "react";
import { adminApi } from "../api/adminApi.js";
import { assetUrl } from "../../data/data.js";
import RichDocument from "../../components/RichDocument.jsx";
export function ImageInput({ value, onChange, disabled }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [file, setFile] = useState(null);
  async function upload(selected) {
    if (!selected) return;
    setFile(selected);
    setBusy(true);
    setError("");
    try {
      const r = await adminApi.upload(selected);
      onChange(r.url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="cms-image-input">
      <input
        aria-label="Chọn ảnh từ máy"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled || busy}
        onChange={(e) => {
          upload(e.target.files[0]);
          e.target.value = "";
        }}
      />
      {busy && <p role="status">Đang tải ảnh… Chờ hoàn tất trước khi lưu.</p>}
      {error && (
        <p role="alert">
          {error}{" "}
          <button type="button" onClick={() => upload(file)}>
            Thử lại upload
          </button>
        </p>
      )}
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => onChange("")}
      >
        Bỏ ảnh
      </button>
      <input type="hidden" data-upload-busy={busy ? "true" : "false"} />
      <ImagePreview value={value} />
    </div>
  );
}
export function GalleryEditor({ value = [], onChange, disabled, onCover }) {
  const change = (i, next) =>
    onChange(value.map((v, j) => (i === j ? next : v)));
  return (
    <div className="cms-stack">
      {value.map((url, i) => (
        <fieldset key={i}>
          <legend>Ảnh {i + 1}</legend>
          <button
            type="button"
            disabled={disabled || !url}
            onClick={() => onCover?.(url)}
          >
            Dùng làm ảnh đại diện
          </button>
          <input
            aria-label={`URL ảnh ${i + 1}`}
            value={url}
            disabled={disabled}
            onChange={(e) => change(i, e.target.value)}
          />
          <ImageInput
            value={url}
            disabled={disabled}
            onChange={(v) => change(i, v)}
          />
          <button
            type="button"
            disabled={disabled || i === 0}
            onClick={() => {
              const a = [...value];
              [a[i - 1], a[i]] = [a[i], a[i - 1]];
              onChange(a);
            }}
          >
            Đưa lên
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            Xóa khỏi gallery
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        disabled={disabled || value.length >= 30}
        onClick={() => onChange([...value, ""])}
      >
        Thêm ảnh gallery
      </button>
      <p>
        Ảnh đại diện dùng trường ảnh chính; gallery được hiển thị theo thứ tự
        này.
      </p>
    </div>
  );
}
export function MenuEditor({ value = [], onChange, disabled }) {
  const change = (i, k, v) =>
    onChange(value.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const order = (a) => onChange(a.map((x, i) => ({ ...x, sortOrder: i })));
  return (
    <div className="cms-stack">
      {value.map((x, i) => (
        <fieldset key={i}>
          <legend>Món {i + 1}</legend>
          {[
            ["name", "Tên món"],
            ["unit", "Đơn vị tính"],
            ["description", "Mô tả món"],
            ["imageUrl", "Ảnh món"],
          ].map(([k, label]) => (
            <label key={k}>
              {label}
              <input
                disabled={disabled}
                value={x[k]}
                onChange={(e) => change(i, k, e.target.value)}
              />
            </label>
          ))}
          <label>
            Giá (để trống nếu chưa có)
            <input
              type="number"
              min="0"
              disabled={disabled}
              value={x.price ?? ""}
              onChange={(e) =>
                change(
                  i,
                  "price",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            />
          </label>
          <ImageInput
            value={x.imageUrl}
            disabled={disabled}
            onChange={(v) => change(i, "imageUrl", v)}
          />
          <label>
            <input
              type="checkbox"
              disabled={disabled}
              checked={x.isActive}
              onChange={(e) => change(i, "isActive", e.target.checked)}
            />
            Hiển thị món
          </label>
          <button
            type="button"
            disabled={disabled || i === 0}
            onClick={() => {
              const a = [...value];
              [a[i - 1], a[i]] = [a[i], a[i - 1]];
              order(a);
            }}
          >
            Đưa món lên
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => order(value.filter((_, j) => j !== i))}
          >
            Xóa món
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        disabled={disabled || value.length >= 100}
        onClick={() =>
          onChange([
            ...value,
            {
              name: "",
              price: null,
              unit: "",
              description: "",
              imageUrl: "",
              isActive: true,
              sortOrder: value.length,
            },
          ])
        }
      >
        Thêm món
      </button>
    </div>
  );
}
export function DocumentEditor({ value = [], onChange, disabled, legacy }) {
  const [preview, setPreview] = useState(false);
  const change = (i, k, v) =>
    onChange(value.map((x, j) => (i === j ? { ...x, [k]: v } : x)));
  return (
    <div className="cms-stack">
      <p>
        Định dạng theo từng khối. Văn bản cũ vẫn được giữ; thêm khối mới sẽ dùng
        nội dung mới khi hiển thị.
      </p>
      <button type="button" onClick={() => setPreview(!preview)}>
        {preview ? "Tiếp tục soạn" : "Xem trước bài viết"}
      </button>
      {preview ? (
        <RichDocument blocks={value} legacy={legacy} />
      ) : (
        value.map((b, i) => (
          <fieldset key={i}>
            <legend>Khối {i + 1}</legend>
            <label>
              Loại nội dung
              <select
                aria-label="Loại nội dung"
                disabled={disabled}
                value={b.type}
                onChange={(e) => change(i, "type", e.target.value)}
              >
                <option value="paragraph">Đoạn văn</option>
                <option value="heading">Tiêu đề</option>
                <option value="list">Danh sách (mỗi dòng một mục)</option>
                <option value="image">Ảnh</option>
              </select>
            </label>
            <label>
              Nội dung / chú thích
              <textarea
                aria-label="Nội dung / chú thích"
                disabled={disabled}
                value={b.text}
                onChange={(e) => change(i, "text", e.target.value)}
              />
            </label>
            {b.type === "image" ? (
              <>
                <input
                  aria-label="URL ảnh trong bài"
                  value={b.src || ""}
                  disabled={disabled}
                  onChange={(e) => change(i, "src", e.target.value)}
                />
                <ImageInput
                  disabled={disabled}
                  value={b.src}
                  onChange={(v) => change(i, "src", v)}
                />
              </>
            ) : (
              <>
                <label>
                  <input
                    type="checkbox"
                    checked={!!b.bold}
                    disabled={disabled}
                    onChange={(e) => change(i, "bold", e.target.checked)}
                  />
                  Đậm
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!!b.italic}
                    disabled={disabled}
                    onChange={(e) => change(i, "italic", e.target.checked)}
                  />
                  Nghiêng
                </label>
                <label>
                  Liên kết HTTP/HTTPS
                  <input
                    disabled={disabled}
                    value={b.href || ""}
                    onChange={(e) => change(i, "href", e.target.value)}
                  />
                </label>
              </>
            )}
            <button
              type="button"
              disabled={disabled || i === 0}
              onClick={() => {
                const a = [...value];
                [a[i - 1], a[i]] = [a[i], a[i - 1]];
                onChange(a);
              }}
            >
              Đưa khối lên
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(value.filter((_, j) => i !== j))}
            >
              Xóa khối
            </button>
          </fieldset>
        ))
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setPreview(false);
          onChange([...value, { type: "paragraph", text: "" }]);
        }}
      >
        Thêm khối nội dung
      </button>
    </div>
  );
}
