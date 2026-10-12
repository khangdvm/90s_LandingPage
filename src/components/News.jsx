import { useEffect, useRef, useState } from "react";
import {
  NEWS_DATA,
  NEWS_PAGE_SIZE,
  displayDate,
  assetUrl,
} from "../data/data.js";

export default function News({ onArticle }) {
  const [category, setCategory] = useState("90s");
  const [page, setPage] = useState(1);
  const activePage = useRef(null);
  const shouldFocus = useRef(false);
  const articles = NEWS_DATA.filter((item) => item.category === category);
  const count = Math.ceil(articles.length / NEWS_PAGE_SIZE);
  const displayed = articles.slice(
    (page - 1) * NEWS_PAGE_SIZE,
    page * NEWS_PAGE_SIZE,
  );
  useEffect(() => {
    if (shouldFocus.current) {
      activePage.current?.focus({ preventScroll: true });
      shouldFocus.current = false;
    }
  }, [page]);
  function goToPage(next) {
    if (next < 1 || next > count || next === page) return;
    shouldFocus.current = true;
    setPage(next);
  }
  return (
    <section
      id="tin-tuc"
      className="section container"
      aria-labelledby="news-title"
    >
      <div className="section-head">
        <div>
          <p className="eyebrow red">TIN TỨC</p>
          <h2 id="news-title">Chuyện ở 90s & Tam Đảo.</h2>
          <p className="section-description">
            Nội dung mẫu để duyệt giao diện; bài viết chính thức sẽ được cập
            nhật.
          </p>
        </div>
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
            data-category={value}
            className={`filter ${category === value ? "active" : ""}`}
            aria-pressed={category === value}
            onClick={() => {
              setCategory(value);
              setPage(1);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <p id="news-status" className="demo-note" aria-live="polite">
        {articles.length} bài mẫu · Trang {page} / {Math.max(1, count)}
      </p>
      <div id="news-grid" className="news-grid">
        {displayed.length ? (
          displayed.map((item) => (
            <article key={item.id} className="news-card">
              <img
                src={assetUrl(item.image)}
                alt="Ảnh minh họa Tam Đảo cho bài mẫu"
                loading="lazy"
                width="600"
                height="400"
              />
              <div className="news-copy">
                <time dateTime={item.publishedAt}>
                  Ngày mẫu: {displayDate(item.publishedAt)}
                </time>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                {item.href && item.href !== "#" ? (
                  <a className="text-link" href={item.href}>
                    Đọc thêm
                  </a>
                ) : (
                  <button
                    className="text-link"
                    data-news={item.id}
                    aria-label={`Đọc thêm: ${item.title}`}
                    onClick={() => onArticle(item)}
                  >
                    Đọc thêm
                  </button>
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
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              ref={index + 1 === page ? activePage : null}
              data-page={index + 1}
              className={`filter ${index + 1 === page ? "active" : ""}`}
              aria-current={index + 1 === page ? "page" : undefined}
              aria-label={`Trang ${index + 1}`}
              onClick={() => goToPage(index + 1)}
            >
              {index + 1}
            </button>
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
