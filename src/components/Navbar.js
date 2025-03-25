import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const router = useRouter();
  const isListPage = router.pathname === '/list';
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [userIdentity, setUserIdentity] = useState('');

  useEffect(() => {
    // Pre-populate user identity if available
    const storedIdentity = localStorage.getItem('updated_by');
    if (storedIdentity) {
      setUserIdentity(storedIdentity);
    }
  }, []);

  const handleProjectChange = (e) => {
    e.preventDefault();
    if (projectId.trim()) {
      // Only remove the old project_id when we have a new one to set
      localStorage.removeItem('project_id');
      localStorage.setItem('project_id', projectId.trim());
      setShowProjectModal(false);
      // Reload the page to refresh the data
      window.location.reload();
    }
  };

  const handleChangeProject = () => {
    setShowProjectModal(true);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
        <div className="container-fluid px-4">
          <Link href="/" className="navbar-brand fw-bold">
            Fotuj
          </Link>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button 
                  className="btn btn-outline-secondary me-2"
                  onClick={handleChangeProject}
                >
                  <i className="bi bi-folder me-2"></i>Change Project
                </button>
              </li>
              <li className="nav-item">
                {isListPage ? (
                  <Link href="/" className="btn btn-outline-primary me-2">
                    <i className="bi bi-arrow-left me-2"></i>Back to Selector
                  </Link>
                ) : (
                  <Link href="/list" className="btn btn-outline-primary me-2">
                    <i className="bi bi-grid me-2"></i>List View
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Project Change Modal */}
      {showProjectModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Project</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowProjectModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleProjectChange}>
                  {userIdentity && (
                    <div className="mb-3">
                      <label className="form-label">Your Identity</label>
                      <input
                        type="text"
                        className="form-control"
                        value={userIdentity}
                        disabled
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="projectId" className="form-label">New Project ID</label>
                    <input
                      type="text"
                      className="form-control"
                      id="projectId"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="Enter new project ID"
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowProjectModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Change Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar; 