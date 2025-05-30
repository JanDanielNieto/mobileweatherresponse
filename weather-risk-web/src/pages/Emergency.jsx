import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { emergencyData } from '../data/emergencyData';

// Accept onSelectEmergency, isRegistered, and navigate props
export default function Emergency({ onSelectEmergency, isRegistered, navigate, pinnedEmergency }) {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [emergencies, setEmergencies] = useState(emergencyData);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  // Add new pinned emergency if provided
  useEffect(() => {
    if (pinnedEmergency) {
      setEmergencies((prev) => {
        // Prevent duplicate pins for the same lat/lng within a short time
        if (prev.some(e => e.lat === pinnedEmergency.lat && e.lng === pinnedEmergency.lng)) {
          return prev;
        }
        return [
          {
            id: Date.now(),
            type: pinnedEmergency.type,
            area: pinnedEmergency.city,
            severity: pinnedEmergency.severity || 'Moderate',
            details: pinnedEmergency.details || 'User reported emergency.',
            user: pinnedEmergency.user || 'Anonymous',
            lat: pinnedEmergency.lat,
            lng: pinnedEmergency.lng,
          },
          ...prev,
        ];
      });
    }
  }, [pinnedEmergency]);

  const handleAddEmergencyClick = () => {
    if (isRegistered) {
      onSelectEmergency(null, 'addEmergency'); // Pass null for item, and 'addEmergency' context
      setShowAuthPrompt(false);
    } else {
      setShowAuthPrompt(true);
    }
  };

  const handleShowDetail = (emergency) => {
    setSelectedEmergency(emergency);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedEmergency(null);
  };

  return (
    // Add relative positioning and padding-bottom for the absolute button
    <div className="w-full relative pb-20">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Active Emergencies
      </h2>
      <div className="space-y-4">
        {emergencies.length > 0 ? (
          emergencies.map((emergency) => (
            <div
              key={emergency.id}
              className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => handleShowDetail(emergency)}
            >
              <h3 className="text-xl font-semibold text-red-400 mb-1">
                {emergency.type} - {emergency.area}
              </h3>
              <p className="text-sm text-gray-400 mb-2">Severity: {emergency.severity}</p>
              <p className="text-gray-300">{emergency.details}</p>
              {emergency.lat && emergency.lng && (
                <p className="text-xs text-gray-500 mt-1">📍 {emergency.lat.toFixed(4)}, {emergency.lng.toFixed(4)}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No active emergencies reported.</p>
        )}
      </div>

      {/* Emergency Detail Modal/Window */}
      {showDetail && selectedEmergency && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-80 relative">
            <button
              onClick={handleCloseDetail}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-red-400 mb-2">{selectedEmergency.type}</h3>
            <p className="text-gray-300 mb-1"><span className="font-semibold">Location:</span> {selectedEmergency.area}</p>
            <p className="text-gray-300 mb-1"><span className="font-semibold">Severity:</span> {selectedEmergency.severity}</p>
            <p className="text-gray-300 mb-1"><span className="font-semibold">User:</span> {selectedEmergency.user}</p>
            <p className="text-gray-400 mt-2">{selectedEmergency.details}</p>
          </div>
        </div>
      )}

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