import { useEffect, useRef } from "react";
import { Feedback } from "./Feedback.jsx";
export default function ConfirmDialog({
  item,
  busy,
  error,
  onCancel,
  onConfirm,
}) {
  const dialog = useRef(null);
  const cancel = useRef(null);
  useEffect(() => {
    if (!item) return;
    const origin = document.activeElement;
    const node = dialog.current;
    node.showModal();
    cancel.current?.focus();
    return () => {
      node.close();
      if (origin?.isConnected) origin.focus();
    };
  }, [item]);
  return (
    <dialog
      className="cms-confirm"
      ref={dialog}
      aria-labelledby="cms-confirm-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <h2 id="cms-confirm-title">Xác nhận xóa</h2>
      <p>
        Bạn có chắc muốn xóa “{item?.name || item?.title}”? Nội dung đã xóa
        không thể khôi phục từ giao diện này.
      </p>
      <Feedback error={error} />
      <div className="cms-actions">
        <button
          className="cms-button cms-secondary"
          ref={cancel}
          disabled={busy}
          onClick={onCancel}
        >
          Hủy
        </button>
        <button
          className="cms-button cms-danger"
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? "Đang xóa…" : "Xác nhận xóa"}
        </button>
      </div>
    </dialog>
  );
}
