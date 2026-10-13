import { Link, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ResourcePage from "./pages/ResourcePage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import "./styles/admin.css";
export default function AdminRoutes() {
  return (
    <div className="admin-app">
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            {["rooms", "hero", "news", "content"].map((resource) => (
              <Route
                key={resource}
                path={resource}
                element={<ResourcePage key={resource} resource={resource} />}
              />
            ))}
            <Route path="settings" element={<SettingsPage />} />
            <Route
              path="*"
              element={
                <section className="cms-panel">
                  <h1>Không tìm thấy trang</h1>
                  <Link className="cms-button cms-primary" to="/admin">
                    Về Dashboard
                  </Link>
                </section>
              }
            />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}
