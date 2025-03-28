import { useEffect, useState, useCallback } from "react";
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
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [imageCache, setImageCache] = useState(new Map());
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Function to preload images with loading states
  const preloadImages = useCallback((startIndex, count = 3) => {
    for (let i = 0; i < count; i++) {
      const index = (startIndex + i) % images.length;
      if (images[index]) {
        setImageLoadingStates(prev => ({ ...prev, [index]: true }));
        const img = new Image();
        img.onload = () => {
          setImageLoadingStates(prev => ({ ...prev, [index]: false }));
          setImageCache(prev => new Map(prev).set(index, img.src));
        };
        img.src = images[index].url;
      }
    }
  }, [images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePreview('prev');
      } else if (e.key === 'ArrowRight') {
        handlePreview('next');
      } else if (e.key === ' ' && mode === 'selection') {
        handleSelection('selected');
      } else if (e.key === 'Escape' && mode === 'selection') {
        handleSelection('rejected');
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullScreen();
      } else if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [mode, isFullScreen]);

  useEffect(() => {
    if (images.length > 0) {
      preloadImages(currentIndex + 1);
    }
  }, [currentIndex, images, preloadImages]);

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

  const handlePreview = useCallback((direction) => {
    setSwipeDirection(direction);
    if (direction === 'next') {
      setCurrentIndex((prev) => (prev + 1 < images.length ? prev + 1 : 0));
    } else {
      setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : images.length - 1));
    }
    setTimeout(() => setSwipeDirection(null), 300);
  }, [images.length]);

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

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
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
    <div className={`d-flex flex-column align-items-center justify-content-center py-4 py-md-5 bg-light ${isFullScreen ? styles['fullscreen'] : ''}`}>
      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert" style={{ maxWidth: '400px', width: '100%' }}>
          {error}
        </div>
      )}

      {/* Mode Selection */}
      {!isFullScreen && (
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
      )}

      {/* Card Container */}
      <div 
        className={`card shadow-lg rounded-4 position-relative overflow-hidden ${isFullScreen ? styles['fullscreen-card'] : ''}`}
        style={{ 
          width: "100%",
          maxWidth: isFullScreen ? "100%" : "400px",
          margin: "0 auto"
        }}
      >
        {/* Navigation Arrows */}
        <button
          className={`btn btn-light position-absolute top-50 start-0 translate-middle-y rounded-circle p-2 p-md-3 shadow-sm opacity-75 ${styles['hover-opacity-100']}`}
          onClick={() => handlePreview('prev')}
          style={{ zIndex: 1 }}
        >
          <i className="bi bi-chevron-left fs-5 fs-md-4"></i>
        </button>
        <button
          className={`btn btn-light position-absolute top-50 end-0 translate-middle-y rounded-circle p-2 p-md-3 shadow-sm opacity-75 ${styles['hover-opacity-100']}`}
          onClick={() => handlePreview('next')}
          style={{ zIndex: 1 }}
        >
          <i className="bi bi-chevron-right fs-5 fs-md-4"></i>
        </button>

        {/* Fullscreen Toggle Button */}
        <button
          className={`btn btn-light position-absolute top-0 end-0 m-3 rounded-circle p-2 shadow-sm opacity-75 ${styles['hover-opacity-100']}`}
          onClick={toggleFullScreen}
          style={{ zIndex: 1 }}
        >
          <i className={`bi bi-${isFullScreen ? 'fullscreen-exit' : 'fullscreen'} fs-5`}></i>
        </button>
        
        {/* Image Display */}
        <div 
          {...swipeHandlers}
          className={`position-relative ${styles['image-container']} ${styles['transition-all']} ${
            swipeDirection ? styles[`slide-${swipeDirection}`] : ''
          } ${showSelectionFeedback ? styles[`selection-${selectionStatus}`] : ''}`}
          style={{ height: isFullScreen ? "calc(100vh - 2rem)" : "500px" }}
        >
          {imageLoadingStates[currentIndex] ? (
            <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <img
              src={imageCache.get(currentIndex) || images[currentIndex]?.url}
              alt="Photograph"
              className="w-100 h-100 object-fit-contain"
              loading="eager"
            />
          )}
          {showSelectionFeedback && (
            <div className={`${styles['selection-overlay']} ${styles[selectionStatus]}`}>
              <i className={`bi bi-${selectionStatus === 'selected' ? 'check-circle' : 'x-circle'} display-4 display-md-1`}></i>
            </div>
          )}
        </div>

        {/* Image Info - Only show when not in fullscreen */}
        {!isFullScreen && (
          <div className="card-body text-center py-2 py-md-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="badge bg-primary rounded-pill px-2 px-md-3 py-2">
                Image {currentIndex + 1} of {images.length}
              </span>
              <span className={`badge bg-${getStatusColor(images[currentIndex]?.status)} rounded-pill px-2 px-md-3 py-2`}>
                {images[currentIndex]?.status || 'Pending'}
              </span>
            </div>
            <p className="text-muted mb-0 small">
              {mode === 'preview' ? (
                <>
                  Swipe left/right to preview images
                  <br />
                  <span className="text-muted">Use arrow keys to navigate</span>
                </>
              ) : (
                <>
                  Select or reject the image
                  <br />
                  <span className="text-muted">Space to select, Esc to reject</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Action Buttons - Only show in selection mode and not in fullscreen */}
        {mode === 'selection' && !isFullScreen && (
          <div className="d-flex justify-content-around py-2 py-md-3">
            <button 
              className="btn btn-light border rounded-circle p-2 p-md-3"
              onClick={() => handleSelection("rejected")}
            >
              ❌
            </button>
            <button 
              className="btn btn-light rounded-circle p-2 p-md-3"
              onClick={() => handleSelection("selected")}
            >
              ✅
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar - Only show when not in fullscreen */}
      {!isFullScreen && (
        <div className="mt-4" style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
          <div className="progress" style={{ height: "4px" }}>
            <div 
              className="progress-bar bg-primary" 
              role="progressbar" 
              style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;
