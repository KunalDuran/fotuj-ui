import React, { useEffect, useState, useCallback, useRef } from "react";
import { fetchImages, updateImageStatus } from "../../utils/axios";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import IdentityModal from "./IdentityModal";
import ImageGallery from "./ImageGallery";
import FullscreenViewer from "./FullscreenViewer";
import ImageInfoModal from "./ImageInfoModal";
import "./ImageSelector.module.css";

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
  const [imageCache, setImageCache] = useState(new Map());
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showPendingAnimation, setShowPendingAnimation] = useState(false);
  const observerRef = useRef(null);

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
      preloadFullResolutionImage(currentIndex + 1);
    }
  }, [currentIndex, images, preloadFullResolutionImage]);

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
        setFilteredImages(res.data);
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
      const firstFullIndex = images.findIndex(img => img.id === firstImage.id);
      setCurrentIndex(firstFullIndex);
    } else {
      // Keep the current image if it exists in the new filtered view
      setCurrentIndex(currentIndex);
    }
  };

  const handleSelection = async (status) => {
    if (images.length === 0) return;
    
    // If clicking the same status that's already active, change to pending
    const currentImage = images[currentIndex];
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
        
        // Find the current image's position in filtered view
        const currentFilteredIndex = updatedFilteredImages.findIndex(img => img.id === currentImage.id);
        
        // If current image is no longer in filtered view, move to next available image
        if (currentFilteredIndex === -1) {
          const nextFilteredImage = updatedFilteredImages[0];
          if (nextFilteredImage) {
            const nextFullIndex = updatedImages.findIndex(img => img.id === nextFilteredImage.id);
            setCurrentIndex(nextFullIndex);
          }
        } else {
          // Move to next image in the filtered view
          const nextFilteredIndex = currentFilteredIndex + 1;
          if (nextFilteredIndex < updatedFilteredImages.length) {
            const nextImage = updatedFilteredImages[nextFilteredIndex];
            const nextFullIndex = updatedImages.findIndex(img => img.id === nextImage.id);
            setCurrentIndex(nextFullIndex);
          } else {
            // If we're at the end of filtered view, go back to start
            const firstFilteredImage = updatedFilteredImages[0];
            const firstFullIndex = updatedImages.findIndex(img => img.id === firstFilteredImage.id);
            setCurrentIndex(firstFullIndex);
          }
        }
        
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
    setSwipeDirection(direction);
    
    // Get the current image's position in filtered view
    const currentFilteredIndex = filteredImages.findIndex(img => img.id === images[currentIndex].id);
    let nextFilteredIndex;
    
    if (direction === 'next') {
      nextFilteredIndex = currentFilteredIndex + 1;
      if (nextFilteredIndex >= filteredImages.length) {
        nextFilteredIndex = 0;
      }
    } else {
      nextFilteredIndex = currentFilteredIndex - 1;
      if (nextFilteredIndex < 0) {
        nextFilteredIndex = filteredImages.length - 1;
      }
    }
    
    // Find the corresponding index in the full images array
    const nextImage = filteredImages[nextFilteredIndex];
    const nextFullIndex = images.findIndex(img => img.id === nextImage.id);
    setCurrentIndex(nextFullIndex);
    
    setTimeout(() => setSwipeDirection(null), 300);
  }, [images, filteredImages, currentIndex]);

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
    // Find the original index in the full images array
    const clickedImage = filteredImages[index];
    const originalIndex = images.findIndex(img => img.id === clickedImage.id);
    setCurrentIndex(originalIndex);
    setIsFullScreen(true);
    document.body.style.overflow = 'hidden';
    if (!imageCache.has(originalIndex)) {
      preloadFullResolutionImage(originalIndex);
    }
  };

  const downloadAllImages = async () => {
    try {
      // Show loading state
      setLoading(true);
      
      // Download each image in the filtered view
      for (const image of filteredImages) {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `image-${image.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Add a small delay between downloads to prevent browser blocking
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

      <div className="d-flex justify-content-center gap-2 py-2 bg-white shadow-sm">
        <button 
          className={`btn filter-button ${currentFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          All <span className="badge bg-white text-dark ms-1">{images.length}</span>
        </button>
        <button 
          className={`btn filter-button ${currentFilter === 'selected' ? 'active' : ''}`}
          onClick={() => handleFilterChange('selected')}
        >
          Selected <span className="badge bg-white text-dark ms-1">{images.filter(img => img.status === 'selected').length}</span>
        </button>
        <button 
          className={`btn filter-button ${currentFilter === 'rejected' ? 'active' : ''}`}
          onClick={() => handleFilterChange('rejected')}
        >
          Rejected <span className="badge bg-white text-dark ms-1">{images.filter(img => img.status === 'rejected').length}</span>
        </button>
        <button 
          className={`btn filter-button ${currentFilter === 'pending' ? 'active' : ''}`}
          onClick={() => handleFilterChange('pending')}
        >
          Pending <span className="badge bg-white text-dark ms-1">{images.filter(img => img.status === 'pending').length}</span>
        </button>
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
          images={images}
          currentIndex={currentIndex}
          imageLoadingStates={imageLoadingStates}
          imageCache={imageCache}
          swipeDirection={swipeDirection}
          handleCloseFullScreen={handleCloseFullScreen}
          toggleInfoModal={toggleInfoModal}
          handleSelection={handleSelection}
          handlePreview={handlePreview}
          showSelectionFeedback={showSelectionFeedback}
          selectionStatus={selectionStatus}
          showPendingAnimation={showPendingAnimation}
        />
      )}

      {showInfoModal && (
        <ImageInfoModal
          image={images[currentIndex]}
          searchHistory={searchHistory}
          onClose={toggleInfoModal}
        />
      )}
    </div>
  );
};

export default ImageSelector; 