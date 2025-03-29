import React, { useEffect } from 'react';

const IdentityModal = ({ userIdentity, setUserIdentity, projectId, setProjectId, onSubmit }) => {
  useEffect(() => {
    const storedProjectId = localStorage.getItem('project_id');
    if (storedProjectId) {
      setProjectId(storedProjectId);
    }
  }, [setProjectId]);

  return (
    <div className="d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow-lg rounded-4 p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-4">Set Your Identity</h3>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label htmlFor="userIdentity" className="form-label">Your Name</label>
            <input
              type="text"
              className="form-control"
              id="userIdentity"
              value={userIdentity}
              onChange={(e) => setUserIdentity(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="projectId" className="form-label">Project ID</label>
            <input
              type="text"
              className="form-control"
              id="projectId"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Enter project ID"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default IdentityModal; 