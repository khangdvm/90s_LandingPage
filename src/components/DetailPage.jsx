import { readStayPreferences } from "../data/publicPreferences.js";
import SafeImage from "./SafeImage.jsx";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { publicApi } from "../api/publicApi.js";
import { usePublicResource } from "../hooks/usePublicResource.js";
import { SiteConfigContext } from "../data/SiteConfigContext.jsx";
import { assetUrl, displayDate } from "../data/data.js";
import { RoomDetails } from "./Rooms.jsx";
import RichDocument from "./RichDocument.jsx";
import Header from "./Header.jsx";
import ConsultationModal, { Modal } from "./ConsultationModal.jsx";
import PublicState from "./PublicState.jsx";
import { settingDefaults } from "../../shared/content.js";
export function NotFound() {
  useEffect(() => {
    document.title = "Không tìm thấy nội dung — 90s Homestay";
  }, []);
  return (
    <main className="public-site container detail-page">
      <h1>Không tìm thấy nội dung</h1>
      <p>Nội dung có thể đã được ẩn hoặc đường dẫn không tồn tại.</p>
      <Link to="/">Về trang chủ</Link>
    </main>
  );
}
function Metadata({ data, kind, brand = "90s Homestay" }) {
  const { pathname } = useLocation();
  useEffect(() => {
    const title = data.name || data.title;
    document.title = title + " — " + brand;
    const description = (data.excerpt || data.description || "").slice(0, 180);
    const old = document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content");
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    const nodes = [];
    for (const [prop, value] of Object.entries({
      "og:title": title,
      "og:description": description,
      "og:url":
        location.origin +
        import.meta.env.BASE_URL.replace(/\/$/, "") +
        pathname,
      "og:type": kind === "news" ? "article" : "website",
      "og:image": assetUrl(data.image)
        ? new URL(assetUrl(data.image), location.origin).href
        : "",
    })) {
      if (!value) continue;
      const el = document.createElement("meta");
      el.setAttribute("property", prop);
      el.content = value;
      document.head.append(el);
      nodes.push(el);
    }
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href =
      location.origin + import.meta.env.BASE_URL.replace(/\/$/, "") + pathname;
    document.head.append(canonical);
    nodes.push(canonical);
    return () => {
      nodes.forEach((el) => el.remove());
      if (old)
        document
          .querySelector('meta[name="description"]')
          ?.setAttribute("content", old);
    };
  }, [data, kind, pathname, brand]);
  return null;
}
export default function DetailPage({ kind }) {
  const { slug } = useParams();
  const location = useLocation();
  const stay = readStayPreferences(location.state?.stay);
  const loader = useCallback(
    (signal) =>
      kind === "room"
        ? publicApi.room(slug, signal)
        : publicApi.newsItem(slug, signal),
    [kind, slug],
  );
  const resource = usePublicResource(loader);
  const config = usePublicResource(publicApi.siteConfig);
  const [contact, setContact] = useState(false);
  const data = resource.data;
  useEffect(() => {
    setContact(false);
    window.scrollTo(0, 0);
  }, [slug]);
  if (resource.error?.status === 404) return <NotFound />;
  return (
    <SiteConfigContext.Provider
      value={{
        ...config,
        data: config.data ? { ...settingDefaults, ...config.data } : null,
      }}
    >
      <div className="public-site">
        <Header onConsult={() => setContact(true)} />
        <main className="container detail-page">
          <Link to="/">← Về trang chủ</Link>
          {data ? (
            <>
              <Metadata
                data={data}
                kind={kind}
                brand={config.data?.brandName || "90s Homestay"}
              />
              <h1>{data.name || data.title}</h1>
              {(!config.data || config.data.contentConfirmed !== "true") && (
                <p className="form-notice">Nội dung mẫu / chưa được xác nhận</p>
              )}
              {kind === "room" ? (
                <RoomDetails
                  room={data}
                  onConsult={() => setContact(true)}
                  onAllRooms={() => {
                    location.href = import.meta.env.BASE_URL + "#phong-nghi";
                  }}
                />
              ) : (
                <>
                  <time dateTime={data.publishedAt}>
                    {displayDate(data.publishedAt)}
                  </time>
                  {assetUrl(data.image) && (
                    <SafeImage
                      className="article-photo"
                      src={assetUrl(data.image)}
                      alt={data.title}
                    />
                  )}
                  <RichDocument
                    blocks={data.contentDoc}
                    legacy={data.content || data.excerpt}
                  />
                </>
              )}
            </>
          ) : (
            <PublicState resource={resource} label="nội dung" />
          )}
          <Modal
            open={contact}
            title="Nhận tư vấn"
            onDismiss={() => setContact(false)}
          >
            <ConsultationModal
              room={kind === "room" ? data : null}
              type="room"
              filters={stay}
            />
          </Modal>
        </main>
      </div>
    </SiteConfigContext.Provider>
  );
}
