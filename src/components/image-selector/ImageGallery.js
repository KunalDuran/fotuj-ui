import React from 'react';

const ImageGallery = ({
  images,
  currentIndex,
  imageLoadingStates,
  showSelectionFeedback,
  selectionStatus,
  getStatusColor,
  handleImageClick,
  observerRef,
  getOptimizedImageUrl
}) => {
  return (
    <div className="row g-3 h-100 overflow-auto">
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
  );
};

export default ImageGallery; 