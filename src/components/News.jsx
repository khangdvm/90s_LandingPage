import { useContent, SectionHeading } from "./ManagedContent.jsx";
import SafeImage from "./SafeImage.jsx";
import { Link, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useRef, Fragment } from "react";
import {
  NEWS_PAGE_SIZE,
  displayDate,
  assetUrl,
  contentTarget,
  externalUrl,
} from "../data/data.js";
import { publicApi } from "../api/publicApi.js";
import { usePublicResource } from "../hooks/usePublicResource.js";
import PublicState from "./PublicState.jsx";
export default function News({ onArticle }) {
  const config = useContent();
  const articleTarget = (value) => {
    const url = contentTarget(value);
    return url.startsWith("#") && config[url.slice(1) + "Enabled"] === "false"
      ? ""
      : url;
  };
  const [params, setParams] = useSearchParams();
  const category = ["90s", "tam-dao"].includes(params.get("newsCategory"))
    ? params.get("newsCategory")
    : "90s";
  const rawPage = params.get("newsPage");
  const page = /^[1-9]\d{0,5}$/.test(rawPage || "") ? Number(rawPage) : 1;
  function setPage(next) {
    setParams(
      (current) => {
        const changed = new URLSearchParams(current);
        changed.set("newsPage", String(next));
        return changed;
      },
      { replace: true },
    );
  }
  function setCategory(next) {
    setParams(
      (current) => {
        const changed = new URLSearchParams(current);
        changed.set("newsCategory", next);
        changed.set("newsPage", "1");
        return changed;
      },
      { replace: true },
    );
  }
  const activePage = useRef(null),
    shouldFocus = useRef(false);
  const loader = useCallback(
    (signal) =>
      publicApi.news({ category, page, limit: NEWS_PAGE_SIZE }, signal),
    [category, page],
  );
  const resource = usePublicResource(loader);
  const displayed = resource.data?.data || [];
  const pagination = resource.data?.pagination;
  const count = pagination?.totalPages || 0;
  useEffect(() => {
    if (pagination && page > Math.max(1, count)) setPage(Math.max(1, count));
  }, [pagination, page, count]);
  useEffect(() => {
    if (shouldFocus.current && !resource.loading) {
      activePage.current?.focus({ preventScroll: true });
      shouldFocus.current = false;
    }
  }, [page, resource.loading]);
  function goToPage(next) {
    if (next < 1 || next > count || next === page) return;
    shouldFocus.current = true;
    setPage(next);
  }
  const pages =
    count <= 7
      ? Array.from({ length: count }, (_, i) => i + 1)
      : [...new Set([1, page - 1, page, page + 1, count])]
          .filter((value) => value >= 1 && value <= count)
          .sort((a, b) => a - b);
  return (
    <section
      id="tin-tuc"
      className="section container"
      aria-labelledby="news-title"
    >
      <div className="section-head">
        <SectionHeading
          id="tin-tuc"
          title="Chuyện ở 90s & Tam Đảo."
          subtitle="TIN TỨC"
          description="Câu chuyện từ 90s và những trải nghiệm ở Tam Đảo."
          titleId="news-title"
        />
      </div>
      <div
        id="news-tabs"
        className="filters"
        role="group"
        aria-label="Chủ đề tin tức"
      >
        {[
          ["90s", "Về 90s"],
          ["tam-dao", "Về Tam Đảo"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={`filter ${category === value ? "active" : ""}`}
            data-category={value}
            aria-pressed={category === value}
            onClick={() => {
              setCategory(value);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <p id="news-status" className="demo-note" aria-live="polite">
        {pagination
          ? `${pagination.total} bài viết · Trang ${pagination.page} / ${Math.max(1, count)}`
          : resource.loading
            ? "Đang tải tin tức…"
            : "Tin tức hiện chưa khả dụng."}
      </p>
      <div id="news-grid" className="news-grid" aria-busy={resource.loading}>
        {resource.loading || resource.error ? (
          <PublicState resource={resource} label="tin tức" />
        ) : displayed.length ? (
          displayed.map((item) => (
            <article key={item.id} className="news-card">
              {assetUrl(item.image) ? (
                <SafeImage
                  src={assetUrl(item.image)}
                  alt={item.title}
                  loading="lazy"
                  width="600"
                  height="400"
                />
              ) : (
                <div className="photo" aria-hidden="true" />
              )}
              <div className="news-copy">
                <time dateTime={item.publishedAt}>
                  Ngày đăng: {displayDate(item.publishedAt)}
                </time>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                {articleTarget(item.href) ? (
                  <a
                    className="text-link"
                    href={articleTarget(item.href)}
                    {...(externalUrl(item.href)
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    Đọc thêm
                  </a>
                ) : (
                  <Link
                    to={"/tin-tuc/" + item.slug}
                    className="text-link"
                    data-news={item.id}
                    aria-label={`Đọc thêm: ${item.title}`}
                  >
                    Đọc thêm
                  </Link>
                )}
              </div>
            </article>
          ))
        ) : (
          <p>Chưa có bài viết trong chuyên mục này.</p>
        )}
      </div>
      {count > 0 && (
        <nav
          id="news-pagination"
          className="pagination"
          aria-label="Phân trang tin tức"
        >
          <button
            className="filter"
            data-page={page - 1}
            disabled={page === 1}
            aria-label="Trang trước"
            onClick={() => goToPage(page - 1)}
          >
            Trước
          </button>
          {pages.map((value, index) => (
            <Fragment key={value}>
              {index > 0 && value > pages[index - 1] + 1 && (
                <span aria-hidden="true">…</span>
              )}
              <button
                ref={value === page ? activePage : null}
                data-page={value}
                className={`filter ${value === page ? "active" : ""}`}
                aria-current={value === page ? "page" : undefined}
                aria-label={`Trang ${value}`}
                onClick={() => goToPage(value)}
              >
                {value}
              </button>
            </Fragment>
          ))}
          <button
            className="filter"
            data-page={page + 1}
            disabled={page === count}
            aria-label="Trang tiếp theo"
            onClick={() => goToPage(page + 1)}
          >
            Sau
          </button>
        </nav>
      )}
    </section>
  );
}
