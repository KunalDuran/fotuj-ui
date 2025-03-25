import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_CLOUDFLARE_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.NEXT_PUBLIC_CLOUDFLARE_BUCKET_NAME;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export default function Upload() {
  const [formData, setFormData] = useState({
    photographer_id: '',
    client_id: '',
    images: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: e.target.files
    }));
    setSelectedFiles(files);
  };

  const uploadToCloudflare = async (file) => {
    const key = `${Date.now()}-${file.name}`;
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: file.type,
    });

    await s3Client.send(command);
    return `https://${R2_BUCKET_NAME}.r2.dev/${key}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Upload all files to Cloudflare R2
      const uploadPromises = Array.from(formData.images).map(file => uploadToCloudflare(file));
      const urls = await Promise.all(uploadPromises);

      // Send data to backend
      const response = await fetch('http://localhost:8080/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photographer_id: formData.photographer_id,
          client_id: formData.client_id,
          urls: urls
        }),
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
      setSelectedFiles([]);
    } catch (error) {
      setMessage('Error uploading files. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container-fluid px-4 py-3 py-md-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-body p-3 p-md-4">
                <h1 className="text-center h2 h1-md mb-4">Upload Project</h1>
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
                    <div className="input-group">
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
                      {selectedFiles.length > 0 && (
                        <span className="input-group-text text-danger">
                          <i className="bi bi-heart-fill"></i> {selectedFiles.length} files
                        </span>
                      )}
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="mt-2">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-info-circle me-2 text-primary"></i>
                          <small className="text-muted">
                            {selectedFiles.length} files selected
                          </small>
                        </div>
                      </div>
                    )}
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
    </>
  );
}