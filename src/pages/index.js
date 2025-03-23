import ImageSelector from "../components/ImageSelector";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="container-fluid px-4 py-3 py-md-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 text-center mb-4 mb-md-5">
            <h1 className="display-4 display-md-3 mb-3 mb-md-4">Photo Selection Tool</h1>
            <p className="lead text-muted mb-4 mb-md-5">
              Efficiently manage and organize your photographs with our intuitive selection tool.
            </p>
          </div>
        </div>

        {/* Image Selector Section */}
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <ImageSelector />
          </div>
        </div>
      </div>
    </>
  );
}
