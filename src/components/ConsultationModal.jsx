import { useEffect, useRef, useState } from "react";
import { CONTACT_INFO, displayDate, money } from "../data/data.js";

export function Modal({ open, title, onDismiss, fallbackRef, children }) {
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const origin = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    if (open && !node.open) {
      origin.current = document.activeElement;
      node.showModal();
    }
    if (!open && node.open) node.close();
  }, [open]);
  useEffect(() => {
    if (open) {
      dialog.current.scrollTop = 0;
      closeButton.current?.focus();
    }
  }, [open, title]);
  function restoreFocus() {
    if (origin.current?.isConnected) origin.current.focus();
    else fallbackRef.current?.focus();
    onDismiss();
  }
  return (
    <dialog
      ref={dialog}
      id="modal"
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onClose={restoreFocus}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onDismiss();
      }}
    >
      <div className="modal-head">
        <h2 id="modal-title">{title}</h2>
        <button
          ref={closeButton}
          id="close-modal"
          className="close"
          aria-label="Đóng cửa sổ"
          onClick={onDismiss}
        >
          ×
        </button>
      </div>
      <div id="modal-body" className="modal-body">
        {children}
      </div>
    </dialog>
  );
}
export function ContactLinks({ onPlaceholder }) {
  return [
    ["zalo", "Chat Zalo", CONTACT_INFO.zalo],
    ["facebook", "Facebook", CONTACT_INFO.facebook],
    ["hotline", "Gọi Hotline", CONTACT_INFO.hotline],
  ].map(([key, label, value]) => {
    const placeholder = value.startsWith("PLACEHOLDER_");
    return (
      <a
        key={key}
        className="button outline"
        href={key === "hotline" ? `tel:${value}` : value}
        target={key === "hotline" ? undefined : "_blank"}
        rel={key === "hotline" ? undefined : "noopener noreferrer"}
        aria-disabled={placeholder || undefined}
        onClick={(event) => {
          if (placeholder) {
            event.preventDefault();
            onPlaceholder?.();
          }
        }}
      >
        {label}
        {placeholder ? " · Chưa cập nhật" : ""}
      </a>
    );
  });
}
export default function ConsultationModal({ room, type = "room", filters }) {
  const [message, setMessage] = useState("");
  return (
    <>
      <p>
        Liên hệ với 90s Homestay để được tư vấn{" "}
        {type === "table" ? "bữa ăn và bàn phù hợp" : "phòng phù hợp"}.
      </p>
      {room && (
        <dl className="summary-list">
          <dt>Tên phòng</dt>
          <dd>{room.name}</dd>
          <dt>Giá tham khảo</dt>
          <dd>{money(room.price)} / đêm</dd>
          <dt>Số khách phù hợp</dt>
          <dd>{room.guests} khách</dd>
        </dl>
      )}
      {filters.searched && (
        <p>
          Ngày dự kiến: {displayDate(filters.checkin)} –{" "}
          {displayDate(filters.checkout)}
          {filters.guests ? ` · ${filters.guests} khách/phòng` : ""}
        </p>
      )}
      <div className="contact-buttons">
        <ContactLinks
          onPlaceholder={() =>
            setMessage(
              "Kênh liên hệ chưa được cập nhật. Đây là placeholder của bản mẫu.",
            )
          }
        />
      </div>
      <p className="form-notice">
        {[CONTACT_INFO.hotline, CONTACT_INFO.zalo, CONTACT_INFO.facebook].some(
          (value) => value.startsWith("PLACEHOLDER_"),
        )
          ? "Thông tin liên hệ đang chờ cập nhật chính thức. "
          : ""}
        Giao diện này không gửi yêu cầu tự động. Hãy chia sẻ nhu cầu với nhân
        viên qua kênh liên hệ khi được cung cấp.
      </p>
      <p id="contact-message" role="status">
        {message}
      </p>
    </>
  );
}
