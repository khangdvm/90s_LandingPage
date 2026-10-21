import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/adminApi.js";
import { Feedback, LoadingState } from "../components/Feedback.jsx";
const cards = [
  ["rooms", "Phòng nghỉ", "/admin/rooms"],
  ["hero-slides", "Hero slides", "/admin/hero"],
  ["news", "Bài viết", "/admin/news"],
  ["content", "Thẻ nội dung", "/admin/content"],
];
export default function DashboardPage() {
  const [counts, setCounts] = useState(null),
    [error, setError] = useState(""),
    [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    setCounts(null);
    Promise.all(
      cards.map(([api]) =>
        adminApi.list(api, controller.signal, { page: 1, limit: 1 }),
      ),
    )
      .then((data) => setCounts(data.map((x) => x.pagination.total)))
      .catch((error) => {
        if (error.name !== "AbortError") setError(error);
      });
    return () => controller.abort();
  }, [reload]);
  return (
    <>
      <div className="cms-page-heading">
        <div>
          <p className="cms-eyebrow">TỔNG QUAN</p>
          <h1>Dashboard</h1>
          <p className="cms-description">
            Quản lý thông tin và nội dung của 90s Homestay.
          </p>
        </div>
      </div>
      <Feedback error={error} />
      {error && (
        <button
          className="cms-button cms-secondary"
          onClick={() => setReload((x) => x + 1)}
        >
          Thử lại
        </button>
      )}
      {!counts && !error && <LoadingState />}
      {counts && (
        <div className="cms-stats">
          {cards.map(([, label, path], index) => (
            <Link to={path} className="cms-stat" key={path}>
              <span>{label}</span>
              <strong>{counts[index]}</strong>
              <small>Quản lý →</small>
            </Link>
          ))}
        </div>
      )}
      <section className="cms-panel cms-quick">
        <h2>Bắt đầu nhanh</h2>
        <p>Thêm nội dung mới hoặc cập nhật các thông tin hiện có.</p>
        <div className="cms-actions">
          <Link className="cms-button cms-primary" to="/admin/rooms?new=1">
            Thêm phòng
          </Link>
          <Link className="cms-button cms-secondary" to="/admin/hero?new=1">
            Thêm slide
          </Link>
          <Link className="cms-button cms-secondary" to="/admin/news?new=1">
            Viết bài mới
          </Link>
        </div>
      </section>
      <p className="cms-notice">
        Các thay đổi được lưu vào CMS. Website công khai hiển thị nội dung mới
        khi tải lại trang; chỉ nội dung đang bật hoặc đã đăng mới xuất hiện.
      </p>
    </>
  );
}
