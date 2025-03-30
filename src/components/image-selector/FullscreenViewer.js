import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Zoom, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/zoom';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './FullscreenViewer.module.css';

const FullscreenViewer = ({
  images,
  currentIndex,
  imageLoadingStates,
  swipeDirection,
  handleCloseFullScreen,
  toggleInfoModal,
  handleSelection,
  handlePreview,
  showSelectionFeedback,
  selectionStatus,
  showPendingAnimation,
  downloadImage
}) => {
  const swiperRef = useRef(null);

  const handleDownload = () => {
    const currentImage = images[currentIndex];
    downloadImage(currentImage.id);
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

      <Swiper
        ref={swiperRef}
        modules={[Zoom, Navigation, Pagination]}
        initialSlide={currentIndex}
        zoom={{
          maxRatio: 3,
          minRatio: 1
        }}
        navigation={true}
        pagination={{ clickable: true }}
        className={styles.swiper}
        onSlideChange={(swiper) => {
          if (swiper.activeIndex !== currentIndex) {
            handlePreview(swiper.activeIndex > currentIndex ? 'next' : 'prev');
          }
        }}
        allowTouchMove={true}
        resistance={true}
        resistanceRatio={0.85}
        speed={300}
        watchSlidesProgress={true}
        preventInteractionOnTransition={true}
      >
        {images.map((image, index) => (
          <SwiperSlide key={image.id}>
            <div className="swiper-zoom-container h-100 d-flex align-items-center justify-content-center">
              {imageLoadingStates[image.id] ? (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading</span>
                  </div>
                </div>
              ) : (
                <img
                  src={image.url}
                  loading="eager"
                  className="img-fluid"
                  style={{ maxHeight: 'calc(100vh - 120px)', objectFit: 'contain' }}
                />
              )}
              {showSelectionFeedback && (
                <div className={`position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center ${
                  showPendingAnimation ? 'bg-warning' : selectionStatus === 'selected' ? 'bg-success' : 'bg-danger'
                } bg-opacity-50`}>
                  <i className={`bi bi-${
                    showPendingAnimation ? 'hourglass-split text-warning' :
                    selectionStatus === 'selected' ? 'heart-fill text-danger' : 'x-circle-fill text-warning'
                  }`} style={{ fontSize: '5rem' }}></i>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="position-fixed bottom-0 start-0 w-100 bg-dark bg-opacity-75 py-3 d-flex justify-content-around" style={{ zIndex: 1000, pointerEvents: 'auto' }}>
        <button
          className={`btn btn-link text-danger text-decoration-none ${images[currentIndex]?.status === 'rejected' ? 'active' : ''}`}
          onClick={() => handleSelection('rejected')}
          style={{ pointerEvents: 'auto' }}
        >
          <i className={`bi bi-${images[currentIndex]?.status === 'rejected' ? 'x-circle-fill' : 'x-circle'}`}></i>
          <span className="d-block small">Reject</span>
        </button>
        <button
          className={`btn btn-link text-success text-decoration-none ${images[currentIndex]?.status === 'selected' ? 'active' : ''}`}
          onClick={() => handleSelection('selected')}
          style={{ pointerEvents: 'auto' }}
        >
          <i className={`bi bi-${images[currentIndex]?.status === 'selected' ? 'heart-fill' : 'heart'}`}></i>
          <span className="d-block small">Select</span>
        </button>
      </div>
    </div>
  );
};

export default FullscreenViewer; 