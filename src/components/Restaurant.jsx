import { SectionHeading } from "./ManagedContent.jsx";
import { BusinessNotice, useContent } from "./ManagedContent.jsx";
import { assetUrl, money } from "../data/data.js";
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
          <SectionHeading
            id="nha-hang"
            title="Một bàn đầy món, một bữa đầy vui."
            subtitle="NHÀ HÀNG 90s"
            description=""
          />
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
        <BusinessNotice />
      </div>
    </section>
  );
}
export function MenuDetail({ card, cards, onMenu, onConsult }) {
  const settings = useContent();
  const menu = card.menuItems?.length
    ? card.menuItems
    : card.dishes.map((name, sortOrder) => ({
        name,
        price: null,
        sortOrder,
        isActive: true,
      }));
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
          {menu
            .filter((x) => x.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((dish, index) => (
              <li key={index}>
                <div>
                  {assetUrl(dish.imageUrl) && (
                    <img
                      className="menu-thumbnail"
                      src={assetUrl(dish.imageUrl)}
                      alt={dish.name}
                    />
                  )}
                  <strong>{dish.name}</strong>
                  {dish.description && <p>{dish.description}</p>}
                </div>
                <span>
                  {dish.price == null
                    ? settings.unpricedLabel
                    : money(dish.price)}
                  {dish.unit ? " / " + dish.unit : ""}
                </span>
              </li>
            ))}
        </ul>
      </div>
      <BusinessNotice />
      <button
        className="button menu-contact"
        onClick={() => onConsult(null, "table")}
      >
        Tư vấn đặt bàn
      </button>
    </>
  );
}
