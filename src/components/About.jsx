import MediaGallery from "./MediaGallery.jsx";
import { SectionIntro } from "./ManagedContent.jsx";
import SafeImage from "./SafeImage.jsx";
import { assetUrl } from "../data/data.js";
import PublicState from "./PublicState.jsx";
import ContentAction from "./ContentAction.jsx";
export default function About({ resource, onConsult }) {
  const cards = resource.data || [];
  return (
    <section id="ve-90s" className="about">
      <SectionIntro id="ve-90s" />
      {resource.loading || resource.error || !cards.length ? (
        <div className="container">
          <PublicState
            resource={resource}
            label="giới thiệu"
            empty={!cards.length}
          />
        </div>
      ) : (
        cards.map((card) => {
          const words = card.title.split(/\s+/);
          return (
            <div className="container about-inner" key={card.id}>
              <div>
                <p className="eyebrow">{card.subtitle || "VỀ 90s HOMESTAY"}</p>
                <h2>
                  {words.slice(0, 3).join(" ")}
                  {words.length > 3 && (
                    <>
                      <br />
                      {" " + words.slice(3).join(" ")}
                    </>
                  )}
                </h2>
              </div>
              <div className="about-copy public-text">
                <p>{card.description}</p>
                {card.ctaText && (
                  <ContentAction
                    card={card}
                    className="text-link"
                    onDetail={() => onConsult()}
                    onConsult={() => onConsult()}
                  >
                    {card.ctaText}
                  </ContentAction>
                )}
              </div>
              {card.media?.length > 0 ? <MediaGallery item={card} /> : assetUrl(card.image) && (
                <SafeImage
                  className="about-watermark"
                  src={assetUrl(card.image)}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
              )}
            </div>
          );
        })
      )}
    </section>
  );
}
