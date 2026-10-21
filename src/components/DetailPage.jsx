import MediaGallery, { UpdatedAt, mediaItems } from "./MediaGallery.jsx";
import SafeImage from "./SafeImage.jsx";
import {
  contentTarget,
  externalUrl,
  money,
  displayDateTime,
} from "../data/data.js";
import { readStayPreferences } from "../data/publicPreferences.js";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { publicApi } from "../api/publicApi.js";
import { usePublicResource } from "../hooks/usePublicResource.js";
import { SiteConfigContext } from "../data/SiteConfigContext.jsx";
import { assetUrl } from "../data/data.js";
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
    const cover = mediaItems(data)[0];
    const coverImage = assetUrl(
      cover?.type === "image" ? cover.src : cover?.poster || data.image,
    );
    const nodes = [];
    for (const [prop, value] of Object.entries({
      "og:title": title,
      "og:description": description,
      "og:url":
        location.origin +
        import.meta.env.BASE_URL.replace(/\/$/, "") +
        pathname,
      "og:type": kind === "news" ? "article" : "website",
      "og:image": coverImage ? new URL(coverImage, location.origin).href : "",
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
        : kind === "content"
          ? publicApi.contentItem(slug, signal)
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
              {kind === "room" ? (
                <RoomDetails
                  room={data}
                  onConsult={() => setContact(true)}
                  onAllRooms={() => {
                    window.location.assign(
                      import.meta.env.BASE_URL + "#phong-nghi",
                    );
                  }}
                />
              ) : (
                <>
                  {data.subtitle && (
                    <p className="detail-subtitle">{data.subtitle}</p>
                  )}
                  {data.publishedAt && (
                    <p>
                      Ngày đăng:{" "}
                      <time dateTime={data.publishedAt}>
                        {displayDateTime(data.publishedAt)}
                      </time>
                    </p>
                  )}
                  <UpdatedAt value={data.updatedAt} />
                  <MediaGallery item={data} />
                  <RichDocument
                    blocks={data.contentDoc}
                    legacy={data.content || data.description || data.excerpt}
                  />
                  {kind === "content" && (
                    <>
                      {data.menuItems?.filter((item) => item.isActive).length >
                        0 && (
                        <ul className="menu-dishes">
                          {data.menuItems
                            .filter((item) => item.isActive)
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((item, i) => (
                              <li key={i}>
                                <div>
                                  {assetUrl(item.imageUrl) && (
                                    <SafeImage
                                      className="menu-thumbnail"
                                      src={assetUrl(item.imageUrl)}
                                      alt={item.name}
                                    />
                                  )}
                                  <strong>{item.name}</strong>
                                  <p>{item.description}</p>
                                </div>
                                <span>
                                  {item.price === null
                                    ? config.data?.unpricedLabel ||
                                      "Liên hệ để biết giá"
                                    : money(item.price)}{" "}
                                  {item.unit ? " / " + item.unit : ""}
                                </span>
                              </li>
                            ))}
                        </ul>
                      )}
                      {data.section === "restaurant" &&
                        !data.menuItems?.some((item) => item.isActive) && (
                          <p>Chưa có món được công khai trong nhóm này.</p>
                        )}
                      {contentTarget(data.ctaTarget) &&
                        data.ctaTarget !== `/noi-dung/${data.id}` && (
                          <a
                            className="button outline"
                            href={
                              data.ctaTarget.startsWith("#")
                                ? import.meta.env.BASE_URL + data.ctaTarget
                                : contentTarget(data.ctaTarget)
                            }
                            target={
                              externalUrl(data.ctaTarget) ? "_blank" : undefined
                            }
                            rel={
                              externalUrl(data.ctaTarget)
                                ? "noopener noreferrer"
                                : undefined
                            }
                          >
                            {data.ctaText || "Khám phá thêm"}
                          </a>
                        )}
                      <button
                        className="button"
                        onClick={() => setContact(true)}
                      >
                        Nhận tư vấn
                      </button>
                    </>
                  )}
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
              type={
                kind === "content" && data?.section === "restaurant"
                  ? "table"
                  : "room"
              }
              filters={stay}
            />
          </Modal>
        </main>
      </div>
    </SiteConfigContext.Provider>
  );
}
