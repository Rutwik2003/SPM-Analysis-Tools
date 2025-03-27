import React from 'react';
// Import the chibi logo (you'll need to add this image to your project)

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src="./komi.png"
            alt="Komi Chibi Logo"
            className="h-10 w-10 rounded-full shadow-md"
          />
          <h1 className="text-2xl font-bold text-white tracking-wide">
            SPM Calculation Tools
          </h1>
        </div>
        <div className="text-white text-sm">
          <p>Made By Rutwik Butani</p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;