export function Feedback({ error, success }) {
  return (
    <div className="cms-feedback">
      {error && (
        <p className="cms-notice cms-error" role="alert">
          {error.message || error}
        </p>
      )}
      {success && (
        <p className="cms-notice cms-success" role="status">
          {success}
        </p>
      )}
    </div>
  );
}
export function LoadingState() {
  return (
    <p className="cms-notice" role="status">
      Đang tải dữ liệu…
    </p>
  );
}
export function StatusBadge({ active, published = false }) {
  return (
    <span className={`cms-badge ${active ? "cms-badge-on" : ""}`}>
      {active
        ? published
          ? "Đã đăng"
          : "Đang bật"
        : published
          ? "Bản nháp"
          : "Đã tắt"}
    </span>
  );
}
