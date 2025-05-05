import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function FullMap() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white p-4">
       <div className="mb-4">
         <button
            onClick={() => navigate('/dashboard')} // Button to go back to dashboard
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            &larr; Back to Dashboard
          </button>
       </div>
      <h1 className="text-2xl font-bold text-center mb-4">Emergency Map Overview</h1>
      {/* Large Map Placeholder */}
      <div className="flex-grow bg-gray-700 rounded-lg shadow-md flex items-center justify-center">
        <p className="text-gray-400 text-2xl">Full Page Map Placeholder</p>
        {/* Map integration will go here */}
      </div>
    </div>
  );
}
