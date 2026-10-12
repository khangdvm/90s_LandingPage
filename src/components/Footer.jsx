import { assetUrl, CONTACT_INFO } from "../data/data.js";
import { ContactLinks } from "./ConsultationModal.jsx";

export default function Footer({ onConsult, onInfo }) {
  return (
    <>
      <footer id="lien-he">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <img
                src={assetUrl("assets/images/misc/logo.png")}
                alt="90s Homestay"
                width="104"
                height="98"
              />
              <strong>90s Homestay · Tam Đảo</strong>
              <p>Lưu trú · Nhà hàng · Cà phê</p>
              <p id="contact-location">Địa điểm: {CONTACT_INFO.location}</p>
            </div>
            <div>
              <p className="eyebrow red">LIÊN HỆ</p>
              <button onClick={() => onConsult()}>Tư vấn phòng</button>
              <div id="footer-contacts">
                <ContactLinks onPlaceholder={() => onConsult()} />
              </div>
              <button onClick={() => onConsult(null, "table")}>
                Tư vấn đặt bàn
              </button>
              <a
                id="map-link"
                href={CONTACT_INFO.map}
                target="_blank"
                rel="noopener noreferrer"
              >
                Xem đường đi
              </a>
            </div>
            <div>
              <p className="eyebrow red">KHÁM PHÁ</p>
              <a href="#ve-90s">Về 90s</a>
              <a href="#uu-dai">Ưu đãi</a>
              <a href="#nha-hang">Nhà hàng & cà phê</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 90s Homestay · Bản demo</span>
            <button id="demo-info" onClick={onInfo}>
              Thông tin về bản demo
            </button>
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
export function DemoInfo() {
  return (
    <>
      <p>
        Đây là bản thiết kế website 90s Homestay để xem bố cục và thử thao tác.
        Hình ảnh phòng, món ăn, cà phê và các số liệu là minh họa.
      </p>
      <p>
        Giá, số lượng phòng, sức chứa và chương trình ưu đãi cần được cập nhật
        từ thông tin thực tế của 90s. Giao diện tư vấn chỉ mở kênh liên hệ;
        không gửi thông tin tự động.
      </p>
      <p>
        Ảnh bìa đã được AI điều chỉnh ánh sáng từ ảnh cảnh quan tham khảo trong
        bài viết về 90s trên{" "}
        <a
          className="text-link"
          href="https://tripday.vn/review/90s-homestay-tam-dao/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tripday
        </a>
        . Các ảnh dịch vụ còn lại là hình ảnh ý tưởng.
      </p>
    </>
  );
}
