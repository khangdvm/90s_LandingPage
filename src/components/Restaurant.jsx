import { foods } from "../data/data.js";

export default function Restaurant({ onMenu, onConsult }) {
  const subtitles = {
    grill: "Thơm ngon khó cưỡng",
    meal: "Hương vị thân quen",
    greens: "Tươi ngon từ cao nguyên",
  };
  return (
    <section id="nha-hang" className="dining section">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow red">NHÀ HÀNG 90s</p>
            <h2>
              Một bàn đầy món,
              <br className="mobile-break" /> một bữa đầy vui.
            </h2>
          </div>
          <div className="head-actions">
            <button
              className="button outline"
              id="open-menu"
              onClick={() => onMenu("hotpot")}
            >
              Xem thực đơn
            </button>
            <button
              className="text-link"
              onClick={() => onConsult(null, "table")}
            >
              Tư vấn đặt bàn
            </button>
          </div>
        </div>
        <div className="food-layout">
          <div className="food-list">
            {["grill", "meal", "greens"].map((key) => (
              <button
                key={key}
                className="food-item"
                data-food={key}
                onClick={() => onMenu(key)}
              >
                <span
                  className={`photo food-photo q${foods[key].q}`}
                  role="img"
                  aria-label={`${foods[key].name} — ảnh minh họa`}
                />
                <span>
                  <strong>{foods[key].name}</strong>
                  <small>{subtitles[key]}</small>
                  <span className="red action-label">Khám phá món</span>
                </span>
              </button>
            ))}
          </div>
          <button
            className="food-feature"
            data-food="hotpot"
            onClick={() => onMenu("hotpot")}
          >
            <span
              className="photo food-photo q0"
              role="img"
              aria-label="Bàn lẩu ấm cúng minh họa"
            />
            <strong>Lẩu nóng, quây quần cùng nhau.</strong>
            <small>Một bữa ăn ấm cúng sau ngày dài khám phá.</small>
          </button>
        </div>
        <p className="demo-note">Hình ảnh và thực đơn minh họa cho bản demo.</p>
      </div>
    </section>
  );
}
export function MenuDetail({ foodKey, onMenu, onConsult }) {
  const food = foods[foodKey] || foods.hotpot;
  return (
    <>
      <div className="modal-menu-tabs" role="group" aria-label="Nhóm món">
        {Object.entries(foods).map(([key, item]) => (
          <button
            key={key}
            data-food={key}
            className={`filter ${key === foodKey ? "active" : ""}`}
            aria-pressed={key === foodKey}
            onClick={() => onMenu(key)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="menu-detail">
        <div
          className={`photo food-photo q${food.q} menu-detail-photo`}
          role="img"
          aria-label="Ảnh món ăn minh họa"
        />
        <h3>{food.name}</h3>
        <p>{food.description}</p>
        <ul className="menu-dishes">
          {food.dishes.map((name) => (
            <li key={name}>
              {name}
              <span>Giá cập nhật sau</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="form-notice">
        Món ăn và hình ảnh là gợi ý minh họa, chưa phải thực đơn bán hàng chính
        thức.
      </div>
      <button
        className="button menu-contact"
        onClick={() => onConsult(null, "table")}
      >
        Tư vấn đặt bàn
      </button>
    </>
  );
}
