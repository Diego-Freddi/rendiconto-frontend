import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ onToggleSidebar, isMobile }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
      <div className="container-fluid">
        {/* Menu hamburger per mobile */}
        {isMobile && (
          <button
            className="btn btn-link text-dark p-2 me-2"
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
          >
            <i className="bi bi-list" style={{ fontSize: '1.5rem' }}></i>
          </button>
        )}

        {/* Titolo pagina */}
        <div className="navbar-brand mb-0 h1 d-none d-md-block">
          Gestione Rendiconti
        </div>
        
        {/* Titolo compatto per mobile */}
        <div className="navbar-brand mb-0 h5 d-md-none">
          Rendiconti
        </div>

        {/* Menu utente */}
        <div className="navbar-nav ms-auto">
          <div className="nav-item dropdown">
            <button
              className="btn btn-link nav-link dropdown-toggle d-flex align-items-center text-decoration-none border-0 bg-transparent"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-circle me-2" style={{ fontSize: '1.2rem' }}></i>
              <span className="d-none d-sm-inline">
                {user?.nome} {user?.cognome}
              </span>
              <span className="d-sm-none">
                {user?.nome}
              </span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow">
              <li>
                <h6 className="dropdown-header text-truncate" style={{ maxWidth: '200px' }}>
                  {user?.email}
                </h6>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="/profilo">
                  <i className="bi bi-person me-2"></i>
                  Profilo
                </a>
              </li>
              <li>
                <button 
                  className="dropdown-item d-flex align-items-center w-100 border-0 bg-transparent text-start"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 