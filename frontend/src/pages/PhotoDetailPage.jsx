import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest, buildImageUrl } from "../api";
import { useAuth } from "../auth.jsx";

export default function PhotoDetailPage() {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadPhoto = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/api/photos/${photoId}`, { method: "GET" }, token);
      setPhoto(data);
      setFormData({ title: data.title, description: data.description || "" });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhoto();
  }, [photoId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updated = await apiRequest(
        `/api/photos/${photoId}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
        },
        token
      );
      setPhoto(updated);
      setMessage("Cập nhật ảnh thành công.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa ảnh này?");
    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/api/photos/${photoId}`, { method: "DELETE" }, token);
      navigate("/gallery");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  if (loading) {
    return <div className="panel empty-state">Đang tải chi tiết ảnh...</div>;
  }

  if (!photo) {
    return (
      <div className="panel empty-state">
        Không thể tải ảnh. <Link to="/gallery">Quay lại gallery</Link>
      </div>
    );
  }

  return (
    <section className="detail-layout">
      <div className="panel image-panel">
        <img src={buildImageUrl(photo.image_url)} alt={photo.title} className="detail-image" />
      </div>

      <div className="panel detail-panel">
        <p className="eyebrow">Photo Detail</p>
        <h1>{photo.title}</h1>
        <p className="meta-text">Uploaded at: {new Date(photo.uploaded_at).toLocaleString()}</p>

        <form className="detail-form" onSubmit={handleSave}>
          <label>
            Tiêu đề
            <input name="title" type="text" value={formData.title} onChange={handleChange} required />
          </label>
          <label>
            Mô tả
            <textarea
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
            />
          </label>
          {message ? <div className="alert success">{message}</div> : null}
          {error ? <div className="alert error">{error}</div> : null}
          <div className="card-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button type="button" className="danger-button" onClick={handleDelete}>
              Xóa ảnh
            </button>
            <Link className="secondary-button" to="/gallery">
              Quay lại
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
