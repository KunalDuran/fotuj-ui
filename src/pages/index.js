import ImageSelector from '../components/image-selector/ImageSelector';
import Navbar from "../components/Navbar";
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const { project_id } = router.query;

  useEffect(() => {
    if (project_id) {
      localStorage.setItem('project_id', project_id);
    }
  }, [project_id]);

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
