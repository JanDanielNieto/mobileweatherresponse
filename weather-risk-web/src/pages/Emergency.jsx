import React, { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'emergenciesList';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

// Keys to access settings from localStorage (must match Account.jsx)
const EMAIL_PROMPTS_STORAGE_KEY = 'emailPromptsActive';
const USER_EMAIL_STORAGE_KEY = 'userEmail';

export default function Emergency({ onSelectEmergency, isRegistered, navigate, pinnedEmergency, onPinnedEmergencyConsumed }) {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [emergencies, setEmergencies] = useState([]);
  const [isListExpanded, setIsListExpanded] = useState(false); // For collapsible list

  // Load emergencies from localStorage on initial mount and filter old ones
  useEffect(() => {
    try {
      const storedEmergenciesRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedEmergenciesRaw) {
        const storedEmergencies = JSON.parse(storedEmergenciesRaw);
        const now = Date.now();
        const validEmergencies = storedEmergencies.filter(
          (e) => e.timestamp && now - e.timestamp < THREE_DAYS_MS
        );
        setEmergencies(validEmergencies);
        // Update localStorage with the filtered list to remove expired ones
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(validEmergencies));
      }
    } catch (error) {
      console.error("Failed to load or parse emergencies from localStorage:", error);
      // Optionally clear corrupted data
      // localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []); // Empty dependency array ensures this runs only on mount

  // Effect to handle new pinned emergencies
  useEffect(() => {
    if (pinnedEmergency) {
      const currentPinnedEmergencyData = {
        id: Date.now(), // Consider a more robust ID if needed
        type: pinnedEmergency.type,
        area: pinnedEmergency.city, // This will be used as [Location]
        severity: pinnedEmergency.severity || 'Moderate',
        details: pinnedEmergency.details || 'User reported emergency.',
        user: pinnedEmergency.user || 'Anonymous',
        lat: pinnedEmergency.lat,
        lng: pinnedEmergency.lng,
        timestamp: Date.now(), // Add timestamp
      };

      setEmergencies((prevEmergencies) => {
        // Prevent adding if an identical emergency (based on lat, lng, type) already exists
        // This de-duplication might need adjustment if timestamps should allow re-pinning
        if (prevEmergencies.some(e => e.lat === currentPinnedEmergencyData.lat && e.lng === currentPinnedEmergencyData.lng && e.type === currentPinnedEmergencyData.type)) {
          return prevEmergencies;
        }
        const updatedEmergencies = [currentPinnedEmergencyData, ...prevEmergencies];
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEmergencies));
        } catch (error) {
          console.error("Failed to save emergencies to localStorage:", error);
        }
        return updatedEmergencies;
      });

      // Attempt to send email alert if prompts are active
      try {
        const promptsActive = JSON.parse(localStorage.getItem(EMAIL_PROMPTS_STORAGE_KEY) || 'false');
        const userEmail = localStorage.getItem(USER_EMAIL_STORAGE_KEY);

        if (promptsActive && userEmail) {
          const emailSubject = `Emergency Alert: ${currentPinnedEmergencyData.type}`;
          const emailBody = `A nearby emergency (${currentPinnedEmergencyData.type}) has been detected near ${currentPinnedEmergencyData.area}. Details: ${currentPinnedEmergencyData.details}`;
          
          console.log("--- SIMULATING EMAIL SEND ---");
          console.log(`To: ${userEmail}`);
          console.log(`Subject: ${emailSubject}`);
          console.log(`Body: ${emailBody}`);
          console.log("-----------------------------");
          // In a real app, you would call your backend/Supabase Edge Function here:
          // await supabase.functions.invoke('send-emergency-alert', {
          //   email: userEmail,
          //   subject: emailSubject,
          //   body: emailBody,
          //   emergencyDetails: currentPinnedEmergencyData // Send more structured data if needed
          // });
        } else {
          if (!promptsActive) console.log("Email prompts are not active. No email sent.");
          if (!userEmail) console.log("User email not found in localStorage. No email sent.");
        }
      } catch (error) {
        console.error("Error processing email alert logic:", error);
      }

      if (onPinnedEmergencyConsumed) {
        onPinnedEmergencyConsumed();
      }
    }
  }, [pinnedEmergency, onPinnedEmergencyConsumed]);

  const handleAddEmergencyClick = () => {
    if (isRegistered) {
      onSelectEmergency(null, 'addEmergency'); // Pass null for item, and 'addEmergency' context
      setShowAuthPrompt(false);
    } else {
      setShowAuthPrompt(true);
    }
  };

  // Renamed and repurposed from handleShowDetail
  const handleViewOnMap = (emergency) => {
    if (emergency && emergency.lat != null && emergency.lng != null) {
      navigate('/map', {
        state: {
          lat: emergency.lat,
          lng: emergency.lng,
          zoom: 16 // Optional: suggest a zoom level
        }
      });
    } else {
      console.warn("Emergency item clicked without valid coordinates:", emergency);
      // Optionally, still show a local detail modal if coordinates are missing, or do nothing.
    }
  };

  const displayEmergencies = emergencies.length > 6 && !isListExpanded 
    ? emergencies.slice(0, 6) 
    : emergencies;

  return (
    <div className="w-full relative pb-20">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Active Emergencies
      </h2>
      <div className="space-y-4">
        {displayEmergencies.length > 0 ? (
          displayEmergencies.map((emergency) => (
            <div
              key={emergency.id}
              className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => handleViewOnMap(emergency)} // Changed to handleViewOnMap
            >
              <h3 className="text-xl font-semibold text-red-400 mb-1">
                {emergency.type} - {emergency.area}
              </h3>
              <p className="text-sm text-gray-400 mb-2">Severity: {emergency.severity}</p>
              <p className="text-gray-300">{emergency.details}</p>
              {emergency.user && <p className="text-xs text-gray-500 mt-1">Reported by: {emergency.user}</p>}
              {emergency.lat && emergency.lng && (
                <p className="text-xs text-gray-500 mt-1">📍 {emergency.lat.toFixed(4)}, {emergency.lng.toFixed(4)}</p>
              )}
              {emergency.timestamp && (
                <p className="text-xs text-gray-600 mt-1">
                  Reported: {new Date(emergency.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No active emergencies reported.</p>
        )}
      </div>

      {emergencies.length > 6 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setIsListExpanded(!isListExpanded)}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {isListExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      )}

      {/* Emergency Detail Modal/Window - This will no longer be triggered by item click. */}
      {/* You might want to remove or repurpose this modal for a different trigger if needed. */}
      {/* {showDetail && selectedEmergency && ( ...modal JSX... )} */}

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