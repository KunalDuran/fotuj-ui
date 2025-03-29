import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="text-muted">Loading images...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 