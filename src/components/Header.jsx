import { useState } from "react";
import { assetUrl } from "../data/data.js";

const links = [
  ["ve-90s", "Về 90s"],
  ["phong-nghi", "Phòng nghỉ"],
  ["nha-hang", "Nhà hàng"],
  ["ca-phe", "Cà phê"],
  ["uu-dai", "Ưu đãi"],
  ["tin-tuc", "Tin tức"],
  ["lien-he", "Liên hệ"],
];
export default function Header({ onConsult }) {
  const [open, setOpen] = useState(false);
  const renderLink = ([id, label]) => (
    <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
      {label}
    </a>
  );
  return (
    <header
      className="header"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <div className="nav-shell">
        <nav className="nav-left" aria-label="Giới thiệu và dịch vụ">
          {links.slice(0, 3).map(renderLink)}
        </nav>
        <a className="brand" href="#" aria-label="90s Homestay — Trang chủ">
          <img
            src={assetUrl("assets/images/misc/logo.png")}
            alt="90s Homestay"
            width="90"
            height="82"
          />
        </a>
        <nav className="nav-right" aria-label="Trải nghiệm và liên hệ">
          {links.slice(3).map(renderLink)}
        </nav>
        <button
          className="mobile-menu-toggle"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
        <button className="mobile-consult" onClick={() => onConsult()}>
          Nhận tư vấn
        </button>
      </div>
      <nav id="mobile-nav" aria-label="Menu trên điện thoại" hidden={!open}>
        {links.map(renderLink)}
      </nav>
    </header>
  );
}
