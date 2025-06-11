import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
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

  return (
    <div className="bg-dark text-white" style={{ width: '250px', minHeight: '100vh' }}>
      {/* Logo/Brand */}
      <div className="p-3 border-bottom border-secondary">
        <h5 className="mb-0">
          <i className="bi bi-file-earmark-check me-2"></i>
          Rendiconti
        </h5>
      </div>

      {/* Menu */}
      <nav className="nav flex-column p-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link text-white d-flex align-items-center py-2 px-3 rounded mb-1 ${
                isActive ? 'bg-primary' : 'hover-bg-secondary'
              }`
            }
            style={{ textDecoration: 'none' }}
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