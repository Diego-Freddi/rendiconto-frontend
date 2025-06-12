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

  return (
    <div 
      className="bg-dark text-white"
      style={{
        width: '250px',
        minHeight: '100vh',
        position: isMobile ? 'fixed' : 'static',
        top: 0,
        left: 0,
        zIndex: 1050,
        transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s ease-in-out'
      }}
    >
      {/* Header con bottone chiusura mobile */}
      <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-file-earmark-check me-2"></i>
          Rendiconti
        </h5>
        {isMobile && (
          <button
            className="btn btn-link text-white p-0"
            onClick={onClose}
            style={{ fontSize: '1.5rem' }}
          >
            <i className="bi bi-x"></i>
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="nav flex-column p-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `nav-link text-white d-flex align-items-center py-2 px-3 rounded mb-1 text-decoration-none ${
                isActive ? 'bg-primary' : ''
              }`
            }
            style={{
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('bg-primary')) {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('bg-primary')) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <i className={`bi ${item.icon} me-3`}></i>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer info */}
      <div className="mt-auto p-3 border-top border-secondary">
        <small className="text-muted">
          Amministratori di Sostegno
        </small>
      </div>
    </div>
  );
};

export default Sidebar; 