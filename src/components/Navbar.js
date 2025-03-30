import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const router = useRouter();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [userIdentity, setUserIdentity] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const storedIdentity = localStorage.getItem('updated_by');
      if (storedIdentity) {
        setUserIdentity(storedIdentity);
      }
    } catch (err) {
      console.error('Error accessing localStorage:', err);
      setError('Failed to load user identity');
    }
  }, []);

  const handleProjectChange = (e) => {
    e.preventDefault();
    setError('');
    
    if (!projectId.trim()) {
      setError('Project ID cannot be empty');
      return;
    }

    try {
      localStorage.removeItem('project_id');
      localStorage.setItem('project_id', projectId.trim());
      setShowProjectModal(false);
      window.location.reload();
    } catch (err) {
      console.error('Error updating project ID:', err);
      setError('Failed to update project ID');
    }
  };

  const handleChangeProject = () => {
    setShowProjectModal(true);
    setError('');
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
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button 
                  className="nav-link text-primary border-0 bg-transparent"
                  onClick={handleChangeProject}
                  style={{ cursor: 'pointer' }}
                >
                  Change Project
                </button>
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
                  aria-label="Close"
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
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
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