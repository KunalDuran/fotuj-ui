import ImageSelector from '../components/image-selector/ImageSelector';
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container-fluid py-3 py-md-5 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <ImageSelector />
          </div>
        </div>
      </div>
    </div>
  );
}
