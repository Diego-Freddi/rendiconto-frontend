import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-grow-1">
        {/* Top navbar */}
        <Navbar />
        
        {/* Page content */}
        <main className="container-fluid p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 