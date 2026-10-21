import MediaGallery, { UpdatedAt } from "./MediaGallery.jsx";
import { Link } from "react-router-dom";
import { SectionHeading } from "./ManagedContent.jsx";
import { BusinessNotice, useContent } from "./ManagedContent.jsx";
import ContentPhoto from "./ContentPhoto.jsx";
import ContentAction from "./ContentAction.jsx";
import PublicState from "./PublicState.jsx";
function CafeCard({ card, className = "", onCafe, onConsult }) {
  return (
    <ContentAction
      card={card}
      defaultTarget="#ca-phe"
      className={className}
      data-cafe={card.id}
      onDetail={() => onCafe(card)}
      onConsult={() => onConsult()}
    >
      <ContentPhoto
        item={card}
        className="cafe-photo"
        label={`Ảnh ${card.title}`}
      />
      <strong>{card.title}</strong>
      {card.subtitle && <small>{card.subtitle}</small>}
      {card.ctaText && <span className="red action-label">{card.ctaText}</span>}
    </ContentAction>
  );
}
export default function Cafe({ resource, onCafe, onConsult }) {
  const cards = resource.data || [];
  const settings = useContent();
  return (
    <section id="ca-phe" className="section container">
      <div className="section-head">
        <SectionHeading
          id="ca-phe"
          title="Không chỉ là một ly cà phê."
          subtitle={settings.cafeStatus}
          description="Một góc ngồi, một món uống, một khoảng trời để ngắm."
        />
      </div>
      {resource.loading || resource.error || !cards.length ? (
        <PublicState resource={resource} label="cà phê" empty={!cards.length} />
      ) : (
        <div className="cafe-layout">
          <CafeCard
            card={cards[0]}
            className="cafe-feature"
            onCafe={onCafe}
            onConsult={onConsult}
          />
          <div className="cafe-side">
            {cards.slice(1).map((card) => (
              <CafeCard
                card={card}
                key={card.id}
                onCafe={onCafe}
                onConsult={onConsult}
              />
            ))}
          </div>
        </div>
      )}
      <BusinessNotice />
    </section>
  );
}
export function CafeDetail({ card, cards, onCafe }) {
  const settings = useContent();
  return (
    <>
      <MediaGallery item={card} />
      <UpdatedAt value={card.updatedAt} />
      <Link className="text-link" to={"/noi-dung/" + card.id}>Xem trang chi tiết</Link>
      <p className="eyebrow red">{settings.cafeStatus}</p>
      <p className="public-text">{card.description}</p>
      <BusinessNotice />
      <div className="modal-menu-tabs">
        {cards.map((item) => (
          <button
            key={item.id}
            data-cafe={item.id}
            className={`filter ${item.id === card.id ? "active" : ""}`}
            aria-pressed={item.id === card.id}
            onClick={() => onCafe(item)}
          >
            {item.title}
          </button>
        ))}
      </div>
    </>
  );
}
