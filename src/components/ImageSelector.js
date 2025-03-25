import { useEffect, useState } from "react";
import { fetchImages, updateImageStatus } from "../utils/axios";
import { useSwipeable } from "react-swipeable";
import styles from "../styles/ImageSelector.module.css";

const ImageSelector = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showSelectionFeedback, setShowSelectionFeedback] = useState(false);
  const [selectionStatus, setSelectionStatus] = useState(null);
  const [mode, setMode] = useState('preview'); // 'preview' or 'selection'
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [userIdentity, setUserIdentity] = useState('');
  const [projectId, setProjectId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user identity and project ID are set
    const storedIdentity = localStorage.getItem('updated_by');
    const storedProjectId = localStorage.getItem('project_id');
    if (!storedIdentity || !storedProjectId) {
      setShowIdentityModal(true);
    } else {
      loadImages();
    }
  }, []);

  const handleIdentitySubmit = (e) => {
    e.preventDefault();
    if (userIdentity.trim() && projectId.trim()) {
      localStorage.setItem('updated_by', userIdentity.trim());
      localStorage.setItem('project_id', projectId.trim());
      setShowIdentityModal(false);
      loadImages();
    }
  };

  const loadImages = async () => {
    setLoading(true);
    try {
      const storedProjectId = localStorage.getItem('project_id');
      const res = await fetchImages("all", storedProjectId);
      if (res.data) {
        setImages(res.data);
      }
    } catch (err) {
      console.error("Error fetching images", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = async (status) => {
    if (images.length === 0) return;
    
    setSelectionStatus(status);
    setShowSelectionFeedback(true);
    
    try {
      // Add a small delay to show the feedback
      setTimeout(async () => {
        const storedProjectId = localStorage.getItem('project_id');
        await updateImageStatus(images[currentIndex].id, status, storedProjectId);
        setCurrentIndex((prev) => (prev + 1 < images.length ? prev + 1 : 0));
        setShowSelectionFeedback(false);
        setSelectionStatus(null);
      }, 500);
    } catch (err) {
      setError(err.message);
      setShowSelectionFeedback(false);
      setSelectionStatus(null);
    }
  };

  const handlePreview = (direction) => {
    setSwipeDirection(direction);
    if (direction === 'next') {
      setCurrentIndex((prev) => (prev + 1 < images.length ? prev + 1 : 0));
    } else {
      setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : images.length - 1));
    }
    // Reset swipe direction after animation
    setTimeout(() => setSwipeDirection(null), 300);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handlePreview('next'),
    onSwipedRight: () => handlePreview('prev'),
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'selected':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (showIdentityModal) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card shadow-lg rounded-4 p-4" style={{ maxWidth: '400px', width: '100%' }}>
          <h3 className="text-center mb-4">Set Your Identity</h3>
          <form onSubmit={handleIdentitySubmit}>
            <div className="mb-3">
              <label htmlFor="userIdentity" className="form-label">Your Name</label>
              <input
                type="text"
                className="form-control"
                id="userIdentity"
                value={userIdentity}
                onChange={(e) => setUserIdentity(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="projectId" className="form-label">Project ID</label>
              <input
                type="text"
                className="form-control"
                id="projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="Enter project ID"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="text-muted">Loading images...</p>
      </div>
    </div>
  );

  if (images.length === 0) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <i className="bi bi-images text-muted" style={{ fontSize: '3rem' }}></i>
        <p className="text-muted mt-3">No images available.</p>
      </div>
    </div>
  );

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert" style={{ maxWidth: '400px', width: '100%' }}>
          {error}
        </div>
      )}

      {/* Mode Selection */}
      <div className="mb-4">
        <div className="btn-group" role="group">
          <button
            className={`btn ${mode === 'preview' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setMode('preview')}
          >
            Preview Mode
          </button>
          <button
            className={`btn ${mode === 'selection' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setMode('selection')}
          >
            Selection Mode
          </button>
        </div>
      </div>

      {/* Card Container */}
      <div 
        className="card shadow-lg rounded-4 position-relative overflow-hidden"
        style={{ 
          width: "400px",
        }}
      >
        {/* Navigation Arrows */}
        <button
          className={`btn btn-light position-absolute top-50 start-0 translate-middle-y rounded-circle p-3 shadow-sm opacity-75 ${styles['hover-opacity-100']}`}
          onClick={() => handlePreview('prev')}
          style={{ zIndex: 1 }}
        >
          <i className="bi bi-chevron-left fs-4"></i>
        </button>
        <button
          className={`btn btn-light position-absolute top-50 end-0 translate-middle-y rounded-circle p-3 shadow-sm opacity-75 ${styles['hover-opacity-100']}`}
          onClick={() => handlePreview('next')}
          style={{ zIndex: 1 }}
        >
          <i className="bi bi-chevron-right fs-4"></i>
        </button>
        
        {/* Image Display */}
        <div 
          {...swipeHandlers}
          className={`position-relative ${styles['image-container']} ${styles['transition-all']} ${
            swipeDirection ? styles[`slide-${swipeDirection}`] : ''
          } ${showSelectionFeedback ? styles[`selection-${selectionStatus}`] : ''}`}
          style={{ height: "500px" }}
        >
          <img
            src={images[currentIndex]?.url}
            alt="Photograph"
            className="w-100 h-100 object-fit-cover"
          />
          {showSelectionFeedback && (
            <div className={`${styles['selection-overlay']} ${styles[selectionStatus]}`}>
              <i className={`bi bi-${selectionStatus === 'selected' ? 'check-circle' : 'x-circle'} display-1`}></i>
            </div>
          )}
        </div>

        {/* Image Info */}
        <div className="card-body text-center py-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="badge bg-primary rounded-pill px-3 py-2">
              Image {currentIndex + 1} of {images.length}
            </span>
            <span className={`badge bg-${getStatusColor(images[currentIndex]?.status)} rounded-pill px-3 py-2`}>
              {images[currentIndex]?.status || 'Pending'}
            </span>
          </div>
          <p className="text-muted mb-0">
            {mode === 'preview' ? 'Swipe left/right to preview images' : 'Select or reject the image'}
          </p>
        </div>

        {/* Action Buttons - Only show in selection mode */}
        {mode === 'selection' && (
          <div className="d-flex justify-content-around py-3">
            <button 
              className="btn btn-light border rounded-circle p-3"
              onClick={() => handleSelection("rejected")}
            >
              ❌
            </button>
            <button 
              className="btn btn-light rounded-circle p-3"
              onClick={() => handleSelection("selected")}
            >
              ✅
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-4" style={{ width: "400px" }}>
        <div className="progress" style={{ height: "4px" }}>
          <div 
            className="progress-bar bg-primary" 
            role="progressbar" 
            style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ImageSelector;
