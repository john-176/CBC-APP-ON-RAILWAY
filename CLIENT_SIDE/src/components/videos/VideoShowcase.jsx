import React, { useEffect, useState, useRef } from "react";
import { videoshowcaseAPI } from "../../api";
import styles from "./VideoShowcase.module.css"; // ✅ CSS module
import { useAuth } from "../../AuthContext"; // ✅ Add this


export default function VideoShowcase() {
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const totalPages = Math.ceil(videos.length / itemsPerPage);
  const paginatedVideos = videos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const containerRef = useRef();

  const { user } = useAuth();
  const isStaff = user?.is_staff || user?.is_superuser;

useEffect(() => {
  const fetchData = async () => {
    try {
      const videoRes = await videoshowcaseAPI.getVideos();
      setVideos(videoRes.data);
    } catch (err) {
      setError("Failed to load videos: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!validTypes.includes(file.type)) {
      setError("Only MP4, WebM, or OGG formats allowed");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File size must be under 50MB");
      return;
    }

    setNewVideo(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!newVideo || !videoTitle.trim()) {
      setError("Video and title are required");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("video_file", newVideo);
      formData.append("title", videoTitle);

      const res = await videoshowcaseAPI.createVideo(formData);
      setVideos([...videos, res.data]);
      setNewVideo(null);
      setVideoTitle("");
    } catch (err) {
      setError("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      setDeletingId(id);
      await videoshowcaseAPI.deleteVideo(id);
      const updated = videos.filter((v) => v.id !== id);
      setVideos(updated);
      const updatedPages = Math.ceil(updated.length / itemsPerPage);
      if (currentPage > updatedPages) {
        setCurrentPage(updatedPages);
      }
    } catch (err) {
      setError("Delete failed: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div>Loading videos...</div>;

  return (
    <section className={styles.videoShowcase} ref={containerRef}>
      <h2 className={styles.title}>School Videos</h2>

      {error && (
        <div className={styles.error} onClick={() => setError(null)}>
          {error}
        </div>
      )}

      <div className={styles.videoGrid}>
        {paginatedVideos.map((video) => (
          <div key={video.id} className={styles.videoCard}>
            <div className={styles.videoPlayer}>
              <video controls width="100%">
                <source src={video.url} type={`video/${video.format || "mp4"}`} />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className={styles.videoMeta}>
              <h3>{video.title || "Untitled Video"}</h3>
              {isStaff && (
                <button
                  onClick={() => handleDelete(video.id)}
                  disabled={deletingId === video.id}
                >
                  {deletingId === video.id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationWrapper}>
          <div className={styles.pageControls}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={styles.pageButton}
            >
              ⬅ Prev
            </button>

            <span className={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={styles.pageButton}
            >
              Next ➡
            </button>
          </div>
        </div>
      )}

      {isStaff && (
        <div className={styles.uploadControls}>
          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Enter video title"
            disabled={uploading}
          />

          <label className={styles.fileInputLabel}>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
              disabled={uploading}
            />
            Select Video
          </label>

          <button
            onClick={handleUpload}
            disabled={uploading || !videoTitle.trim() || !newVideo}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>

          {newVideo && (
            <span className={styles.fileInfo}>
              {newVideo.name} ({Math.round(newVideo.size / 1024 / 1024)}MB)
            </span>
          )}
        </div>
      )}
    </section>
  );
}
