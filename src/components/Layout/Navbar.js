import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container-fluid">
        {/* Titolo pagina */}
        <div className="navbar-brand mb-0 h1">
          Gestione Rendiconti
        </div>

        {/* Menu utente */}
        <div className="navbar-nav ms-auto">
          <div className="nav-item dropdown">
            <button
              className="btn btn-link nav-link dropdown-toggle d-flex align-items-center"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-circle me-2"></i>
              {user?.nome} {user?.cognome}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <h6 className="dropdown-header">
                  {user?.email}
                </h6>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item" href="/profilo">
                  <i className="bi bi-person me-2"></i>
                  Profilo
                </a>
              </li>
              <li>
                <button 
                  className="dropdown-item" 
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