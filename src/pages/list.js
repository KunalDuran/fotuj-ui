import { useEffect, useState } from "react";
import { fetchImages, updateImageStatus } from "../utils/axios";

const ImageList = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    selected: false,
    rejected: false,
    pending: true
  });

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await fetchImages("all");
      if (res.data) {
        setImages(res.data);
      }
    } catch (err) {
      console.error("Error fetching images", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (imageId, newStatus) => {
    try {
      await updateImageStatus(imageId, newStatus);
      // Refresh images after status update
      loadImages();
    } catch (err) {
      console.error("Error updating image status", err);
    }
  };

  const filteredImages = images.filter(image => {
    if (filters.selected && image.status === 'selected') return true;
    if (filters.rejected && image.status === 'rejected') return true;
    if (filters.pending && image.status === 'pending') return true;
    return false;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'selected': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="container-fluid px-4 py-3 py-md-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <h2 className="mb-3 mb-md-0">Image Gallery</h2>
            <a href="/" className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>Back to Selector
            </a>
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body p-3 p-md-4">
              <h5 className="card-title mb-3">Filter Images</h5>
              <div className="d-flex flex-wrap gap-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="pendingFilter"
                    checked={filters.pending}
                    onChange={(e) => setFilters(prev => ({ ...prev, pending: e.target.checked }))}
                  />
                  <label className="form-check-label" htmlFor="pendingFilter">
                    Pending
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="selectedFilter"
                    checked={filters.selected}
                    onChange={(e) => setFilters(prev => ({ ...prev, selected: e.target.checked }))}
                  />
                  <label className="form-check-label" htmlFor="selectedFilter">
                    Selected
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rejectedFilter"
                    checked={filters.rejected}
                    onChange={(e) => setFilters(prev => ({ ...prev, rejected: e.target.checked }))}
                  />
                  <label className="form-check-label" htmlFor="rejectedFilter">
                    Rejected
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="row g-3 g-md-4">
            {filteredImages.map((image) => (
              <div key={image.id} className="col-12 col-sm-6 col-md-4">
                <div className="card h-100">
                  <div className="position-relative">
                    <img
                      src={image.url}
                      className="card-img-top"
                      alt="Photograph"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <div className="position-absolute top-0 end-0 m-2">
                      <div className="dropdown">
                        <button
                          className="btn btn-light btn-sm rounded-circle p-2"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleStatusUpdate(image.id, 'pending')}
                            >
                              <i className="bi bi-clock me-2"></i>Mark as Pending
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleStatusUpdate(image.id, 'selected')}
                            >
                              <i className="bi bi-check-circle me-2"></i>Mark as Selected
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleStatusUpdate(image.id, 'rejected')}
                            >
                              <i className="bi bi-x-circle me-2"></i>Mark as Rejected
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className={`badge bg-${getStatusColor(image.status)}`}>
                        {image.status}
                      </span>
                      <small className="text-muted">
                        ID: {image.id.slice(-7, -1)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-images text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-3">No images found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageList; 