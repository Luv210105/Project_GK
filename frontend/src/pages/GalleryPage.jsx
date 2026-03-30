import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, buildDownloadFilename, buildImageUrl, downloadImage } from "../api";
import { useAuth } from "../auth.jsx";

const emptyForm = { title: "", description: "", image: null };

export default function GalleryPage() {
  const { token, logout } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState("uploaded");
  const [uploadForm, setUploadForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingPhotoId, setDownloadingPhotoId] = useState(null);
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
      if (loadError.message.toLowerCase().includes("dang nhap")) {
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
      setMessage("Upload anh thanh cong.");
      await loadPhotos();
      event.target.reset();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId) => {
    const confirmed = window.confirm("Ban co chac muon xoa anh nay?");
    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await apiRequest(`/api/photos/${photoId}`, { method: "DELETE" }, token);
      setMessage("Xoa anh thanh cong.");
      await loadPhotos();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const handleDownload = async (photo) => {
    setError("");
    setMessage("");
    setDownloadingPhotoId(photo.id);

    try {
      await downloadImage(photo.image_url, buildDownloadFilename(photo.title, photo.image_url));
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setDownloadingPhotoId(null);
    }
  };

  const visiblePhotos = [...photos].sort((firstPhoto, secondPhoto) => {
    if (sortMode === "alphabetical") {
      return firstPhoto.title.localeCompare(secondPhoto.title, undefined, { sensitivity: "base" });
    }

    return new Date(secondPhoto.uploaded_at).getTime() - new Date(firstPhoto.uploaded_at).getTime();
  });

  return (
    <section className="gallery-layout">
      <div className="panel upload-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Upload</p>
            <h1>Bo suu tap cua ban</h1>
          </div>
          <div className="gallery-toolbar">
            <div className="search-box">
              <input
                type="search"
                placeholder="Tim theo ten anh..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <label className="sort-box">
              <span>Sap xep</span>
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                <option value="uploaded">Theo thu tu upload</option>
                <option value="alphabetical">Ten A-Z</option>
              </select>
            </label>
          </div>
        </div>

        <form className="upload-form" onSubmit={handleUpload}>
          <label>
            Tieu de anh
            <input
              type="text"
              name="title"
              value={uploadForm.title}
              onChange={handleFieldChange}
              required
            />
          </label>
          <label>
            Mo ta
            <textarea
              name="description"
              rows="3"
              value={uploadForm.description}
              onChange={handleFieldChange}
            />
          </label>
          <label>
            File anh
            <input type="file" accept="image/*" onChange={handleFileChange} required />
          </label>
          <button type="submit" className="primary-button" disabled={uploading}>
            {uploading ? "Dang upload..." : "Upload anh"}
          </button>
        </form>

        {message ? <div className="alert success">{message}</div> : null}
        {error ? <div className="alert error">{error}</div> : null}
      </div>

      <div className="gallery-section">
        {loading ? (
          <div className="panel empty-state">Dang tai danh sach anh...</div>
        ) : visiblePhotos.length === 0 ? (
          <div className="panel empty-state">Chua co anh nao phu hop. Hay upload anh dau tien cua ban.</div>
        ) : (
          <div className="photo-grid">
            {visiblePhotos.map((photo) => (
              <article key={photo.id} className="photo-card">
                <img src={buildImageUrl(photo.image_url)} alt={photo.title} className="photo-thumb" />
                <div className="photo-card-body">
                  <h3>{photo.title}</h3>
                  <p>{photo.description || "Chua co mo ta."}</p>
                  <p className="meta-text">Upload: {new Date(photo.uploaded_at).toLocaleString()}</p>
                  <div className="card-actions">
                    <Link className="secondary-button" to={`/photos/${photo.id}`}>
                      Xem chi tiet
                    </Link>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => handleDownload(photo)}
                      disabled={downloadingPhotoId === photo.id}
                    >
                      {downloadingPhotoId === photo.id ? "Dang tai..." : "Download"}
                    </button>
                    <button className="danger-button" type="button" onClick={() => handleDelete(photo.id)}>
                      Xoa
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
