import ImageSelector from "../components/ImageSelector";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container-fluid px-4 py-3 py-md-5 flex-grow-1">
        {/* Image Selector Section */}
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <ImageSelector />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
