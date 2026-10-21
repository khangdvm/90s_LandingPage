import { SectionHeading } from "./ManagedContent.jsx";
import SafeImage from "./SafeImage.jsx";
import { BusinessNotice } from "./ManagedContent.jsx";
import PublicState from "./PublicState.jsx";
import ContentAction from "./ContentAction.jsx";
import { assetUrl } from "../data/data.js";
export default function Offers({ resource, onOffers }) {
  const cards = resource.data || [];
  return (
    <section id="uu-dai" className="offers">
      <div className="container offers-inner">
        <div>
          <SectionHeading
            id="uu-dai"
            subtitle="ƯU ĐÃI TẠI 90s"
            title="Thêm trải nghiệm cho kỳ nghỉ."
          />
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
      <BusinessNotice />
      {cards.map((card) => (
        <div className="offer-card" key={card.id}>
          {assetUrl(card.image) && (
            <SafeImage
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
