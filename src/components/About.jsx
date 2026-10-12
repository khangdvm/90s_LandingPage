import { assetUrl } from "../data/data.js";

export default function About() {
  return (
    <section id="ve-90s" className="about">
      <div className="container about-inner">
        <div>
          <p className="eyebrow">VỀ 90s HOMESTAY</p>
          <h2>
            Một điểm hẹn
            <br />
            giữa Tam Đảo.
          </h2>
        </div>
        <p className="about-copy">
          Nghỉ giữa thiên nhiên, quây quần bên bữa ngon và dành thời gian cho
          nhau. 90s mang đến trải nghiệm lưu trú, nhà hàng và một không gian cà
          phê mới đang được chuẩn bị.
        </p>
        <img
          className="about-watermark"
          src={assetUrl("assets/images/misc/logo.png")}
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
      </div>
    </section>
  );
}
