import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../auth.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      login(data);
      navigate(location.state?.from || "/gallery", { replace: true });
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="hero-card">
        <p className="eyebrow">Gallery Demo</p>
        <h1>Đăng nhập để quản lý bộ sưu tập ảnh cá nhân.</h1>
        <p className="muted-text login-description">
          Ứng dụng hỗ trợ upload ảnh, xem danh sách, xem chi tiết, chỉnh sửa, xóa và tìm kiếm theo tên.
        </p>
        <div className="info-pill">Tài khoản demo sau khi seed: demo / demo123</div>
      </div>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <label>
          Username hoặc Email
          <input
            name="login"
            type="text"
            placeholder="demo hoặc demo@example.com"
            value={formData.login}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        {error ? <div className="alert error">{error}</div> : null}
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <p className="switch-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </form>
    </section>
  );
}

