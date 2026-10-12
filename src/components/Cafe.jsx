import { cafeNames, cafeDescriptions } from "../data/data.js";

function CafeCard({ index, className = "", onCafe }) {
  return (
    <button
      className={className}
      data-cafe={index}
      onClick={() => onCafe(index)}
    >
      <span
        className={`photo cafe-photo q${index}`}
        role="img"
        aria-label={`${cafeNames[index]} — ảnh ý tưởng cà phê`}
      />
      <strong>{cafeNames[index]}</strong>
    </button>
  );
}
export default function Cafe({ onCafe }) {
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
      <div className="cafe-layout">
        <CafeCard index={0} className="cafe-feature" onCafe={onCafe} />
        <div className="cafe-side">
          <CafeCard index={1} onCafe={onCafe} />
          <CafeCard index={2} onCafe={onCafe} />
        </div>
      </div>
      <p className="demo-note">
        Hình ảnh ý tưởng · Thông tin khai trương sẽ được cập nhật.
      </p>
    </section>
  );
}
export function CafeDetail({ index, onCafe }) {
  return (
    <>
      <div
        className={`photo cafe-photo q${index} modal-room-photo`}
        role="img"
        aria-label="Ảnh ý tưởng cà phê"
      />
      <p className="eyebrow red">CÀ PHÊ · SẮP RA MẮT</p>
      <p>{cafeDescriptions[index]}</p>
      <div className="form-notice">
        Hình ảnh ý tưởng. Không gian, menu và lịch khai trương sẽ được cập nhật
        khi có thông tin chính thức.
      </div>
      <div className="modal-menu-tabs">
        {cafeNames.map((name, i) => (
          <button
            key={name}
            data-cafe={i}
            className={`filter ${i === index ? "active" : ""}`}
            aria-pressed={i === index}
            onClick={() => onCafe(i)}
          >
            {name}
          </button>
        ))}
      </div>
    </>
  );
}
