import React, { useEffect, useState } from "react";
import { getCSRF, announcementsAPI, currentUserChecker } from "../../api";
import styles from "./AnnouncementCard.module.css";

export default function AnnouncementCard() {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", message: "" });
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getCSRF();

        // Try to get user info, but don't block if it fails
        try {
          const userResponse = await currentUserChecker.getCurrentUser();
          setIsStaff(userResponse.data.is_staff || userResponse.data.is_superuser);
        } catch (err) {
          // User not logged in — that's okay
          setIsStaff(false);
        }

        // Always try to get announcements
        const response = await announcementsAPI.getAnnouncements();
        setAnnouncements(response.data);

      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await announcementsAPI.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdd = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) return;
    try {
      await getCSRF();
      const response = await announcementsAPI.createAnnouncement(newAnnouncement);
      setAnnouncements((prev) => [response.data, ...prev]);
      setNewAnnouncement({ title: "", message: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className={styles.announcementSection}>
      <h2 className={styles.announcementTitle}>Latest Announcements</h2>

      {loading && <p className={styles.announcementLoading}>Loading...</p>}
      {error && <p className={styles.announcementError}>Error: {error}</p>}

      {!loading && !error && announcements.length === 0 && (
        <p className={styles.announcementEmpty}>No announcements at the moment. Please check back later.</p>
      )}

      <div className={styles.announcementList}>
        {announcements.map((a) => (
          <div key={a.id} className={styles.announcementCard}>
            <h3>{a.title}</h3>
            <p>{a.message}</p>
            <span className={styles.announcementDate}>{a.date}</span>
            {isStaff && (
              <button className={styles.deleteBtn} onClick={() => handleDelete(a.id)}>
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {isStaff && (
        <div className={styles.announcementForm}>
          <h3>Add New Announcement</h3>
          <input
            type="text"
            placeholder="Title"
            required
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
          />
          <textarea
            placeholder="Message"
            value={newAnnouncement.message}
            required
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
          />
          <button onClick={handleAdd}>Add Announcement</button>
        </div>
      )}
    </section>
  );
}