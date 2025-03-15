import ImageSelector from "../components/ImageSelector";
import Filters from "../components/Filters";

export default function Home() {
  return (
    <div className="container">
      <h2 className="text-center mt-3">Photo Selection Tool</h2>
      <ImageSelector />
      <Filters />
    </div>
  );
}
