export default function Offers({ onOffers }) {
  return (
    <section id="uu-dai" className="offers">
      <div className="container offers-inner">
        <div>
          <p className="eyebrow">ƯU ĐÃI TẠI 90s</p>
          <h2>Thêm trải nghiệm cho kỳ nghỉ.</h2>
        </div>
        <button className="button white" id="open-offers" onClick={onOffers}>
          Xem ưu đãi
        </button>
      </div>
    </section>
  );
}
export function OffersDetail({ onConsult }) {
  return (
    <>
      <p>
        Các nhóm chương trình dưới đây dùng để minh họa cách trình bày; điều
        kiện và quyền lợi chưa được áp dụng chính thức.
      </p>
      <div className="offer-card">
        <h3>Kỳ nghỉ ngày thường</h3>
        <p>Một chuyến đi thảnh thơi giữa tuần, kết hợp nghỉ ngơi và ăn uống.</p>
        <button className="text-link" onClick={() => onConsult(null, "combo")}>
          Tư vấn gói nghỉ & ăn
        </button>
      </div>
      <div className="offer-card">
        <h3>Đi cùng nhau, vui nhiều hơn</h3>
        <p>
          Gợi ý dành cho nhóm cần nhiều phòng. Chia sẻ ngày đi và số người để
          chuẩn bị phương án phù hợp.
        </p>
        <button className="text-link" onClick={() => onConsult()}>
          Tư vấn cho nhóm
        </button>
      </div>
    </>
  );
}
