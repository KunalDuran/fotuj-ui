import { useEffect, useState } from "react";
import { fetchImages, updateImageStatus } from "../utils/axios";
import { useSwipeable } from "react-swipeable";
import styles from "../styles/ImageSelector.module.css";

const ImageSelector = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showSelectionFeedback, setShowSelectionFeedback] = useState(false);
  const [selectionStatus, setSelectionStatus] = useState(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await fetchImages("pending");
      if (res.data) {
        setImages(res.data);
      }
    } catch (err) {
      console.error("Error fetching images", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = async (status) => {
    if (images.length === 0) return;
    
    setSelectionStatus(status);
    setShowSelectionFeedback(true);
    
    // Add a small delay to show the feedback
    setTimeout(async () => {
      await updateImageStatus(images[currentIndex].id, status);
      setCurrentIndex((prev) => (prev + 1 < images.length ? prev + 1 : 0));
      setShowSelectionFeedback(false);
      setSelectionStatus(null);
    }, 500);
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
    onSwipedLeft: () => isPreviewMode ? handlePreview('next') : handleSelection("rejected"),
    onSwipedRight: () => isPreviewMode ? handlePreview('prev') : handleSelection("selected"),
  });

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
      {/* Mode Toggle */}
      <div className="mb-4">
        <div className="btn-group shadow-sm" role="group">
          <button
            className={`btn ${!isPreviewMode ? 'btn-primary' : 'btn-outline-primary'} px-4`}
            onClick={() => setIsPreviewMode(false)}
          >
            <i className="bi bi-check-circle me-2"></i>Selection Mode
          </button>
          <button
            className={`btn ${isPreviewMode ? 'btn-primary' : 'btn-outline-primary'} px-4`}
            onClick={() => setIsPreviewMode(true)}
          >
            <i className="bi bi-eye me-2"></i>Preview Mode
          </button>
        </div>
      </div>

      {/* Card Container */}
      <div 
        {...swipeHandlers} 
        className={`card shadow-lg rounded-4 position-relative overflow-hidden ${styles['transition-all']} ${
          swipeDirection ? styles[`slide-${swipeDirection}`] : ''
        } ${showSelectionFeedback ? styles[`selection-${selectionStatus}`] : ''}`}
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
        <div className={`position-relative ${styles['image-container']}`} style={{ height: "500px" }}>
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
            <span className="text-muted small">
              {isPreviewMode ? "Preview Mode" : "Selection Mode"}
            </span>
          </div>
          <p className="text-muted mb-0">
            {isPreviewMode 
              ? "Swipe or use arrows to preview images" 
              : "Swipe left to reject, right to select"}
          </p>
        </div>

        {/* Action Buttons - Only show in Selection Mode */}
        {!isPreviewMode && (
          <div className="d-flex justify-content-around py-3 px-4">
            <button 
              className={`btn btn-light border rounded-circle p-4 shadow-sm ${styles['hover-scale']}`}
              onClick={() => handleSelection("rejected")}
            >
              <i className="bi bi-x-circle text-danger fs-4"></i>
            </button>
            <button 
              className={`btn btn-light border rounded-circle p-4 shadow-sm ${styles['hover-scale']}`}
              onClick={() => handleSelection("selected")}
            >
              <i className="bi bi-check-circle text-success fs-4"></i>
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
