import { useEffect, useState } from "react";
import { fetchImages, updateImageStatus } from "../utils/axios";
import { useSwipeable } from "react-swipeable";

const ImageSelector = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await fetchImages("pending");
      if (res.data) {
        setImages(res.data);
      }
    } catch (err) {
      console.error("Error fetching images", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = async (status) => {
    if (images.length === 0) return;

    await updateImageStatus(images[currentIndex].id, status);
    setCurrentIndex((prev) => (prev + 1 < images.length ? prev + 1 : 0));
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSelection("rejected"),
    onSwipedRight: () => handleSelection("selected"),
  });

  if (loading) return <div className="d-flex justify-content-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (images.length === 0) return <p className="text-center mt-5">No images available.</p>;

  return (
    <div {...swipeHandlers} className="d-flex flex-column align-items-center justify-content-center vh-100">
      {/* Card Container */}
      <div className="card shadow-lg p-3 rounded position-relative" style={{ width: "350px" }}>
        
        {/* Image Display */}
        <img
          src={images[currentIndex]?.url}
          alt="Photograph"
          className="card-img-top rounded"
          style={{ objectFit: "cover", height: "400px" }}
        />

        {/* Image Info */}
        <div className="card-body text-center">
          <h5 className="fw-bold">Image {currentIndex + 1} of {images.length}</h5>
          <p className="text-muted">Swipe left to reject, right to select</p>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-around py-3">
          <button className="btn btn-light border rounded-circle p-3" onClick={() => handleSelection("rejected")}>
            ❌
          </button>
          <button className="btn btn-light rounded-circle p-3" onClick={() => handleSelection("selected")}>
          ✅
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSelector;
