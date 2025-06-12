import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Rileva se siamo su mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="d-flex">
      {/* Overlay per mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="position-fixed w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        isMobile={isMobile}
        onClose={closeSidebar}
      />
      
      {/* Main content */}
      <div className="flex-grow-1">
        {/* Top navbar */}
        <Navbar 
          onToggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />
        
        {/* Page content */}
        <main className="container-fluid p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 