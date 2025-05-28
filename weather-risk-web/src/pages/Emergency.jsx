import React, { useState } from 'react'; // Import useState
import { emergencyData } from '../data/emergencyData';

// Accept onSelectEmergency, isRegistered, and navigate props
export default function Emergency({ onSelectEmergency, isRegistered, navigate }) {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleAddEmergencyClick = () => {
    if (isRegistered) {
      onSelectEmergency(null, 'addEmergency'); // Pass null for item, and 'addEmergency' context
      setShowAuthPrompt(false);
    } else {
      setShowAuthPrompt(true);
    }
  };

  return (
    // Add relative positioning and padding-bottom for the absolute button
    <div className="w-full relative pb-20">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Active Emergencies
      </h2>
      <div className="space-y-4">
        {emergencyData.length > 0 ? (
          emergencyData.map((emergency) => (
            <div
              key={emergency.id}
              className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => onSelectEmergency(emergency, 'viewEmergency')} // Pass emergency item and 'viewEmergency' context
            >
              <h3 className="text-xl font-semibold text-red-400 mb-1">
                {emergency.type} - {emergency.area}
              </h3>
              <p className="text-sm text-gray-400 mb-2">Severity: {emergency.severity}</p>
              <p className="text-gray-300">{emergency.details}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No active emergencies reported.</p>
        )}
      </div>

      {/* "Add Emergency" Button and Auth Prompt Area */}
      <div className="absolute bottom-0 right-0 p-4">
        {!showAuthPrompt ? (
          <button
            onClick={handleAddEmergencyClick}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
          >
            Add Emergency
          </button>
        ) : (
          <div className="text-center p-4 bg-gray-700 rounded-lg shadow-md">
            <p className="text-gray-300 text-sm mb-3">
              Please log in or register to add an emergency.
            </p>
            <button
              onClick={() => {
                navigate("/login");
                setShowAuthPrompt(false); // Hide prompt after navigation
              }}
              className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 text-xs mr-2"
            >
              Login
            </button>
            <button
              onClick={() => {
                navigate("/register");
                setShowAuthPrompt(false); // Hide prompt after navigation
              }}
              className="bg-purple-500 text-white px-4 py-1 rounded hover:bg-purple-600 text-xs ml-2"
            >
              Register
            </button>
             <button
              onClick={() => setShowAuthPrompt(false)} // Button to close the prompt
              className="mt-2 text-xs text-gray-400 hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}