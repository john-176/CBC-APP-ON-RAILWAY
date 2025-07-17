import { useState, useEffect } from 'react';
import { getCSRF, achieversAPI, currentUserChecker } from '../../api';
import styles from './Achievers.module.css';

const AchieversComponent = () => {
  const [achievers, setAchievers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAchievers, setCurrentAchievers] = useState(null);
  const [isStaff, setIsStaff] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    image: null,
    years_active: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getCSRF();
        try {
          const userResponse = await currentUserChecker.getCurrentUser();
          setIsStaff(userResponse.data.is_staff || userResponse.data.is_superuser);
        } catch {
          setIsStaff(false);
        }

        const response = await achieversAPI.getAchievers();
        setAchievers(response.data.results || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      let response;
      if (currentAchievers) {
        response = await achieversAPI.updateAchiever(currentAchievers.id, formDataToSend);
        setAchievers(achievers.map(f => f.id === currentAchievers.id ? response.data : f));
      } else {
        response = await achieversAPI.createAchiever(formDataToSend);
        setAchievers([...achievers, response.data]);
      }

      setFormData({ name: '', title: '', bio: '', image: null, years_active: '' });
      setCurrentAchievers(null);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data || err.message);
    }
  };

  const handleEdit = (Achievers) => {
    setCurrentAchievers(Achievers);
    setFormData({
      name: Achievers.name,
      title: Achievers.title,
      bio: Achievers.bio,
      image: null,
      years_active: Achievers.years_active
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await achieversAPI.deleteAchiever(id);
      const updatedAchievers = achievers.filter(Achievers => Achievers.id !== id);
      setAchievers(updatedAchievers);

      const totalPages = Math.ceil(updatedAchievers.length / itemsPerPage);
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentAchievers(null);
    setFormData({ name: '', title: '', bio: '', image: null, years_active: '' });
  };

  const totalPages = Math.ceil(achievers.length / itemsPerPage);
  const paginatedAchievers = achievers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className={styles.loading}>Loading achievers...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.achieversContainer}>
      <h2 className={styles.title}>Achievers</h2>

      <div className={styles.achieversGrid}>
        {paginatedAchievers.map(Achievers => (
          <div key={Achievers.id} className={styles.AchieversCard}>
            {Achievers.image && (
              <img
                src={Achievers.image}
                alt={Achievers.name}
                className={styles.AchieversImage}
              />
            )}
            <h3>{Achievers.name}</h3>
            <p className={styles.AchieversTitle}>{Achievers.title}</p>
            <p className={styles.AchieversYears}>{Achievers.years_active}</p>
            <p className={styles.AchieversBio}>{Achievers.bio}</p>

            {isStaff && (
              <div className={styles.AchieversActions}>
                <button onClick={() => handleEdit(Achievers)} className={styles.editButton}>Edit</button>
                <button onClick={() => handleDelete(Achievers.id)} className={styles.deleteButton}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ✅ Pagination Controls */}
      <div className={styles.paginationWrapper}>
        <div className={styles.pageControls}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            ⬅ Prev
          </button>

          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={() =>
              setCurrentPage(prev => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            Next ➡
          </button>
        </div>
      </div>

      {isStaff && (
        <div className={styles.AchieversFormContainer}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={styles.toggleFormButton}
          >
            {isEditing ? 'Cancel' : 'Add New Achievers'}
          </button>

          {isEditing && (
            <form onSubmit={handleSubmit} className={styles.AchieversForm}>
              <h3>{currentAchievers ? 'Edit Achievers' : 'Add New Achievers'}</h3>

              <div className={styles.formGroup}>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Title:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Bio:</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Years Active:</label>
                <input
                  type="text"
                  name="years_active"
                  value={formData.years_active}
                  onChange={handleInputChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  {currentAchievers ? 'Update' : 'Add'} Achievers
                </button>
                {currentAchievers && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AchieversComponent;
