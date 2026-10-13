export default function PublicState({ resource, label, empty = false }) {
  if (resource.loading)
    return (
      <div className="public-state public-loading" role="status">
        Đang tải {label}…
      </div>
    );
  if (resource.error)
    return (
      <div className="public-state" role="status">
        <p>{resource.error.message}</p>
        <button className="text-link" onClick={resource.retry}>
          Thử lại
        </button>
      </div>
    );
  if (empty)
    return (
      <div className="public-state">
        <p>Thông tin {label} đang được cập nhật.</p>
      </div>
    );
  return null;
}
