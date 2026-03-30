import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccess("Đăng ký thành công. Bạn có thể đăng nhập ngay bây giờ.");
      setTimeout(() => navigate("/login"), 900);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="hero-card accent-card">
        <p className="eyebrow">Create Account</p>
        <h1>Tạo tài khoản để bắt đầu lưu trữ ảnh của riêng bạn.</h1>
        <p className="muted-text">
          Mỗi người dùng chỉ nhìn thấy ảnh của chính mình. Password được hash ở backend trước khi lưu.
        </p>
      </div>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <label>
          Username
          <input
            name="username"
            type="text"
            placeholder="Ít nhất 3 ký tự"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            placeholder="Ít nhất 6 ký tự"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        {error ? <div className="alert error">{error}</div> : null}
        {success ? <div className="alert success">{success}</div> : null}
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Đang tạo..." : "Đăng ký"}
        </button>
        <p className="switch-link">
          Đã có tài khoản? <Link to="/login">Quay lại đăng nhập</Link>
        </p>
      </form>
    </section>
  );
}
