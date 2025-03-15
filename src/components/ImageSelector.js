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
    if (images && images.length === 0) return;
    
    await updateImageStatus(images[currentIndex].id, status);
    setCurrentIndex((prev) => (prev + 1 < images.length ? prev + 1 : 0));
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSelection("rejected"),
    onSwipedRight: () => handleSelection("selected"),
  });

  if (loading) return <div className="spinner-border text-primary"></div>;
  if (images && images.length === 0) return <p className="text-center">No images available.</p>;

  return (
    <div {...swipeHandlers} className="container text-center mt-4">
      <img
        src={images[currentIndex]?.url}
        alt="Photograph"
        className="img-fluid shadow-lg rounded border border-secondary"
        style={{ maxHeight: "500px" }}
      />
      <div className="mt-3">
        <button className="btn btn-danger me-3" onClick={() => handleSelection("rejected")}>
          Reject
        </button>
        <button className="btn btn-success" onClick={() => handleSelection("selected")}>
          Select
        </button>
      </div>
    </div>
  );
};

export default ImageSelector;
