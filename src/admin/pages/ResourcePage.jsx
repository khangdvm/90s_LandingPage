import { assetUrl } from "../../data/data.js";
import { useDraft } from "../hooks/useDraft.jsx";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { adminApi } from "../api/adminApi.js";
import {
  categories,
  sections,
  resources,
  draftFor,
  payloadFor,
  slugFrom,
  validateDraft,
} from "../forms.js";
import FormField from "../components/FormField.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import {
  Feedback,
  LoadingState,
  StatusBadge,
} from "../components/Feedback.jsx";
const labelFor = (options, key) =>
  options.find(([value]) => value === key)?.[1] || key;
const columns = {
  rooms: [
    ["price", "Giá tham khảo"],
    ["maxGuests", "Sức chứa"],
    ["viewType", "Hướng nhìn"],
  ],
  hero: [],
  news: [
    ["category", "Chuyên mục"],
    ["publishedAt", "Ngày đăng"],
  ],
  content: [["section", "Nhóm nội dung"]],
};
function displayValue(key, value) {
  if (key === "price")
    return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
  if (key === "maxGuests") return `${value} khách`;
  if (key === "viewType")
    return labelFor(
      [
        ["valley", "Thung lũng"],
        ["town", "Thị trấn"],
      ],
      value,
    );
  if (key === "category") return labelFor(categories, value);
  if (key === "section") return labelFor(sections, value);
  if (key === "publishedAt") return new Date(value).toLocaleString("vi-VN");
  return value;
}
function Editor({ config, item, defaults, busy, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => draftFor(config, item || defaults));
  const initial = useRef(draftFor(config, item || defaults));
  const protection = useDraft(
    config.api + "." + (item?.id || "new"),
    draft,
    initial.current,
    setDraft,
    item?.updatedAt || "",
  );
  const [errors, setErrors] = useState({}),
    [notice, setNotice] = useState("");
  const heading = useRef(null),
    form = useRef(null);
  const customSlug = useRef(Boolean(item));
  useEffect(() => {
    heading.current?.focus();
  }, []);
  function submit(event) {
    event.preventDefault();
    setNotice("");
    if (form.current?.querySelector('[data-upload-busy="true"]')) {
      setNotice("Chờ upload ảnh hoàn tất trước khi lưu.");
      return;
    }
    const errors = validateDraft(config.fields, draft);
    setErrors(errors);
    if (Object.keys(errors).length) {
      requestAnimationFrame(() =>
        form.current?.querySelector('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    const body = payloadFor(config, draft, item);
    if (!Object.keys(body).length) {
      setNotice("Chưa có thay đổi cần lưu.");
      return;
    }
    onSave(
      { ...body, ...(item ? { _version: item.updatedAt } : {}) },
      protection.clear,
    );
  }
  return (
    <section className="cms-panel">
      <h2 ref={heading} tabIndex={-1}>
        {item ? `Chỉnh sửa ${config.singular}` : config.create}
      </h2>
      <p className="cms-help">Các trường có dấu * là bắt buộc.</p>
      <Feedback success={notice} />
      {protection.recovery}
      {protection.dirty && (
        <p role="status">
          Có thay đổi chưa lưu. Bản nháp được lưu trên trình duyệt này.
        </p>
      )}
      <form ref={form} onSubmit={submit} noValidate>
        <div className="cms-form-grid">
          {config.fields.map((field) => (
            <FormField
              key={field.key}
              field={field}
              value={draft[field.key]}
              onCover={(url) =>
                setDraft((current) => ({ ...current, imageUrl: url }))
              }
              disabled={busy}
              error={errors[field.key]}
              onChange={(value) => {
                if (field.key === "slug") customSlug.current = true;
                setDraft((current) => ({
                  ...current,
                  [field.key]: value,
                  ...(["name", "title"].includes(field.key) &&
                  !customSlug.current &&
                  config.fields.some((f) => f.slug)
                    ? { slug: slugFrom(value) }
                    : {}),
                }));
                setErrors((current) => ({ ...current, [field.key]: "" }));
              }}
            />
          ))}
        </div>
        {config.fields.some((field) => field.slug) && (
          <button
            type="button"
            className="cms-text-button"
            disabled={busy}
            onClick={() => {
              setDraft((current) => ({
                ...current,
                slug: slugFrom(current.name || current.title || ""),
              }));
              setErrors((current) => ({ ...current, slug: "" }));
            }}
          >
            Tạo đường dẫn từ tên / tiêu đề
          </button>
        )}
        <div className="cms-form-actions">
          <button className="cms-button cms-primary" disabled={busy}>
            {busy ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
          <button
            type="button"
            className="cms-button cms-secondary"
            onClick={() => {
              if (protection.discard()) onCancel();
            }}
            disabled={busy}
          >
            Hủy chỉnh sửa
          </button>
        </div>
      </form>
    </section>
  );
}
export default function ResourcePage({ resource }) {
  const config = resources[resource];
  const [search, setSearch] = useSearchParams();
  const [rows, setRows] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [reload, setReload] = useState(0),
    [filter, setFilter] = useState("");
  const [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("");
  const [editor, setEditor] = useState(null),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(null),
    [deleteError, setDeleteError] = useState("");
  const editRequested = search.get("edit");
  useEffect(() => {
    if (!editRequested) return;
    const controller = new AbortController();
    adminApi
      .get(config.api, editRequested, controller.signal)
      .then((item) => setEditor({ item }))
      .catch((e) => {
        if (e.name !== "AbortError") setError(e);
      });
    return () => controller.abort();
  }, [editRequested, config.api]);
  const createRequested = search.get("new") === "1";
  const editing = editor !== null || createRequested;
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    adminApi
      .list(config.api, controller.signal, {
        page,
        limit: 10,
        ...(query ? { search: query } : {}),
        ...(status ? { status } : {}),
        ...(filter && config.filter ? { [config.filter.key]: filter } : {}),
      })
      .then((result) => {
        setRows(result.data);
        setTotal(result.pagination.total);
        if (page > Math.max(1, result.pagination.totalPages))
          setPage(Math.max(1, result.pagination.totalPages));
      })
      .catch((error) => {
        if (error.name !== "AbortError") setError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [config.api, reload, page, query, status, filter]);
  const visible = rows;
  const flag = resource === "news" ? "isPublished" : "isActive";
  function closeEditor() {
    setEditor(null);
    setSearch({}, { replace: true });
  }
  async function save(body, clearDraft) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      if (editor?.item) await adminApi.update(config.api, editor.item.id, body);
      else await adminApi.create(config.api, body);
      clearDraft?.();
      closeEditor();
      setSuccess("Lưu thay đổi thành công.");
      setReload((value) => value + 1);
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  async function toggle(row) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await adminApi.update(config.api, row.id, { [flag]: !row[flag] });
      setSuccess("Cập nhật trạng thái thành công.");
      setReload((value) => value + 1);
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setDeleteError("");
    try {
      await adminApi.remove(config.api, confirm.id);
      setConfirm(null);
      setSuccess("Xóa nội dung thành công.");
      setReload((value) => value + 1);
    } catch (error) {
      setDeleteError(error);
    } finally {
      setBusy(false);
    }
  }
  const defaults = {
    ...config.defaults,
    ...(filter && config.filter ? { [config.filter.key]: filter } : {}),
  };
  return (
    <>
      <div className="cms-page-heading">
        <div>
          <p className="cms-eyebrow">QUẢN LÝ NỘI DUNG</p>
          <h1>{config.title}</h1>
          <p className="cms-description">{config.description}</p>
        </div>
        {!editing && (
          <button
            className="cms-button cms-primary"
            disabled={busy}
            onClick={() => {
              setError("");
              setSuccess("");
              setSearch({ new: "1" });
              setEditor({ item: null });
            }}
          >
            {config.create}
          </button>
        )}
      </div>
      <Feedback error={error} success={success} />
      {editing ? (
        <Editor
          key={editor?.item?.id || "new"}
          config={config}
          item={editor?.item}
          defaults={defaults}
          busy={busy}
          onSave={save}
          onCancel={() => {
            closeEditor();
            setError("");
          }}
        />
      ) : (
        <>
          <div className="cms-toolbar">
            <label>
              Tìm kiếm
              <input
                aria-label="Tìm kiếm"
                value={query}
                maxLength={200}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <label>
              Trạng thái
              <select
                aria-label="Lọc trạng thái"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Tất cả</option>
                <option value="true">Đang hiển thị</option>
                <option value="false">Đang ẩn / nháp</option>
              </select>
            </label>
            {config.filter && (
              <div className="cms-field">
                <label htmlFor="cms-filter">{config.filter.label}</label>
                <select
                  id="cms-filter"
                  value={filter}
                  onChange={(event) => {
                    setFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Tất cả</option>
                  {config.filter.options.map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <p>{loading ? "Đang tải…" : `${total} ${config.singular}`}</p>
            <button
              className="cms-button cms-secondary"
              disabled={busy || loading}
              onClick={() => setReload((value) => value + 1)}
            >
              Tải lại
            </button>
          </div>
          <nav aria-label="Phân trang quản trị">
            <button
              disabled={loading || page === 1}
              onClick={() => setPage(page - 1)}
            >
              Trang trước
            </button>
            <span>
              {" "}
              Trang {page} / {Math.max(1, Math.ceil(total / 10))}{" "}
            </span>
            <button
              disabled={loading || page * 10 >= total}
              onClick={() => setPage(page + 1)}
            >
              Trang sau
            </button>
          </nav>
          {loading ? (
            <LoadingState />
          ) : visible.length ? (
            <div className="cms-panel cms-table-panel">
              <table className="cms-table">
                <caption className="cms-sr-only">
                  Danh sách {config.title.toLowerCase()}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Tên / Tiêu đề</th>
                    {columns[resource].map(([key, label]) => (
                      <th scope="col" key={key}>
                        {label}
                      </th>
                    ))}
                    <th scope="col">Trạng thái</th>
                    {resource !== "news" && <th scope="col">Thứ tự</th>}
                    <th scope="col">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={row.id}>
                      <td data-label="Tên / Tiêu đề">
                        {assetUrl(row.imageUrl) && (
                          <img
                            className="cms-thumbnail"
                            src={assetUrl(row.imageUrl)}
                            alt=""
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.hidden = true;
                            }}
                          />
                        )}
                        <strong>{row.name || row.title}</strong>
                        {row.slug && <small>{row.slug}</small>}
                      </td>
                      {columns[resource].map(([key, label]) => (
                        <td data-label={label} key={key}>
                          {displayValue(key, row[key])}
                        </td>
                      ))}
                      <td data-label="Trạng thái">
                        <button
                          type="button"
                          className="cms-status-toggle"
                          disabled={busy}
                          aria-label={`${row[flag] ? (resource === "news" ? "Gỡ đăng" : "Tắt") : resource === "news" ? "Đăng" : "Bật"} ${row.name || row.title}`}
                          onClick={() => toggle(row)}
                        >
                          <StatusBadge
                            active={row[flag]}
                            published={resource === "news"}
                          />
                        </button>
                      </td>
                      {resource !== "news" && (
                        <td data-label="Thứ tự">{row.sortOrder}</td>
                      )}
                      <td className="cms-row-actions" data-label="Thao tác">
                        <div>
                          <button
                            className="cms-button cms-small cms-secondary"
                            disabled={busy}
                            aria-label={`Sửa ${row.name || row.title}`}
                            onClick={() => {
                              setSearch({ edit: row.id });
                              setEditor({ item: row });
                              setError("");
                              setSuccess("");
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            className="cms-button cms-small cms-delete"
                            disabled={busy}
                            aria-label={`Xóa ${row.name || row.title}`}
                            onClick={() => {
                              setConfirm(row);
                              setDeleteError("");
                              setSuccess("");
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !error && (
              <div className="cms-panel cms-empty">
                <h2>Chưa có {config.singular}</h2>
                <p>
                  {filter
                    ? "Không có nội dung trong nhóm đang chọn."
                    : "Thêm nội dung đầu tiên để bắt đầu quản lý."}
                </p>
              </div>
            )
          )}
        </>
      )}
      <ConfirmDialog
        item={confirm}
        busy={busy}
        error={deleteError}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </>
  );
}
