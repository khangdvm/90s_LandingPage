import { useRef, useState } from "react";
import Header from "./components/Header.jsx";
import HeroSlider, { useReducedMotion } from "./components/HeroSlider.jsx";
import About from "./components/About.jsx";
import Rooms, {
  RoomDetails,
  AllRooms,
  ExpectedStay,
} from "./components/Rooms.jsx";
import Restaurant, { MenuDetail } from "./components/Restaurant.jsx";
import Cafe, { CafeDetail } from "./components/Cafe.jsx";
import Offers, { OffersDetail } from "./components/Offers.jsx";
import News from "./components/News.jsx";
import ConsultationModal, { Modal } from "./components/ConsultationModal.jsx";
import Footer, { DemoInfo } from "./components/Footer.jsx";
import { today, nextDay, cafeNames } from "./data/data.js";

export default function App() {
  const [filters, setFilters] = useState(() => ({
    view: "all",
    guests: 0,
    checkin: today(),
    checkout: nextDay(today()),
    searched: false,
  }));
  const [modal, setModal] = useState(null);
  const mainRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const onConsult = (room = null, type = "room") =>
    setModal({ kind: "consult", title: "Nhận tư vấn", room, type });
  const onRoom = (room) => setModal({ kind: "room", title: room.name, room });
  const onAllRooms = () =>
    setModal({ kind: "all-rooms", title: "Các hạng phòng tại 90s" });
  const onMenu = (foodKey = "hotpot") =>
    setModal({ kind: "menu", title: "Thực đơn tại 90s", foodKey });
  const onCafe = (index) =>
    setModal({ kind: "cafe", title: cafeNames[index], index });
  const onDismiss = () => setModal(null);
  let content = null;
  switch (modal?.kind) {
    case "room":
      content = (
        <RoomDetails
          room={modal.room}
          onConsult={onConsult}
          onAllRooms={onAllRooms}
        />
      );
      break;
    case "all-rooms":
      content = <AllRooms onRoom={onRoom} />;
      break;
    case "stay":
      content = (
        <ExpectedStay
          filters={filters}
          onApply={(value) => {
            setFilters(value);
            onDismiss();
          }}
          onClear={() => {
            setFilters((value) => ({
              ...value,
              view: "all",
              guests: 0,
              searched: false,
            }));
            onDismiss();
          }}
        />
      );
      break;
    case "consult":
      content = (
        <ConsultationModal
          room={modal.room}
          type={modal.type}
          filters={filters}
        />
      );
      break;
    case "menu":
      content = (
        <MenuDetail
          foodKey={modal.foodKey}
          onMenu={onMenu}
          onConsult={onConsult}
        />
      );
      break;
    case "cafe":
      content = <CafeDetail index={modal.index} onCafe={onCafe} />;
      break;
    case "offers":
      content = <OffersDetail onConsult={onConsult} />;
      break;
    case "article":
      content = (
        <>
          <p>{modal.article.excerpt}</p>
          <div className="form-notice">
            Bài mẫu dùng để duyệt bố cục. Nội dung đầy đủ và đường dẫn bài viết
            chính thức chưa được cung cấp.
          </div>
        </>
      );
      break;
    case "info":
      content = <DemoInfo />;
      break;
  }
  return (
    <>
      <a className="skip" href="#main">
        Đến nội dung chính
      </a>
      <Header onConsult={onConsult} />
      <main id="main" ref={mainRef} tabIndex="-1">
        <h1 className="sr-only">90s Homestay — Hẹn nhau ở Tam Đảo</h1>
        <HeroSlider onConsult={onConsult} reducedMotion={reducedMotion} />
        <About />
        <Rooms
          filters={filters}
          onView={(view) => setFilters((value) => ({ ...value, view }))}
          onRoom={onRoom}
          onAllRooms={onAllRooms}
          onStay={() =>
            setModal({ kind: "stay", title: "Ngày dự kiến lưu trú" })
          }
          onConsult={onConsult}
        />
        <Restaurant onMenu={onMenu} onConsult={onConsult} />
        <Cafe onCafe={onCafe} />
        <Offers
          onOffers={() =>
            setModal({ kind: "offers", title: "Gợi ý ưu đãi tại 90s" })
          }
        />
        <News
          onArticle={(article) =>
            setModal({ kind: "article", title: article.title, article })
          }
        />
      </main>
      <Footer
        onConsult={onConsult}
        onInfo={() => setModal({ kind: "info", title: "Về bản demo" })}
      />
      <Modal
        open={Boolean(modal)}
        title={modal?.title || ""}
        onDismiss={onDismiss}
        fallbackRef={mainRef}
      >
        {content}
      </Modal>
    </>
  );
}
