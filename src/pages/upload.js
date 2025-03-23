import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Upload() {
  const [formData, setFormData] = useState({
    photographer_id: '',
    client_id: '',
    images: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      images: e.target.files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('photographer_id', formData.photographer_id);
      formDataToSend.append('client_id', formData.client_id);
      
      // Append each file from the folder
      for (let i = 0; i < formData.images.length; i++) {
        formDataToSend.append('images', formData.images[i]);
      }

      const response = await fetch('http://localhost:8080/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setMessage('Upload successful!');
      setFormData({
        photographer_id: '',
        client_id: '',
        images: null
      });
    } catch (error) {
      setMessage('Error uploading files. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body p-4">
              <h1 className="text-center mb-4">Upload Project</h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="photographer_id" className="form-label">Photographer Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="photographer_id"
                    name="photographer_id"
                    value={formData.photographer_id}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="client_id" className="form-label">Client Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="client_id"
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="images" className="form-label">Select Images Folder</label>
                  <input
                    type="file"
                    className="form-control"
                    id="images"
                    name="images"
                    onChange={handleFileChange}
                    multiple
                    webkitdirectory="true"
                    directory="true"
                    required
                  />
                </div>

                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Uploading...
                      </>
                    ) : 'Upload'}
                  </button>
                </div>

                {message && (
                  <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} mt-3`}>
                    {message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 