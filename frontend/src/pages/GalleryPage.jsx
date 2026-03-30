import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, buildDownloadFilename, buildImageUrl, downloadImage } from "../api";
import { useAuth } from "../auth.jsx";

const emptyUploadForm = { title: "", description: "", album_id: "", image: null };
const emptyAlbumForm = { name: "", description: "" };

export default function GalleryPage() {
  const { token, logout, user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [viewMode, setViewMode] = useState("all");
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [search, setSearch] = useState("");
  const [uploadForm, setUploadForm] = useState(emptyUploadForm);
  const [albumForm, setAlbumForm] = useState(emptyAlbumForm);
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingAlbum, setSavingAlbum] = useState(false);
  const [processingPhotoId, setProcessingPhotoId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAlbums = async () => {
    const data = await apiRequest("/api/albums", { method: "GET" }, token);
    setAlbums(data);
  };

  const loadPhotos = async (mode = viewMode, albumId = selectedAlbumId, keyword = search) => {
    const params = new URLSearchParams();
    if (keyword.trim()) {
      params.set("q", keyword.trim());
    }
    if (mode === "favorites") {
      params.set("favorites_only", "true");
    }
    if (mode === "album" && albumId) {
      params.set("album_id", String(albumId));
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const data = await apiRequest(`/api/photos${query}`, { method: "GET" }, token);
    setPhotos(data);
  };

  const loadData = async (mode = viewMode, albumId = selectedAlbumId, keyword = search) => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([loadAlbums(), loadPhotos(mode, albumId, keyword)]);
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
    loadData();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadData(viewMode, selectedAlbumId, search);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [viewMode, selectedAlbumId, search]);

  const selectedAlbum = useMemo(
    () => albums.find((album) => album.id === selectedAlbumId) || null,
    [albums, selectedAlbumId]
  );

  const sectionTitle = useMemo(() => {
    if (viewMode === "favorites") {
      return "Anh yeu thich";
    }
    if (viewMode === "album" && selectedAlbum) {
      return `Album: ${selectedAlbum.name}`;
    }
    return "Tat ca anh";
  }, [viewMode, selectedAlbum]);

  const handleUploadFieldChange = (event) => {
    const { name, value } = event.target;
    setUploadForm((current) => ({ ...current, [name]: value }));
  };

  const handleAlbumFieldChange = (event) => {
    const { name, value } = event.target;
    setAlbumForm((current) => ({ ...current, [name]: value }));
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
      if (uploadForm.album_id) {
        formData.append("album_id", uploadForm.album_id);
      }
      formData.append("image", uploadForm.image);

      await apiRequest("/api/photos", { method: "POST", body: formData }, token);
      setUploadForm(emptyUploadForm);
      event.target.reset();
      setMessage("Upload anh thanh cong.");
      await loadData();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  const startEditAlbum = (album) => {
    setEditingAlbumId(album.id);
    setAlbumForm({ name: album.name, description: album.description || "" });
    setMessage("");
    setError("");
  };

  const resetAlbumForm = () => {
    setEditingAlbumId(null);
    setAlbumForm(emptyAlbumForm);
  };

  const handleSaveAlbum = async (event) => {
    event.preventDefault();
    setSavingAlbum(true);
    setError("");
    setMessage("");

    try {
      const path = editingAlbumId ? `/api/albums/${editingAlbumId}` : "/api/albums";
      const method = editingAlbumId ? "PUT" : "POST";
      await apiRequest(path, { method, body: JSON.stringify(albumForm) }, token);
      resetAlbumForm();
      setMessage(editingAlbumId ? "Cap nhat album thanh cong." : "Tao album thanh cong.");
      await loadData();
    } catch (albumError) {
      setError(albumError.message);
    } finally {
      setSavingAlbum(false);
    }
  };

  const handleDeleteAlbum = async (album) => {
    const confirmed = window.confirm(`Xoa album \"${album.name}\"? Anh ben trong se duoc giu lai.`);
    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await apiRequest(`/api/albums/${album.id}`, { method: "DELETE" }, token);
      if (selectedAlbumId === album.id) {
        setViewMode("all");
        setSelectedAlbumId(null);
      }
      resetAlbumForm();
      setMessage("Da xoa album thanh cong.");
      await loadData();
    } catch (albumError) {
      setError(albumError.message);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    const confirmed = window.confirm("Ban co chac muon xoa anh nay?");
    if (!confirmed) {
      return;
    }

    setProcessingPhotoId(photoId);
    setError("");
    setMessage("");

    try {
      await apiRequest(`/api/photos/${photoId}`, { method: "DELETE" }, token);
      setMessage("Da xoa anh thanh cong.");
      await loadData();
    } catch (photoError) {
      setError(photoError.message);
    } finally {
      setProcessingPhotoId(null);
    }
  };

  const handleToggleFavorite = async (photoId) => {
    setProcessingPhotoId(photoId);
    setError("");

    try {
      await apiRequest(`/api/photos/${photoId}/favorite`, { method: "PUT" }, token);
      await loadData();
    } catch (photoError) {
      setError(photoError.message);
    } finally {
      setProcessingPhotoId(null);
    }
  };

  const handleDownload = async (photo) => {
    setProcessingPhotoId(photo.id);
    setError("");

    try {
      await downloadImage(photo.image_url, buildDownloadFilename(photo.title, photo.image_url));
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setProcessingPhotoId(null);
    }
  };

  return (
    <section className="gallery-shell">
      <aside className="panel sidebar-panel">
        <div className="sidebar-block">
          <p className="eyebrow">Xin chao</p>
          <h2>{user?.username || "User"}</h2>
          <p className="muted-text">Quan ly album va danh dau anh yeu thich theo dung de bai.</p>
        </div>

        <div className="sidebar-block">
          <button
            type="button"
            className={`sidebar-link ${viewMode === "all" ? "active" : ""}`}
            onClick={() => {
              setViewMode("all");
              setSelectedAlbumId(null);
            }}
          >
            Tat ca anh
          </button>
          <button
            type="button"
            className={`sidebar-link ${viewMode === "favorites" ? "active" : ""}`}
            onClick={() => {
              setViewMode("favorites");
              setSelectedAlbumId(null);
            }}
          >
            Yeu thich
          </button>
        </div>

        <div className="sidebar-block">
          <div className="sidebar-heading-row">
            <h3>Albums</h3>
            <span>{albums.length}</span>
          </div>
          <div className="album-list">
            {albums.map((album) => (
              <div key={album.id} className="album-row">
                <button
                  type="button"
                  className={`sidebar-link ${viewMode === "album" && selectedAlbumId === album.id ? "active" : ""}`}
                  onClick={() => {
                    setViewMode("album");
                    setSelectedAlbumId(album.id);
                  }}
                >
                  {album.name}
                </button>
                <div className="album-row-actions">
                  <button type="button" className="mini-button" onClick={() => startEditAlbum(album)}>
                    Sua
                  </button>
                  <button type="button" className="mini-button danger" onClick={() => handleDeleteAlbum(album)}>
                    Xoa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form className="album-form" onSubmit={handleSaveAlbum}>
          <div className="sidebar-heading-row">
            <h3>{editingAlbumId ? "Sua album" : "Tao album"}</h3>
            {editingAlbumId ? (
              <button type="button" className="mini-button" onClick={resetAlbumForm}>
                Huy
              </button>
            ) : null}
          </div>
          <input
            name="name"
            type="text"
            placeholder="Ten album"
            value={albumForm.name}
            onChange={handleAlbumFieldChange}
            required
          />
          <textarea
            name="description"
            rows="3"
            placeholder="Mo ta album"
            value={albumForm.description}
            onChange={handleAlbumFieldChange}
          />
          <button type="submit" className="primary-button" disabled={savingAlbum}>
            {savingAlbum ? "Dang luu..." : editingAlbumId ? "Cap nhat album" : "Tao album"}
          </button>
        </form>
      </aside>

      <div className="gallery-main">
        <div className="panel upload-panel">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">Album Gallery</p>
              <h1>{sectionTitle}</h1>
            </div>
            <div className="search-box wide-search">
              <input
                type="search"
                placeholder="Tim theo ten anh..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <form className="upload-form" onSubmit={handleUpload}>
            <label>
              Tieu de anh
              <input name="title" type="text" value={uploadForm.title} onChange={handleUploadFieldChange} required />
            </label>
            <label>
              Mo ta
              <textarea name="description" rows="3" value={uploadForm.description} onChange={handleUploadFieldChange} />
            </label>
            <label>
              Album
              <select name="album_id" value={uploadForm.album_id} onChange={handleUploadFieldChange}>
                <option value="">Khong thuoc album nao</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.name}
                  </option>
                ))}
              </select>
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
            <div className="panel empty-state">Dang tai du lieu...</div>
          ) : photos.length === 0 ? (
            <div className="panel empty-state">Khong co anh nao phu hop voi bo loc hien tai.</div>
          ) : (
            <div className="photo-grid">
              {photos.map((photo) => (
                <article key={photo.id} className="photo-card">
                  <button
                    type="button"
                    className={`favorite-chip ${photo.is_favorite ? "active" : ""}`}
                    onClick={() => handleToggleFavorite(photo.id)}
                    disabled={processingPhotoId === photo.id}
                  >
                    {photo.is_favorite ? "♥" : "♡"}
                  </button>
                  <img src={buildImageUrl(photo.image_url)} alt={photo.title} className="photo-thumb" />
                  <div className="photo-card-body">
                    <div className="photo-header-row">
                      <h3>{photo.title}</h3>
                      <span className="album-badge">
                        {albums.find((album) => album.id === photo.album_id)?.name || "Khong album"}
                      </span>
                    </div>
                    <p>{photo.description || "Chua co mo ta."}</p>
                    <p className="meta-text">Upload: {new Date(photo.uploaded_at).toLocaleString()}</p>
                    <div className="card-actions">
                      <Link className="secondary-button" to={`/photos/${photo.id}`}>
                        Chi tiet
                      </Link>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => handleDownload(photo)}
                        disabled={processingPhotoId === photo.id}
                      >
                        Download
                      </button>
                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        disabled={processingPhotoId === photo.id}
                      >
                        Xoa
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
