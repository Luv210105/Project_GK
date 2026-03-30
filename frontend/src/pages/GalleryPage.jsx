import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, buildImageUrl } from "../api";
import { useAuth } from "../auth.jsx";

const emptyForm = { title: "", description: "", image: null };

export default function GalleryPage() {
  const { token, logout } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [search, setSearch] = useState("");
  const [uploadForm, setUploadForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const deferredSearch = useDeferredValue(search);

  const loadPhotos = async () => {
    setLoading(true);
    setError("");

    try {
      const query = deferredSearch.trim() ? `?q=${encodeURIComponent(deferredSearch.trim())}` : "";
      const data = await apiRequest(`/api/photos${query}`, { method: "GET" }, token);
      setPhotos(data);
    } catch (loadError) {
      if (loadError.message.toLowerCase().includes("đăng nhập")) {
        logout();
      }
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [deferredSearch]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setUploadForm((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setUploadForm((current) => ({ ...current, image: file }));
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("title", uploadForm.title);
      formData.append("description", uploadForm.description);
      formData.append("image", uploadForm.image);

      await apiRequest("/api/photos", { method: "POST", body: formData }, token);
      setUploadForm(emptyForm);
      setMessage("Upload ảnh thành công.");
      await loadPhotos();
      event.target.reset();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa ảnh này?");
    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await apiRequest(`/api/photos/${photoId}`, { method: "DELETE" }, token);
      setMessage("Xóa ảnh thành công.");
      await loadPhotos();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <section className="gallery-layout">
      <div className="panel upload-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Upload</p>
            <h1>Bộ sưu tập của bạn</h1>
          </div>
          <div className="search-box">
            <input
              type="search"
              placeholder="Tìm theo tên ảnh..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <form className="upload-form" onSubmit={handleUpload}>
          <label>
            Tiêu đề ảnh
            <input
              type="text"
              name="title"
              value={uploadForm.title}
              onChange={handleFieldChange}
              required
            />
          </label>
          <label>
            Mô tả
            <textarea
              name="description"
              rows="3"
              value={uploadForm.description}
              onChange={handleFieldChange}
            />
          </label>
          <label>
            File ảnh
            <input type="file" accept="image/*" onChange={handleFileChange} required />
          </label>
          <button type="submit" className="primary-button" disabled={uploading}>
            {uploading ? "Đang upload..." : "Upload ảnh"}
          </button>
        </form>

        {message ? <div className="alert success">{message}</div> : null}
        {error ? <div className="alert error">{error}</div> : null}
      </div>

      <div className="gallery-section">
        {loading ? (
          <div className="panel empty-state">Đang tải danh sách ảnh...</div>
        ) : photos.length === 0 ? (
          <div className="panel empty-state">Chưa có ảnh nào phù hợp. Hãy upload ảnh đầu tiên của bạn.</div>
        ) : (
          <div className="photo-grid">
            {photos.map((photo) => (
              <article key={photo.id} className="photo-card">
                <img src={buildImageUrl(photo.image_url)} alt={photo.title} className="photo-thumb" />
                <div className="photo-card-body">
                  <h3>{photo.title}</h3>
                  <p>{photo.description || "Chưa có mô tả."}</p>
                  <div className="card-actions">
                    <Link className="secondary-button" to={`/photos/${photo.id}`}>
                      Xem chi tiết
                    </Link>
                    <button className="danger-button" type="button" onClick={() => handleDelete(photo.id)}>
                      Xóa
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
