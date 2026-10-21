import { useNavigate } from "react-router-dom";
import { BusinessNotice, SectionIntro } from "./components/ManagedContent.jsx";
import { settingDefaults } from "../shared/content.js";
import { useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import HeroSlider, { useReducedMotion } from "./components/HeroSlider.jsx";
import About from "./components/About.jsx";
import Rooms, { AllRooms, ExpectedStay } from "./components/Rooms.jsx";
import Restaurant, { MenuDetail } from "./components/Restaurant.jsx";
import Cafe, { CafeDetail } from "./components/Cafe.jsx";
import Offers, { OffersDetail } from "./components/Offers.jsx";
import News from "./components/News.jsx";
import ConsultationModal, { Modal } from "./components/ConsultationModal.jsx";
import Footer, { DemoInfo } from "./components/Footer.jsx";
import { today, nextDay } from "./data/data.js";

import { publicApi } from "./api/publicApi.js";
import { usePublicResource } from "./hooks/usePublicResource.js";
import { SiteConfigContext } from "./data/SiteConfigContext.jsx";
import { RoomDetail, ArticleDetail } from "./components/PublicDetails.jsx";

export default function App() {
  const navigate = useNavigate();
  const roomResource = usePublicResource(publicApi.rooms);
  const heroResource = usePublicResource(publicApi.heroSlides);
  const restaurantResource = usePublicResource(publicApi.restaurant);
  const cafeResource = usePublicResource(publicApi.cafe);
  const promotionResource = usePublicResource(publicApi.promotion);
  const experienceResource = usePublicResource(publicApi.experience);
  const newsSummaryLoader = useRef((signal) =>
    publicApi.news({ category: "", page: 1, limit: 1 }, signal),
  );
  const newsSummary = usePublicResource(newsSummaryLoader.current);
  const rawConfig = usePublicResource(publicApi.siteConfig);
  const effective = { ...settingDefaults, ...rawConfig.data };
  const availability = {
    "ve-90s": experienceResource,
    "phong-nghi": roomResource,
    "nha-hang": restaurantResource,
    "ca-phe": cafeResource,
    "uu-dai": promotionResource,
  };
  for (const [id, r] of Object.entries(availability))
    if (r.data && !r.data.length) effective[id + "Enabled"] = "false";
  if (newsSummary.data?.pagination.total === 0)
    effective["tin-tucEnabled"] = "false";
  const siteConfig = { ...rawConfig, data: effective };
  const enabled = (id) => effective[id + "Enabled"] !== "false";
  useEffect(() => {
    if (!siteConfig.data) return;
    document.title = siteConfig.data.siteTitle || "90s Homestay";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", siteConfig.data.siteDescription || "");
  }, [rawConfig.data]);
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
  const onRoom = (room) => {
    setModal(null);
    navigate("/phong/" + room.slug);
  };
  const onAllRooms = () =>
    setModal({ kind: "all-rooms", title: "Các hạng phòng tại 90s" });
  const onMenu = (card) =>
    setModal({ kind: "menu", title: "Thực đơn tại 90s", card });
  const onCafe = (card) => setModal({ kind: "cafe", title: card.title, card });
  const onDismiss = () => setModal(null);
  let content = null;
  switch (modal?.kind) {
    case "room":
      content = (
        <RoomDetail
          room={modal.room}
          onConsult={onConsult}
          onAllRooms={onAllRooms}
        />
      );
      break;
    case "all-rooms":
      content = <AllRooms rooms={roomResource.data || []} onRoom={onRoom} />;
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
          card={modal.card}
          cards={restaurantResource.data || []}
          onMenu={onMenu}
          onConsult={onConsult}
        />
      );
      break;
    case "cafe":
      content = (
        <CafeDetail
          card={modal.card}
          cards={cafeResource.data || []}
          onCafe={onCafe}
          onConsult={onConsult}
        />
      );
      break;
    case "offers":
      content = (
        <OffersDetail
          cards={promotionResource.data || []}
          onConsult={onConsult}
        />
      );
      break;
    case "article":
      content = (
        <ArticleDetail key={modal.article.slug} slug={modal.article.slug} />
      );
      break;
    case "info":
      content = <DemoInfo />;
      break;
  }
  return (
    <SiteConfigContext.Provider value={siteConfig}>
      <div className="public-site">
        <a className="skip" href="#main">
          Đến nội dung chính
        </a>
        <Header onConsult={onConsult} />
        <main id="main" ref={mainRef} tabIndex="-1">
          <h1 className="sr-only">
            {siteConfig.data?.siteTitle || "90s Homestay"}
          </h1>
          <BusinessNotice />
          {(heroResource.loading ||
            heroResource.error ||
            !!heroResource.data?.length) && (
            <HeroSlider
              resource={heroResource}
              onConsult={onConsult}
              reducedMotion={reducedMotion}
            />
          )}
          {enabled("ve-90s") && (
            <>
              <SectionIntro id="ve-90s" />
              <About resource={experienceResource} onConsult={onConsult} />
            </>
          )}
          {enabled("phong-nghi") && (
            <>
              <Rooms
                resource={roomResource}
                filters={filters}
                onView={(view) => setFilters((value) => ({ ...value, view }))}
                onRoom={onRoom}
                onAllRooms={onAllRooms}
                onStay={() =>
                  setModal({ kind: "stay", title: "Ngày dự kiến lưu trú" })
                }
                onConsult={onConsult}
              />
            </>
          )}
          {enabled("nha-hang") && (
            <>
              <Restaurant
                resource={restaurantResource}
                onMenu={onMenu}
                onConsult={onConsult}
              />
            </>
          )}
          {enabled("ca-phe") && (
            <>
              <Cafe
                resource={cafeResource}
                onCafe={onCafe}
                onConsult={onConsult}
              />
            </>
          )}
          {enabled("uu-dai") && (
            <>
              <Offers
                resource={promotionResource}
                onOffers={() =>
                  setModal({ kind: "offers", title: "Gợi ý ưu đãi tại 90s" })
                }
              />
            </>
          )}
          {enabled("tin-tuc") && (
            <>
              <News
                onArticle={(article) => navigate("/tin-tuc/" + article.slug)}
              />
            </>
          )}
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
      </div>
    </SiteConfigContext.Provider>
  );
}
