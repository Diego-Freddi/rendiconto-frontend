import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const menuItems = [
    {
      path: '/dashboard',
      icon: 'bi-speedometer2',
      label: 'Dashboard'
    },
    {
      path: '/rendiconti',
      icon: 'bi-file-earmark-text',
      label: 'Rendiconti'
    },
    {
      path: '/beneficiari',
      icon: 'bi-people',
      label: 'Beneficiari'
    },
    {
      path: '/categorie',
      icon: 'bi-tags',
      label: 'Categorie'
    },
    {
      path: '/profilo',
      icon: 'bi-person',
      label: 'Profilo'
    }
  ];

  const handleNavClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  // Stili per desktop e mobile
  const sidebarStyles = {
    width: '250px',
    minHeight: '100vh',
    transition: 'transform 0.3s ease-in-out',
    zIndex: isMobile ? 1050 : 'auto',
    position: isMobile ? 'fixed' : 'static',
    transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)'
  };

  return (
    <div 
      className="bg-dark text-white d-flex flex-column"
      style={sidebarStyles}
    >
      {/* Logo/Brand */}
      <div className="p-3 border-bottom border-secondary">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-file-earmark-check me-2"></i>
            Rendiconti
          </h5>
          {/* Bottone chiudi per mobile */}
          {isMobile && (
            <button
              className="btn btn-link text-white p-0"
              onClick={onClose}
              aria-label="Chiudi menu"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="nav flex-column p-3 flex-grow-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `nav-link text-white d-flex align-items-center py-3 px-3 rounded mb-1 text-decoration-none sidebar-nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >
            <i className={`bi ${item.icon} me-3`} style={{ fontSize: '1.1rem' }}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer info */}
      <div className="p-3 border-top border-secondary mt-auto">
        <small className="text-muted d-block">
          Amministratori di Sostegno
        </small>
        <small className="text-muted">
          v2.0
        </small>
      </div>
    </div>
  );
};

export default Sidebar; 