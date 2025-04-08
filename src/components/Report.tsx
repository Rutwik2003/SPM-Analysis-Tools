import React from 'react';
import { Link } from 'react-router-dom';

const Report: React.FC = () => {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-3 sm:mb-4">SPM Analysis Tools Project Report</h1>
        <Link 
          to="/" 
          className="text-indigo-600 hover:text-indigo-800 mr-4 text-sm sm:text-base"
        >
          ← Back to Application
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-2 sm:p-6 mb-8">
        <iframe 
          src="./SPM_Project_Report.html" 
          title="Project Report" 
          className="w-full h-screen border-0"
          style={{ minHeight: "75vh" }}
        ></iframe>
      </div>
    </div>
  );
};

export default Report;
