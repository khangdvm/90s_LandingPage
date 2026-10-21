import MediaGallery, { UpdatedAt } from "./MediaGallery.jsx";
import { SectionHeading } from "./ManagedContent.jsx";
import { BusinessNotice } from "./ManagedContent.jsx";
import { assetUrl } from "../data/data.js";
import { useState } from "react";
import { viewNames, money, today, nextDay, displayDate } from "../data/data.js";

import ContentPhoto from "./ContentPhoto.jsx";
import PublicState from "./PublicState.jsx";

function Metadata({ room }) {
  return (
    <div className="room-meta">
      <span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 18v-9m18 9V9M3 14h18M3 10h18v7H3M6 10V6h12v4" />
        </svg>
        Số phòng: {String(room.count).padStart(2, "0")} phòng
      </span>
      <span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {viewNames[room.view]}
      </span>
      <span>
        {room.guests} khách · {room.beds}
      </span>
    </div>
  );
}
function Price({ room }) {
  return (
    <div className="price">
      Từ <strong>{money(room.price)}</strong> / đêm
    </div>
  );
}
function Photo({ room, className = "" }) {
  return (
    <ContentPhoto
      item={room}
      className={`room-photo ${className}`}
      label={`Ảnh ${room.name}`}
    />
  );
}
function RoomCard({ room, main = false, onRoom }) {
  return (
    <article className={main ? "room-main" : "room-side-card"}>
      <button
        className="room-photo-button"
        data-room={room.id}
        aria-label={`Xem ${room.name}`}
        onClick={() => onRoom(room)}
      >
        <Photo room={room} />
        {main && <span className="photo-view">{viewNames[room.view]}</span>}
      </button>
      <div className="room-info">
        <h3>{room.name}</h3>
        <Metadata room={room} />
        <div className="room-bottom">
          <Price room={room} />
          <button
            className="text-link"
            data-room={room.id}
            onClick={() => onRoom(room)}
          >
            Xem phòng
          </button>
        </div>
      </div>
    </article>
  );
}
export default function Rooms({
  resource,
  filters,
  onView,
  onRoom,
  onAllRooms,
  onStay,
  onConsult,
}) {
  const rooms = resource.data || [];
  const list = rooms.filter(
    (room) =>
      (filters.view === "all" || filters.view === room.view) &&
      room.guests >= filters.guests,
  );
  return (
    <section id="phong-nghi" className="section container">
      <div className="section-head">
        <SectionHeading
          id="phong-nghi"
          title="Một căn phòng cho mỗi chuyến đi."
          subtitle="PHÒNG NGHỈ"
          description=""
        />
        <button className="text-link" id="all-rooms" onClick={onAllRooms}>
          Xem tất cả phòng
        </button>
      </div>
      <div className="room-toolbar">
        <div className="filters" role="group" aria-label="Lọc theo view">
          {Object.entries({ all: "Tất cả view", ...viewNames }).map(
            ([view, label]) => (
              <button
                key={view}
                className={`filter ${filters.view === view ? "active" : ""}`}
                data-view={view}
                aria-pressed={filters.view === view}
                onClick={() => onView(view)}
              >
                {label}
              </button>
            ),
          )}
        </div>
        <button className="date-control" id="open-stay" onClick={onStay}>
          {filters.searched
            ? `${displayDate(filters.checkin)} – ${displayDate(filters.checkout)}`
            : "Ngày dự kiến"}{" "}
          <span className="calendar-icon" aria-hidden="true" />
        </button>
      </div>
      <p
        id="room-result"
        className="result"
        aria-live="polite"
        hidden={filters.view === "all" && !filters.searched}
      >
        {list.length} hạng phòng
        {filters.guests ? ` cho ${filters.guests} khách` : ""}
        {filters.searched
          ? ` · ${displayDate(filters.checkin)} – ${displayDate(filters.checkout)}`
          : ""}
        . Ngày chỉ dùng làm ngữ cảnh tư vấn.
      </p>
      <div
        id="room-layout"
        className={`room-layout ${list.length === 1 ? "single" : ""}`}
      >
        {resource.loading || resource.error ? (
          <PublicState resource={resource} label="phòng nghỉ" />
        ) : list.length ? (
          <>
            <RoomCard room={list[0]} main onRoom={onRoom} />
            {list.length > 1 && (
              <div className="room-side">
                {list.slice(1, 4).map((room) => (
                  <RoomCard key={room.id} room={room} onRoom={onRoom} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            Chưa có hạng phòng phù hợp. Nhóm đông có thể cần nhiều phòng.
            <br />
            <button className="text-link" onClick={() => onConsult()}>
              Trao đổi nhu cầu lưu trú
            </button>
          </div>
        )}
      </div>
      <BusinessNotice />
    </section>
  );
}
export function RoomDetails({ room, onConsult, onAllRooms }) {
  const hasMedia = Array.isArray(room.media) && room.media.length > 0;
  const images = [room.image, ...(room.gallery || [])].filter(
    (v, i, a) => v && a.indexOf(v) === i,
  );
  const [selected, setSelected] = useState(0);
  return (
    <>
      {hasMedia ? (
        <MediaGallery item={room} />
      ) : (
        <>
          <Photo
            room={{
              ...room,
              image: images[selected] || room.image,
              q: selected === 0 ? room.q : 0,
            }}
            className="modal-room-photo"
          />
          <div className="room-gallery" role="group" aria-label="Gallery phòng">
            {images.map((image, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                aria-label={`Xem ảnh phòng ${i + 1}`}
                aria-pressed={i === selected}
              >
                <img
                  src={assetUrl(image)}
                  alt={`Ảnh ${i + 1}`}
                  onError={(e) => {
                    e.currentTarget.alt = "Ảnh không tải được";
                  }}
                />
              </button>
            ))}
          </div>
        </>
      )}
      {room.subtitle && <p className="detail-subtitle">{room.subtitle}</p>}
      <UpdatedAt value={room.updatedAt} />
      <div className="detail-stats">
        <div>
          <strong>{String(room.count).padStart(2, "0")} phòng</strong>
          <span>Tổng số phòng của hạng</span>
        </div>
        <div>
          <strong>{viewNames[room.view]}</strong>
          <span>Hướng nhìn</span>
        </div>
        <div>
          <strong>{room.guests} khách</strong>
          <span>{room.beds}</span>
        </div>
      </div>
      <p>{room.description}</p>
      <Price room={room} />
      <BusinessNotice />
      <div className="modal-buttons">
        <button
          className="button"
          data-consult="room"
          onClick={() => onConsult(room)}
        >
          Nhận tư vấn
        </button>
        <button className="button outline" onClick={onAllRooms}>
          Xem hạng phòng khác
        </button>
      </div>
    </>
  );
}
export function AllRooms({ rooms, onRoom }) {
  return (
    <>
      <p>
        Thông tin phòng và giá tham khảo để anh/chị trao đổi nhu cầu lưu trú.
      </p>
      {rooms.map((room) => (
        <article key={room.id} className="all-room-card">
          <button
            data-room={room.id}
            aria-label={`Xem ${room.name}`}
            onClick={() => onRoom(room)}
          >
            <Photo room={room} />
          </button>
          <div>
            <h3>{room.name}</h3>
            <Metadata room={room} />
            <div className="room-bottom">
              <Price room={room} />
              <button className="text-link" onClick={() => onRoom(room)}>
                Xem chi tiết
              </button>
            </div>
          </div>
        </article>
      ))}
      <p className="demo-note">
        Số phòng là tổng số của từng hạng, không phải phòng trống.
      </p>
    </>
  );
}
export function ExpectedStay({ filters, onApply, onClear }) {
  const [draft, setDraft] = useState(() => {
    const checkin = filters.checkin < today() ? today() : filters.checkin;
    return {
      ...filters,
      checkin,
      checkout:
        filters.checkout > checkin ? filters.checkout : nextDay(checkin),
    };
  });
  const [error, setError] = useState("");
  function submit(event) {
    event.preventDefault();
    if (
      !draft.checkin ||
      !draft.checkout ||
      draft.checkin < today() ||
      draft.checkout <= draft.checkin
    ) {
      setError("Ngày về dự kiến phải sau ngày đến dự kiến.");
      return;
    }
    onApply({ ...draft, searched: true });
  }
  return (
    <>
      <p>
        Lọc theo số khách và view yêu thích. Ngày dự kiến không dùng để kiểm tra
        khả năng phục vụ.
      </p>
      <form id="stay-form" onSubmit={submit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="f-in">Ngày đến dự kiến</label>
            <input
              id="f-in"
              type="date"
              min={today()}
              value={draft.checkin}
              required
              onChange={(event) => {
                const checkin = event.target.value;
                setDraft((value) => ({
                  ...value,
                  checkin,
                  checkout:
                    checkin && value.checkout <= checkin
                      ? nextDay(checkin)
                      : value.checkout,
                }));
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="f-out">Ngày về dự kiến</label>
            <input
              id="f-out"
              type="date"
              min={draft.checkin ? nextDay(draft.checkin) : today()}
              value={draft.checkout}
              required
              onChange={(event) =>
                setDraft((value) => ({
                  ...value,
                  checkout: event.target.value,
                }))
              }
            />
          </div>
          <div className="field">
            <label htmlFor="f-guests">Số khách mỗi phòng</label>
            <select
              id="f-guests"
              value={draft.guests}
              onChange={(event) =>
                setDraft((value) => ({
                  ...value,
                  guests: Number(event.target.value),
                }))
              }
            >
              {[0, 2, 4, 6, 8].map((number) => (
                <option key={number} value={number}>
                  {number ? `${number} khách` : "Chưa chọn"}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-view">View yêu thích</label>
            <select
              id="f-view"
              value={draft.view}
              onChange={(event) =>
                setDraft((value) => ({ ...value, view: event.target.value }))
              }
            >
              {Object.entries({ all: "Tất cả view", ...viewNames }).map(
                ([view, label]) => (
                  <option key={view} value={view}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-buttons">
          <button type="submit" className="button">
            Xem phòng phù hợp
          </button>
          <button
            type="button"
            className="button outline"
            id="clear-stay"
            onClick={onClear}
          >
            Bỏ bộ lọc
          </button>
        </div>
      </form>
    </>
  );
}
