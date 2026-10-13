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
  return (
    <section id="ca-phe" className="section container">
      <div className="section-head">
        <div>
          <p className="eyebrow red">CÀ PHÊ · SẮP RA MẮT</p>
          <h2>Không chỉ là một ly cà phê.</h2>
          <p className="section-description">
            Một góc ngồi, một món uống, một khoảng trời để ngắm.
          </p>
        </div>
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
      <p className="demo-note">
        Hình ảnh ý tưởng · Thông tin khai trương sẽ được cập nhật.
      </p>
    </section>
  );
}
export function CafeDetail({ card, cards, onCafe }) {
  return (
    <>
      <ContentPhoto
        item={card}
        className="cafe-photo modal-room-photo"
        label={`Ảnh ${card.title}`}
        as="div"
      />
      <p className="eyebrow red">CÀ PHÊ · SẮP RA MẮT</p>
      <p className="public-text">{card.description}</p>
      <div className="form-notice">
        Hình ảnh ý tưởng. Không gian, menu và lịch khai trương sẽ được cập nhật
        khi có thông tin chính thức.
      </div>
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
