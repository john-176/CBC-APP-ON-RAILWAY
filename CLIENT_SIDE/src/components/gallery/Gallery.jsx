import React, { useEffect, useState, useMemo } from 'react';
import { getCSRF, youtubeAPI, currentUserChecker } from '../../api';
import styles from './Gallery.module.css';
import Showcase from '../showcase/Showcase';
import VideoShowcase from '../videos/VideoShowcase';

const extractYouTubeID = (url) => {
  const regExp = /^.*(youtu\.be\/|v=|\/v\/|embed\/|watch\?v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const GalleryComponent = () => {
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const totalPages = Math.ceil(youtubeVideos.length / itemsPerPage);
  const paginatedVideos = useMemo(() => (
    youtubeVideos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  ), [youtubeVideos, currentPage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getCSRF();
        const ytRes = await youtubeAPI.getVideos();
        setYoutubeVideos(ytRes.data);

        try {
          const userRes = await currentUserChecker.getCurrentUser();
          setIsStaff(userRes.data.is_staff || userRes.data.is_superuser);
        } catch {
          setIsStaff(false);
        }
      } catch (err) {
        console.error('Error loading YouTube videos:', err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const videoId = extractYouTubeID(newUrl);
    if (!videoId) return alert('Invalid YouTube link');
    try {
      await youtubeAPI.createVideo({ title: newTitle, url: newUrl });
      const res = await youtubeAPI.getVideos();
      setYoutubeVideos(res.data);
      setNewTitle('');
      setNewUrl('');
      setCurrentPage(totalPages); // Go to last page after adding
    } catch (err) {
      console.error('Failed to add YouTube video:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      await youtubeAPI.deleteVideo(id);
      const res = await youtubeAPI.getVideos();
      setYoutubeVideos(res.data);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className={styles.galleryContainer}>
      <h2 className={styles.title}>Gallery</h2>

      <section className={styles.section}>
        <h3 className={styles.subtitle}>YouTube</h3>

        {!youtubeVideos.length && (
          <p className={styles.noVideos}>No YouTube videos added yet.</p>
        )}

        <div className={styles.youtubeGrid}>
          {paginatedVideos.map((video) => {
            const id = extractYouTubeID(video.url);
            return (
              id && (
                <div key={video.id} className={styles.youtubeCard}>
                  <iframe
                    className={styles.youtubeIframe}
                    src={`https://www.youtube.com/embed/${id}`}
                    title={video.title}
                    allowFullScreen
                  ></iframe>
                  <p className={styles.videoTitle}>{video.title}</p>
                  {isStaff && (
                    <button
                      onClick={() => handleDelete(video.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className={styles.paginationWrapper}>
            <div className={styles.pageControls}>
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {isStaff && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Video Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <input
              type="url"
              placeholder="Paste YouTube Link"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
            />
            <button type="submit" className={styles.addButton}>Add Video</button>
          </form>
        )}
      </section>

      <hr />
      <section className={styles.section}>
        <Showcase />
      </section>

      <hr />
      <section className={styles.section}>
        <VideoShowcase />
      </section>
    </div>
  );
};

export default GalleryComponent;




