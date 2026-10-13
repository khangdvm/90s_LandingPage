import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { adminApi } from "../api/adminApi.js";
import { saveSession, sessionMessage } from "../auth/auth.js";
import { useSessionToken } from "../components/ProtectedRoute.jsx";
import { Feedback } from "../components/Feedback.jsx";
export default function LoginPage() {
  const token = useSessionToken();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    document.title = "Đăng nhập · Quản trị 90s";
  }, []);
  const target =
    location.state?.from?.startsWith("/admin") &&
    !location.state.from.startsWith("/admin/login")
      ? location.state.from
      : "/admin";
  if (token) return <Navigate to={target} replace />;
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await adminApi.login({ email: email.trim(), password });
      saveSession(result.token);
      setPassword("");
      navigate(target, { replace: true });
    } catch (error) {
      setError(error);
      setPassword("");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="cms-login">
      <section className="cms-login-card" aria-labelledby="cms-login-heading">
        <Link className="cms-login-brand" to="/">
          90s<span>Homestay · Tam Đảo</span>
        </Link>
        <p className="cms-eyebrow">QUẢN TRỊ NỘI DUNG</p>
        <h1 id="cms-login-heading">Đăng nhập</h1>
        <p className="cms-description">
          Cập nhật nội dung website trong một nơi.
        </p>
        <Feedback error={error || location.state?.reason || sessionMessage()} />
        <form onSubmit={submit}>
          <div className="cms-field">
            <label htmlFor="cms-email">Email</label>
            <input
              id="cms-email"
              type="email"
              autoComplete="username"
              autoFocus
              maxLength={254}
              required
              value={email}
              disabled={busy}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="cms-field">
            <label htmlFor="cms-password">Mật khẩu</label>
            <input
              id="cms-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              disabled={busy}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            className="cms-button cms-primary cms-login-submit"
            disabled={busy}
          >
            {busy ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>
        <Link className="cms-back-link" to="/">
          ← Về website 90s
        </Link>
      </section>
    </main>
  );
}
