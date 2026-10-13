import { useEffect, useRef } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { clearSession } from "../auth/auth.js";
const navigation = [
  ["/admin", "Dashboard"],
  ["/admin/rooms", "Phòng nghỉ"],
  ["/admin/hero", "Hero / Slider"],
  ["/admin/news", "Tin tức"],
  ["/admin/content", "Nội dung"],
  ["/admin/settings", "Cài đặt"],
];
export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const heading = useRef(null);
  const title =
    navigation.find(([path]) => path === pathname)?.[1] || "Quản trị";
  useEffect(() => {
    document.title = `${title} · Quản trị 90s`;
    heading.current?.focus();
  }, [pathname, title]);
  return (
    <div className="cms-layout">
      <a className="cms-skip" href="#cms-main">
        Đến nội dung quản trị
      </a>
      <aside className="cms-sidebar">
        <Link className="cms-brand" to="/admin">
          <span className="cms-logo">90s</span>
          <span>
            Homestay<small>QUẢN TRỊ NỘI DUNG</small>
          </span>
        </Link>
        <nav aria-label="Điều hướng quản trị">
          {navigation.map(([path, label], index) => (
            <NavLink key={path} to={path} end={path === "/admin"}>
              <span aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="cms-sidebar-footer">
          <Link to="/">Xem website ↗</Link>
          <button
            type="button"
            onClick={() => {
              clearSession();
              navigate("/admin/login", { replace: true });
            }}
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <div className="cms-workspace">
        <header className="cms-topbar">
          <p>90s Homestay · Tam Đảo</p>
          <span>CMS</span>
        </header>
        <main id="cms-main" className="cms-main" ref={heading} tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="cms-footer">
          Quản lý nội dung · Tư vấn qua Zalo, Facebook và Hotline
        </footer>
      </div>
    </div>
  );
}
