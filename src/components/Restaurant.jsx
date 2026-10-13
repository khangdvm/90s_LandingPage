import ContentPhoto from "./ContentPhoto.jsx";
import ContentAction from "./ContentAction.jsx";
import PublicState from "./PublicState.jsx";
export default function Restaurant({ resource, onMenu, onConsult }) {
  const cards = resource.data || [];
  const feature = cards[0];
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
              disabled={!feature}
              onClick={() => onMenu(feature)}
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
        {resource.loading || resource.error || !feature ? (
          <PublicState resource={resource} label="nhà hàng" empty={!feature} />
        ) : (
          <div className="food-layout">
            <div className="food-list">
              {cards.slice(1).map((card) => (
                <ContentAction
                  key={card.id}
                  card={card}
                  defaultTarget="#nha-hang"
                  className="food-item"
                  data-food={card.id}
                  onDetail={() => onMenu(card)}
                  onConsult={() => onConsult(null, "table")}
                >
                  <ContentPhoto
                    item={card}
                    className="food-photo"
                    label={`Ảnh ${card.title}`}
                  />
                  <span>
                    <strong>{card.title}</strong>
                    <small>{card.subtitle}</small>
                    <span className="red action-label">
                      {card.ctaText || "Khám phá món"}
                    </span>
                  </span>
                </ContentAction>
              ))}
            </div>
            <ContentAction
              card={feature}
              defaultTarget="#nha-hang"
              className="food-feature"
              data-food={feature.id}
              onDetail={() => onMenu(feature)}
              onConsult={() => onConsult(null, "table")}
            >
              <ContentPhoto
                item={feature}
                className="food-photo"
                label={`Ảnh ${feature.title}`}
              />
              <strong>{feature.title}</strong>
              <small>{feature.subtitle}</small>
              {feature.ctaText && (
                <span className="red action-label">{feature.ctaText}</span>
              )}
            </ContentAction>
          </div>
        )}
        <p className="demo-note">Hình ảnh và thực đơn minh họa cho bản demo.</p>
      </div>
    </section>
  );
}
export function MenuDetail({ card, cards, onMenu, onConsult }) {
  return (
    <>
      <div className="modal-menu-tabs" role="group" aria-label="Nhóm món">
        {cards.map((item) => (
          <button
            key={item.id}
            data-food={item.id}
            className={`filter ${item.id === card.id ? "active" : ""}`}
            aria-pressed={item.id === card.id}
            onClick={() => onMenu(item)}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className="menu-detail">
        <ContentPhoto
          item={card}
          className="food-photo menu-detail-photo"
          label={`Ảnh ${card.title}`}
          as="div"
        />
        <h3>{card.title}</h3>
        <p className="public-text">{card.description}</p>
        <ul className="menu-dishes">
          {card.dishes.map((name, index) => (
            <li key={`${name}-${index}`}>
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
