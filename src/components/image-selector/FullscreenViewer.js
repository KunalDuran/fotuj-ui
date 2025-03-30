import React from 'react';
import { useSwipeable } from 'react-swipeable';

const FullscreenViewer = ({
  images,
  currentIndex,
  imageLoadingStates,
  imageCache,
  swipeDirection,
  handleCloseFullScreen,
  toggleInfoModal,
  handleSelection,
  handlePreview,
  showSelectionFeedback,
  selectionStatus
}) => {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handlePreview('next'),
    onSwipedRight: () => handlePreview('prev'),
    onSwipedUp: () => handleCloseFullScreen(),
    onSwipedDown: () => handleCloseFullScreen(),
  });

  const handleDownload = async () => {
    const imageUrl = imageCache.get(currentIndex) || images[currentIndex].url;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
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
          <button
            className="btn btn-outline-light border-0"
            onClick={handleDownload}
            type="button"
          >
            <i className="bi bi-download"></i>
            <span className="d-block small">Download</span>
          </button>
        </div>
        <span className="text-light">{currentIndex + 1} of {images.length}</span>
      </div>

      <div
        className={`position-relative h-100 transition-all duration-300 ${
          swipeDirection === 'left' 
            ? 'translate-middle-x' 
            : swipeDirection === 'right' 
              ? 'translate-middle-x' 
              : swipeDirection === 'up' || swipeDirection === 'down'
                ? 'opacity-0 scale-95'
                : ''
        }`}
        style={{
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out, transform 0.3s ease-out'
        }}
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
          {showSelectionFeedback && (
            <div className={`position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-${selectionStatus === 'selected' ? 'success' : 'danger'} bg-opacity-50`}>
              <i className={`bi bi-${selectionStatus === 'selected' ? 'heart-fill text-danger' : 'x-circle-fill text-warning'}`} style={{ fontSize: '5rem' }}></i>
            </div>
          )}
        </div>
      </div>

      <div className="position-fixed bottom-0 start-0 w-100 bg-dark bg-opacity-75 py-3 d-flex justify-content-around">
        <button
          className={`btn btn-link text-warning text-decoration-none ${images[currentIndex]?.status === 'rejected' ? 'active' : ''}`}
          onClick={() => handleSelection('rejected')}
        >
          <i className={`bi bi-${images[currentIndex]?.status === 'rejected' ? 'x-circle-fill' : 'x-circle'}`}></i>
          <span className="d-block small">Reject</span>
        </button>
        <button
          className="btn btn-link text-danger text-decoration-none"
          onClick={() => handleSelection('selected')}
        >
          <i className={`bi bi-${images[currentIndex]?.status === 'selected' ? 'heart-fill' : 'heart'}`}></i>
          <span className="d-block small">Select</span>
        </button>
      </div>
    </div>
  );
};

export default FullscreenViewer; 