import React, { useEffect, useState, useCallback, useRef } from "react";
import { fetchImages, updateImageStatus } from "../../utils/axios";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import IdentityModal from "./IdentityModal";
import ImageGallery from "./ImageGallery";
import FullscreenViewer from "./FullscreenViewer";
import ImageInfoModal from "./ImageInfoModal";
import styles from "./ImageSelector.module.css";

const ImageSelector = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all'); // 'all', 'selected', 'rejected', 'pending'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showSelectionFeedback, setShowSelectionFeedback] = useState(false);
  const [selectionStatus, setSelectionStatus] = useState(null);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [userIdentity, setUserIdentity] = useState('');
  const [projectId, setProjectId] = useState('');
  const [error, setError] = useState(null);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPendingAnimation, setShowPendingAnimation] = useState(false);
  const observerRef = useRef(null);

  // Cache management functions
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

  const getCachedImages = (projectId) => {
    try {
      const cached = localStorage.getItem(`image_cache_${projectId}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  };

  const setCachedImages = (projectId, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(`image_cache_${projectId}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  };

  const invalidateCache = (projectId) => {
    try {
      localStorage.removeItem(`image_cache_${projectId}`);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  };

  // Function to get optimized image URL
  const getOptimizedImageUrl = (url, width, height) => {
    try {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.')) {
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

  // Function to download image
  const downloadImage = useCallback(async (imageId) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${imageId}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image. Please try again.');
    }
  }, [images]);

  // Setup intersection observer for lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const imageId = entry.target.dataset.imageId;
            setImageLoadingStates(prev => ({ ...prev, [imageId]: true }));
            const img = new Image();
            img.onload = () => {
              setImageLoadingStates(prev => ({ ...prev, [imageId]: false }));
            };
            const image = images.find(img => img.id === imageId);
            if (image) {
              img.src = image.url;
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
  }, [images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePreview('prev');
      } else if (e.key === 'ArrowRight') {
        handlePreview('next');
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullScreen();
      } else if (e.key === 'Escape' && isFullScreen) {
        handleCloseFullScreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullScreen]);

  useEffect(() => {
    if (images.length > 0) {
      const currentImage = images[currentIndex];
      setImageLoadingStates(prev => ({ ...prev, [currentImage.id]: true }));
      const img = new Image();
      img.onload = () => {
        setImageLoadingStates(prev => ({ ...prev, [currentImage.id]: false }));
      };
      img.src = currentImage.url;
    }
  }, [currentIndex, images]);

  useEffect(() => {
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
      // Invalidate cache when changing project
      invalidateCache(projectId.trim());
      setShowIdentityModal(false);
      loadImages();
    }
  };

  const loadImages = async () => {
    setLoading(true);
    try {
      const storedProjectId = localStorage.getItem('project_id');
      if (!storedProjectId) {
        throw new Error('Project ID not set');
      }

      // Try to get images from cache first
      const cachedImages = getCachedImages(storedProjectId);
      if (cachedImages) {
        setImages(cachedImages);
        setFilteredImages(cachedImages);
        setLoading(false);
        return;
      }

      // If not in cache, fetch from API
      const res = await fetchImages("all", storedProjectId);
      if (res.data) {
        setImages(res.data);
        setFilteredImages(res.data);
        setCachedImages(storedProjectId, res.data);
      }
    } catch (err) {
      console.error("Error fetching images", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
    const newFilteredImages = filter === 'all' 
      ? images 
      : images.filter(img => img.status === filter);
    setFilteredImages(newFilteredImages);
    
    // Find the current image in the new filtered view
    const currentImage = images[currentIndex];
    const newFilteredIndex = newFilteredImages.findIndex(img => img.id === currentImage.id);
    
    if (newFilteredIndex === -1) {
      // If current image is not in the new filtered view, go to the first image
      const firstImage = newFilteredImages[0];
      if (firstImage) {
        const firstFullIndex = images.findIndex(img => img.id === firstImage.id);
        setCurrentIndex(firstFullIndex);
      }
    } else {
      // Keep the current image if it exists in the new filtered view
      setCurrentIndex(currentIndex);
    }
  };

  const handleSelection = async (status) => {
    if (filteredImages.length === 0) return;
    
    // If clicking the same status that's already active, change to pending
    const currentImage = filteredImages[currentIndex];
    if (currentImage.status === status) {
      status = 'pending';
      setShowPendingAnimation(true);
    } else {
      setShowPendingAnimation(false);
    }
    
    setSelectionStatus(status);
    setShowSelectionFeedback(true);
    
    try {
      setTimeout(async () => {
        const storedProjectId = localStorage.getItem('project_id');
        await updateImageStatus(currentImage.id, status, storedProjectId);
        
        // Update the images array with new status
        const updatedImages = images.map((img) => 
          img.id === currentImage.id ? { ...img, status } : img
        );
        setImages(updatedImages);
        
        // Update filtered images based on current filter
        const updatedFilteredImages = currentFilter === 'all' 
          ? updatedImages 
          : updatedImages.filter(img => img.status === currentFilter);
        setFilteredImages(updatedFilteredImages);
        
        // Update cache with new data
        setCachedImages(storedProjectId, updatedImages);
        
        // Move to next image in the filtered view
        const nextIndex = (currentIndex + 1) % updatedFilteredImages.length;
        setCurrentIndex(nextIndex);
        
        setShowSelectionFeedback(false);
        setSelectionStatus(null);
        setShowPendingAnimation(false);
      }, 500);
    } catch (err) {
      setError(err.message);
      setShowSelectionFeedback(false);
      setSelectionStatus(null);
      setShowPendingAnimation(false);
    }
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
    document.body.style.overflow = 'auto';
    setShowInfoModal(false);
    setShowSelectionFeedback(false);
    setSelectionStatus(null);
  };

  const handlePreview = useCallback((direction) => {
    console.log('handlePreview', direction);
    setSwipeDirection(direction);
    
    let nextIndex;
    if (direction === 'next') {
      nextIndex = currentIndex + 1;
      if (nextIndex >= filteredImages.length) {
        nextIndex = 0;
      }
    } else {
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) {
        nextIndex = filteredImages.length - 1;
      }
    }
    
    setCurrentIndex(nextIndex);
    setTimeout(() => setSwipeDirection(null), 300);
  }, [filteredImages, currentIndex]);

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
    if (!isFullScreen) {
      setIsFullScreen(true);
      document.body.style.overflow = 'hidden';
    } else {
      handleCloseFullScreen();
    }
  };

  const handleImageClick = (index) => {
    console.log('handleImageClick', index);
    console.log('filteredImages', filteredImages);
    console.log('images', images);

    const image = filteredImages[index];
    setCurrentIndex(index);
    setIsFullScreen(true);
    console.log('currentIndex', currentIndex);

    document.body.style.overflow = 'hidden';
    setImageLoadingStates(prev => ({ ...prev, [image.id]: true }));
    const img = new Image();
    img.onload = () => {
      setImageLoadingStates(prev => ({ ...prev, [image.id]: false }));
    };
    img.src = image.url;


  };

  // Update the downloadAllImages function
  const downloadAllImages = async () => {
    try {
      setLoading(true);
      for (const image of filteredImages) {
        await downloadImage(image.id);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error downloading images:', error);
      setError('Failed to download some images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInfoModal = () => {

    setShowInfoModal(!showInfoModal);
  };

  if (showIdentityModal) {
    return (
      <IdentityModal
        userIdentity={userIdentity}
        setUserIdentity={setUserIdentity}
        projectId={projectId}
        setProjectId={setProjectId}
        onSubmit={handleIdentitySubmit}
      />
    );
  }

  if (loading) return <LoadingSpinner />;
  if (images.length === 0) return <EmptyState />;

  return (
    <div className="container-fluid p-0 bg-light min-vh-100">
      {error && (
        <div className="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3" role="alert">
          {error}
        </div>
      )}

      {/* Filter bar */}
      <div className="row px-2 shadow-sm">
        <div className="col-9 border-end">
          <div className={styles['filter-container']}>
            <button 
              className={`${styles['filter-button']} ${currentFilter === 'all' ? styles.active : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              <span>All</span>
              <span className="badge text-dark">{images.length}</span>
            </button>
            <button 
              className={`${styles['filter-button']} ${currentFilter === 'selected' ? styles.active : ''}`}
              onClick={() => handleFilterChange('selected')}
            >
              <span>Selected</span>
              <span className="badge text-dark">{images.filter(img => img.status === 'selected').length}</span>
            </button>
            <button 
              className={`${styles['filter-button']} ${currentFilter === 'rejected' ? styles.active : ''}`}
              onClick={() => handleFilterChange('rejected')}
            >
              <span>Rejected</span>
              <span className="badge text-dark">{images.filter(img => img.status === 'rejected').length}</span>
            </button>
            <button 
              className={`${styles['filter-button']} ${currentFilter === 'pending' ? styles.active : ''}`}
              onClick={() => handleFilterChange('pending')}
            >
              <span>Pending</span>
              <span className="badge text-dark">{images.filter(img => img.status === 'pending').length}</span>
            </button>
          </div>
        </div>
        <div className="col-3 align-self-center m-auto">
          <button
            className="btn filter-button active"
            onClick={downloadAllImages}
            disabled={loading || filteredImages.length === 0}
          >
            <i className="bi bi-download me-2"></i>
             ({filteredImages.length})
          </button>
        </div>
      </div>

      {!isFullScreen ? (
        <ImageGallery
          images={filteredImages}
          currentIndex={currentIndex}
          imageLoadingStates={imageLoadingStates}
          showSelectionFeedback={showSelectionFeedback}
          selectionStatus={selectionStatus}
          getStatusColor={getStatusColor}
          handleImageClick={handleImageClick}
          observerRef={observerRef}
          getOptimizedImageUrl={getOptimizedImageUrl}
          showPendingAnimation={showPendingAnimation}
          onDownloadAll={downloadAllImages}
          loading={loading}
        />
      ) : (
        <FullscreenViewer
          images={filteredImages}
          currentIndex={currentIndex}
          imageLoadingStates={imageLoadingStates}
          swipeDirection={swipeDirection}
          handleCloseFullScreen={handleCloseFullScreen}
          toggleInfoModal={toggleInfoModal}
          handleSelection={handleSelection}
          handlePreview={handlePreview}
          showSelectionFeedback={showSelectionFeedback}
          selectionStatus={selectionStatus}
          showPendingAnimation={showPendingAnimation}
          downloadImage={downloadImage}
        />
      )}

      {showInfoModal && (
        <ImageInfoModal
          image={filteredImages[currentIndex]}
          onClose={toggleInfoModal}
        />
      )}
    </div>
  );
};

export default ImageSelector; 