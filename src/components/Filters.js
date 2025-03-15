import { useState, useEffect } from "react";
import { fetchImages } from "../utils/axios";

const Filters = () => {
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState("selected");

  useEffect(() => {
    loadFilteredImages(filter);
  }, [filter]);

  const loadFilteredImages = async (status) => {
    try {
      const res = await fetchImages(status);
      setImages(res.data);
    } catch (err) {
      console.error("Error fetching filtered images", err);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-center mb-3">
        <button className="btn btn-primary me-2" onClick={() => setFilter("selected")}>Selected</button>
        <button className="btn btn-warning me-2" onClick={() => setFilter("pending")}>Pending</button>
        <button className="btn btn-danger" onClick={() => setFilter("rejected")}>Rejected</button>
      </div>
      <div className="row">
        {images && images.map((img) => (
          <div key={img._id} className="col-md-4 mb-3">
            <div className="card">
              <img src={img.url} className="card-img-top" alt="Selected" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filters;