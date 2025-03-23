import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();
  const isListPage = router.pathname === '/list';

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container-fluid px-4">
        <Link href="/" className="navbar-brand fw-bold">
          Fotuj
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              {isListPage ? (
                <Link href="/" className="btn btn-outline-primary me-2">
                  <i className="bi bi-arrow-left me-2"></i>Back to Selector
                </Link>
              ) : (
                <Link href="/list" className="btn btn-outline-primary me-2">
                  <i className="bi bi-grid me-2"></i>List View
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 