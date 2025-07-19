import React, { useState, useEffect, useRef, useMemo } from "react";
import { getCSRF, showcaseAPI } from "../../api";
import { useAuth } from "../../AuthContext";
import "./Showcase.css";

export default function Showcase() {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalImage, setModalImage] = useState(null);
  const itemsPerPage = 3;
  const containerRef = useRef(null);

  const isStaff = user?.is_staff || user?.is_superuser;

  const totalPages = Math.ceil(images.length / itemsPerPage);
  const paginatedImages = useMemo(() => (
    images.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  ), [images, currentPage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getCSRF();
        const response = await showcaseAPI.getShowcaseImages();
        setImages(response.data);
      } catch (err) {
        setError(err.message || "Failed to load showcase images.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    const elements = containerRef.current?.querySelectorAll(".showcase-item");
    elements?.forEach(el => observer.observe(el));
    return () => elements?.forEach(el => observer.unobserve(el));
  }, [paginatedImages]);

  const handleFileChange = (e) => setNewImage(e.target.files[0]);

  const handleUpload = async () => {
    if (!newImage) return;
    setUploading(true);
    try {
      await getCSRF();
      const formData = new FormData();
      formData.append("image", newImage);
      const response = await showcaseAPI.createShowcaseImage(formData);
      setImages(prev => [...prev, response.data]);
      setNewImage(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await showcaseAPI.deleteShowcaseImage(id);
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading-spinner">Loading images...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <section className="showcase-section" ref={containerRef}>
      <h2 className="section-title">Our School in Action</h2>

      {images.length === 0 && <div className="empty-message">No images uploaded yet.</div>}

      <div className="showcase-grid">
        {paginatedImages.map((image) => (
          <div key={image.id} className="showcase-item">
            <div className="image-container" onClick={() => setModalImage(image.url)} style={{ cursor: 'pointer' }}>
              <img
                src={image.url}
                alt={`Showcase image ${image.id}`}
                loading="lazy"
                className="showcase-image"
              />
              {isStaff && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(image.id);
                  }}
                  className="delete-btn"
                  aria-label="Delete image"
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination-wrapper">
          <div className="page-controls">
            <button
              className="page-button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>

            <span className="page-info">Page {currentPage} of {totalPages}</span>

            <button
              className="page-button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {isStaff && (
        <div className="admin-controls">
          <label className="file-upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            Choose Image
          </label>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!newImage || uploading}
            className="upload-btn"
          >
            {uploading ? "Uploading..." : (newImage ? `Upload ${newImage.name}` : "Select an image first")}
          </button>
        </div>
      )}

      {modalImage && (
        <div className="modal-overlay" onClick={() => setModalImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={modalImage} alt="Enlarged" className="modal-image" />
            <button className="modal-close" onClick={() => setModalImage(null)}>Close</button>
          </div>
        </div>
      )}
    </section>
  );
}
