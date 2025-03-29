import React from 'react';

const ImageInfoModal = ({ image, onClose }) => {
  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-dark text-light">
            <div className="modal-header border-secondary">
              <h5 className="modal-title">Image Information</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <p><strong>Image ID:</strong> {image?.id}</p>
              <p><strong>Status:</strong> {image?.status || 'Pending'}</p>
              {image?.status_history?.length > 0 && (
                <>
                  <h6 className="mt-3">Status History</h6>
                  <ul className="list-unstyled">
                    {image?.status_history?.map((item, index) => {
                      if (item.comment) {
                        return (
                          <li key={index} className="mb-2">
                            {item.comment} 
                          </li>
                        )
                      }
                      return null;
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageInfoModal; 