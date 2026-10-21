import SafeImage from "./SafeImage.jsx";
import { useContent, SectionIntro } from "./ManagedContent.jsx";
import { assetUrl, externalUrl } from "../data/data.js";
import { ContactLinks } from "./ConsultationModal.jsx";

import { useSiteConfig } from "../data/SiteConfigContext.jsx";
import PublicState from "./PublicState.jsx";
export default function Footer({ onConsult }) {
  const resource = useSiteConfig();
  const CONTACT_INFO = useContent();
  if (CONTACT_INFO["lien-heEnabled"] === "false") return null;
  const map = externalUrl(CONTACT_INFO.mapUrl);
  return (
    <>
      <footer id="lien-he">
        <SectionIntro id="lien-he" />
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <SafeImage
                src={assetUrl(CONTACT_INFO.logoUrl)}
                alt={CONTACT_INFO.brandName}
                width="104"
                height="98"
              />
              <strong>{CONTACT_INFO.brandName}</strong>
              <p>{CONTACT_INFO.footerText}</p>
              <p id="contact-location">
                Địa điểm: {CONTACT_INFO.address || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <p className="eyebrow red">LIÊN HỆ</p>
              <button onClick={() => onConsult()}>Tư vấn phòng</button>
              {(resource.loading || resource.error) && (
                <PublicState resource={resource} label="thông tin liên hệ" />
              )}
              <div id="footer-contacts">
                <ContactLinks onPlaceholder={() => onConsult()} />
              </div>
              <button onClick={() => onConsult(null, "table")}>
                Tư vấn đặt bàn
              </button>
              <a
                id="map-link"
                href={map || "#"}
                aria-disabled={!map || undefined}
                onClick={(event) => {
                  if (!map) event.preventDefault();
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Xem đường đi
              </a>
            </div>
            <div>
              <p className="eyebrow red">KHÁM PHÁ</p>
              <a
                hidden={CONTACT_INFO["ve-90sEnabled"] === "false"}
                href="#ve-90s"
              >
                Về 90s
              </a>
              <a
                hidden={CONTACT_INFO["uu-daiEnabled"] === "false"}
                href="#uu-dai"
              >
                Ưu đãi
              </a>
              <a
                hidden={CONTACT_INFO["nha-hangEnabled"] === "false"}
                href="#nha-hang"
              >
                Nhà hàng & cà phê
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} {CONTACT_INFO.brandName}
            </span>
          </div>
        </div>
      </footer>
      <div className="mobile-actions">
        <button
          className="button outline"
          onClick={() => onConsult(null, "table")}
        >
          Đặt bàn ăn
        </button>
        <button className="button" onClick={() => onConsult()}>
          Nhận tư vấn phòng
        </button>
      </div>
    </>
  );
}
