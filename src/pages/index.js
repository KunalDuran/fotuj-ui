import Link from 'next/link'
import ImageSelector from "../components/ImageSelector";

export default function Home() {
  return (
    <div className="container-fluid px-4 py-3 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 text-center mb-4 mb-md-5">
          <h1 className="display-4 display-md-3 mb-3 mb-md-4">Photo Selection Tool</h1>
          <p className="lead text-muted mb-4 mb-md-5">
            Efficiently manage and organize your photographs with our intuitive selection tool.
          </p>
          
          <div className="row g-3 g-md-4 justify-content-center">
            <div className="col-12 col-sm-6">
              <Link href="/list" className="text-decoration-none">
                <div className="card h-100 border-0 shadow-sm hover-shadow">
                  <div className="card-body p-3 p-md-4">
                    <div className="d-flex flex-column align-items-center">
                      <i className="bi bi-grid display-4 text-primary mb-2 mb-md-3"></i>
                      <h3 className="h5 mb-2">List View</h3>
                      <p className="text-muted small mb-0">
                        View all images and manage their status
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Image Selector Section */}
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <ImageSelector />
        </div>
      </div>
    </div>
  );
}
