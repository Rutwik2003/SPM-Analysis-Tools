import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// Import location hook to check current path

const Navbar: React.FC = () => {
  // Get current location to determine if we're on the report page
  const location = useLocation();
  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-3 mb-3 md:mb-0">
          <img
            src="./komi.png"
            alt="Komi Chibi Logo"
            className="h-10 w-10 rounded-full shadow-md"
          />
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            SPM Calculation Tools
          </h1>
        </div>
        <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-3 md:space-y-0">
          {/* Only show the Report button if we're not already on the report page */}
          {location.pathname !== "/report" && (
            <Link to="/report" className="text-white hover:text-indigo-200 font-medium px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 transition duration-200 shadow-md w-full md:w-auto text-center">
              View Project Report
            </Link>
          )}
          <div className="text-white text-sm">
            <p>Made By Rutwik Butani</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;