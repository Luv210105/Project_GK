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
      setSuccess("Dang ky thanh cong. Ban co the dang nhap ngay bay gio.");
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
        <h1>Tao tai khoan de bat dau quan ly album cua rieng ban.</h1>
        <p className="muted-text">
          Moi nguoi dung chi thay du lieu cua minh. Password duoc hash o backend truoc khi luu vao database.
        </p>
      </div>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <label>
          Username
          <input
            name="username"
            type="text"
            placeholder="It nhat 3 ky tu"
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
            placeholder="It nhat 6 ky tu"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        {error ? <div className="alert error">{error}</div> : null}
        {success ? <div className="alert success">{success}</div> : null}
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Dang tao..." : "Dang ky"}
        </button>
        <p className="switch-link">
          Da co tai khoan? <Link to="/login">Quay lai dang nhap</Link>
        </p>
      </form>
    </section>
  );
}
