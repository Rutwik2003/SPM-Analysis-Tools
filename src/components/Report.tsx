import React from 'react';
import { Link } from 'react-router-dom';

const Report: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">SPM Analysis Tools Project Report</h1>
        <Link 
          to="/" 
          className="text-indigo-600 hover:text-indigo-800 mr-4"
        >
          ← Back to Application
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <iframe 
          src="/SPM_Project_Report.html" 
          title="Project Report" 
          className="w-full h-screen border-0"
          style={{ minHeight: "800px" }}
        ></iframe>
      </div>
    </div>
  );
};

export default Report;
