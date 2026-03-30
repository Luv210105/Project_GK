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
        <p className="eyebrow">De B</p>
        <h1>Dang nhap de quan ly album va danh dau anh yeu thich.</h1>
        <p className="muted-text login-description">
          Ung dung ho tro album, bo loc theo album, danh sach yeu thich, upload anh va sua thong tin anh.
        </p>
        <div className="info-pill">Tai khoan seed: alice / 123456 hoac bob / 123456</div>
      </div>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <label>
          Username hoac Email
          <input
            name="login"
            type="text"
            placeholder="alice hoac alice@example.com"
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
            placeholder="Nhap mat khau"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        {error ? <div className="alert error">{error}</div> : null}
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Dang dang nhap..." : "Dang nhap"}
        </button>
        <p className="switch-link">
          Chua co tai khoan? <Link to="/register">Dang ky ngay</Link>
        </p>
      </form>
    </section>
  );
}
