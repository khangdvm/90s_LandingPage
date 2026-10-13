import PublicState from "./PublicState.jsx";
import ContentAction from "./ContentAction.jsx";
import { assetUrl } from "../data/data.js";
export default function Offers({ resource, onOffers }) {
  const cards = resource.data || [];
  return (
    <section id="uu-dai" className="offers">
      <div className="container offers-inner">
        <div>
          <p className="eyebrow">ƯU ĐÃI TẠI 90s</p>
          <h2>Thêm trải nghiệm cho kỳ nghỉ.</h2>
          {(resource.loading || resource.error || !cards.length) && (
            <PublicState
              resource={resource}
              label="ưu đãi"
              empty={!cards.length}
            />
          )}
        </div>
        <button
          className="button white"
          id="open-offers"
          disabled={!cards.length}
          onClick={onOffers}
        >
          Xem ưu đãi
        </button>
      </div>
    </section>
  );
}
export function OffersDetail({ cards, onConsult }) {
  return (
    <>
      <p>
        Các nhóm chương trình dưới đây dùng để minh họa cách trình bày; điều
        kiện và quyền lợi chưa được áp dụng chính thức.
      </p>
      {cards.map((card) => (
        <div className="offer-card" key={card.id}>
          {assetUrl(card.image) && (
            <img
              className="modal-room-photo"
              src={assetUrl(card.image)}
              alt={card.title}
            />
          )}
          <h3>{card.title}</h3>
          {card.subtitle && <p>{card.subtitle}</p>}
          <p className="public-text">{card.description}</p>
          <ContentAction
            card={card}
            className="text-link"
            onDetail={() => onConsult(null, "combo")}
            onConsult={() => onConsult(null, "combo")}
          >
            {card.ctaText || "Nhận tư vấn"}
          </ContentAction>
        </div>
      ))}
    </>
  );
}
