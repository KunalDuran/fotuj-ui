import { useEffect, useState, useCallback, useRef } from "react";
import { fetchImages, updateImageStatus } from "../utils/axios";
import { useSwipeable } from "react-swipeable";

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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const observerRef = useRef(null);

  // Function to get optimized image URL
  const getOptimizedImageUrl = (url, width, height) => {
    try {
      // Skip transformation if running on localhost
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.')){
        return url;
      }

      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const filename = pathParts.pop();
      const pathWithoutFilename = pathParts.join('/');
      return `${urlObj.origin}${pathWithoutFilename}/tr:w-${width},h-${height}/${filename}`;
    } catch (e) {
      console.error('Error optimizing image URL:', e);
      return url;
    }
  };

  // Function to preload full resolution images
  const preloadFullResolutionImage = useCallback((index) => {
    if (!images[index]) return;
    
    setImageLoadingStates(prev => ({ ...prev, [index]: true }));
    const img = new Image();
    img.onload = () => {
      setImageLoadingStates(prev => ({ ...prev, [index]: false }));
      setImageCache(prev => new Map(prev).set(index, img.src));
    };
    img.src = images[index].url;
  }, [images]);

  // Setup intersection observer for lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            if (!imageCache.has(index)) {
              preloadFullResolutionImage(index);
            }
            observerRef.current.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [preloadFullResolutionImage, imageCache]);

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
      } else if (e.key === 'Escape' || !isFullScreen) {
        setIsFullScreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [mode, isFullScreen]);

  useEffect(() => {
    if (images.length > 0) {
      preloadFullResolutionImage(currentIndex + 1);
    }
  }, [currentIndex, images, preloadFullResolutionImage]);

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

  const handleImageClick = (index) => {
    setCurrentIndex(index);
    setIsFullScreen(true);
    document.body.style.overflow = 'hidden';
    // Preload full resolution image when entering fullscreen
    if (!imageCache.has(index)) {
      preloadFullResolutionImage(index);
    }
  };

  const handleCloseFullScreen = () => {
    console.log("Closing full screen");
    setIsFullScreen(false);
    document.body.style.overflow = 'auto';
    setShowInfoModal(false);
  };

  const toggleInfoModal = () => {
    setShowInfoModal(!showInfoModal);
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
    <div className="container-fluid p-0 bg-dark min-vh-100">
      {error && (
        <div className="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3" role="alert">
          {error}
        </div>
      )}

      {!isFullScreen ? (
        // Gallery View
        <div className="row g-3 p-3 h-100 overflow-auto">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="col-4 col-sm-4 col-md-3 col-lg-2"
              onClick={() => handleImageClick(index)}
              data-index={index}
              ref={el => el && observerRef.current?.observe(el)}
            >
              <div className="position-relative ratio ratio-1x1">
                <img
                  src={getOptimizedImageUrl(image.url, 300, 300)}
                  alt={`Image ${index + 1}`}
                  loading="lazy"
                  className={`img-fluid rounded-3 ${imageLoadingStates[index] ? 'opacity-50' : ''}`}
                  style={{ objectFit: 'cover' }}
                />
                {imageLoadingStates[index] && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                    <div className="spinner-border text-light" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                {showSelectionFeedback && currentIndex === index && (
                  <div className={`position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-${getStatusColor(selectionStatus)} bg-opacity-50 rounded-3`}>
                    <i className={`bi bi-${selectionStatus === 'selected' ? 'heart-fill text-danger' : 'x-circle-fill text-warning'}`} style={{ fontSize: '3rem' }}></i>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Fullscreen View
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark">
          <div className="position-fixed top-0 start-0 w-100 bg-dark bg-opacity-75 py-2 px-3 d-flex justify-content-between align-items-center" style={{ zIndex: 1000 }}>
            <div className="d-flex gap-3">
              <button
                className="btn btn-outline-light border-0"
                onClick={handleCloseFullScreen}
                type="button"
                style={{ zIndex: 1001 }}
              >
                <i className="bi bi-x-lg"></i>
                <span className="d-block small">Close</span>
              </button>
              <button
                className="btn btn-outline-light border-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleInfoModal();
                }}
                type="button"
              >
                <i className="bi bi-info-circle"></i>
                <span className="d-block small">Info</span>
              </button>
            </div>
            <span className="text-light">{currentIndex + 1} of {images.length}</span>
          </div>

          <div
            className={`position-relative h-100 ${swipeDirection === 'left' ? 'translate-middle-x' : swipeDirection === 'right' ? 'translate-middle-x' : ''}`}
            {...swipeHandlers}
          >
            <div className="h-100 d-flex align-items-center justify-content-center">
              {imageLoadingStates[currentIndex] ? (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <img
                  src={imageCache.get(currentIndex) || images[currentIndex].url}
                  alt={`Image ${currentIndex + 1}`}
                  loading="eager"
                  className="img-fluid"
                  style={{ maxHeight: 'calc(100vh - 120px)', objectFit: 'contain' }}
                />
              )}
            </div>
          </div>

          <div className="position-fixed bottom-0 start-0 w-100 bg-dark bg-opacity-75 py-3 d-flex justify-content-around">
            <button
              className="btn btn-link text-warning text-decoration-none"
              onClick={() => handleSelection('rejected')}
            >
              <i className="bi bi-x-circle"></i>
              <span className="d-block small">Reject</span>
            </button>
            <button
              className="btn btn-link text-danger text-decoration-none"
              onClick={() => handleSelection('selected')}
            >
              <i className="bi bi-heart"></i>
              <span className="d-block small">Select</span>
            </button>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <>
          <div className="modal-backdrop show"></div>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-dark text-light">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title">Image Information</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={toggleInfoModal}></button>
                </div>
                <div className="modal-body">
                  <p><strong>Image ID:</strong> {images[currentIndex]?.id}</p>
                  <p><strong>Status:</strong> {images[currentIndex]?.status || 'Pending'}</p>
                  <p><strong>Last Updated:</strong> {new Date(images[currentIndex]?.updated_at).toLocaleString()}</p>
                  <p><strong>Updated By:</strong> {images[currentIndex]?.updated_by || 'N/A'}</p>
                  {searchHistory.length > 0 && (
                    <>
                      <h6 className="mt-3">Search History</h6>
                      <ul className="list-unstyled">
                        {searchHistory.map((item, index) => (
                          <li key={index} className="mb-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageSelector;
