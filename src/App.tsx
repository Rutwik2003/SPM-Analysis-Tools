import React from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProjectForm from './components/ProjectForm';
import PERTCalculator from './components/PERTCalculator';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Toaster position="top-right" />
        <ProjectForm />
      </div>
    </div>
  );
}

export default App;