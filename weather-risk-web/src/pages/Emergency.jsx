import React, { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'emergenciesList';
const FULLMAP_EMERGENCY_PINS_KEY = 'fullMapEmergencyPins'; // Key for FullMap pins
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

// Keys to access settings from localStorage (must match Account.jsx)
const EMAIL_PROMPTS_STORAGE_KEY = 'emailPromptsActive';
// const USER_EMAIL_STORAGE_KEY = 'userEmail'; // No longer needed for sending to admin
const ADMIN_PROMPT_EMAIL_STORAGE_KEY = 'adminPromptEmail'; // Key for admin's dedicated prompt email

export default function Emergency({ onSelectEmergency, navigate, pinnedEmergency, onPinnedEmergencyConsumed, clearTrigger, onDevClearAllRequest }) { // Added isAdmin
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [emergencies, setEmergencies] = useState([]);
  const [isListExpanded, setIsListExpanded] = useState(false); // For collapsible list
  // REMOVED: const [showDevClearButton, setShowDevClearButton] = useState(false); 

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

  // Effect to clear emergencies when clearTrigger changes
  useEffect(() => {
    if (clearTrigger > 0) { // Check if it's not the initial state (0)
      console.log("[Emergency.jsx] Clear trigger received. Clearing emergencies.");
      setEmergencies([]);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        console.log("[Emergency.jsx] Cleared emergencies from localStorage due to trigger.");
      } catch (error) {
        console.error("[Emergency.jsx] Failed to clear emergencies from localStorage:", error);
      }
      // Optionally, if you want to inform the user or reset other states here, you can.
      // For example, if there was a selectedEmergency, you might want to clear it.
    }
  }, [clearTrigger]);

  // REMOVED: Effect for Ctrl+Alt+P to show dev button (now controlled by isAdmin prop)

  // Effect to handle new pinned emergencies
  useEffect(() => {
    if (pinnedEmergency) {
      const currentPinnedEmergencyData = {
        id: Date.now(),
        type: pinnedEmergency.type,
        area: pinnedEmergency.city,
        severity: pinnedEmergency.severity || 'Moderate',
        details: pinnedEmergency.details || 'User reported emergency.',
        user: pinnedEmergency.user || 'Anonymous',
        lat: pinnedEmergency.lat,
        lng: pinnedEmergency.lng,
        timestamp: Date.now(),
      };

      setEmergencies((prevEmergencies) => {
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

      // Email alert logic
      try {
        const reportingUserIsAdmin = false; // Prop indicating if the current user pinning the emergency is an admin
        let targetEmail = null;
        let sendEmail = false;
        let emailSubject = ``;
        let emailBody = ``;

        if (!reportingUserIsAdmin) {
          // A REGULAR USER is reporting: always send to admin's designated email
          targetEmail = localStorage.getItem(ADMIN_PROMPT_EMAIL_STORAGE_KEY) || 'seiaweatherapp@gmail.com';
          sendEmail = true;
          console.log(`User '${currentPinnedEmergencyData.user}' reported emergency. Notifying admin at: ${targetEmail}`);
          emailSubject = `New Emergency Reported by User: ${currentPinnedEmergencyData.type}`;
          emailBody = `A new emergency (${currentPinnedEmergencyData.type}) has been reported by user '${currentPinnedEmergencyData.user}' in/near ${currentPinnedEmergencyData.area}.\nDetails: ${currentPinnedEmergencyData.details}\nCoordinates: ${currentPinnedEmergencyData.lat}, ${currentPinnedEmergencyData.lng}`;
        } else {
          // AN ADMIN is reporting: send to their own configured email IF their prompts are active
          const adminPromptsActive = JSON.parse(localStorage.getItem(EMAIL_PROMPTS_STORAGE_KEY) || 'false');
          if (adminPromptsActive) {
            targetEmail = localStorage.getItem(ADMIN_PROMPT_EMAIL_STORAGE_KEY); // Admin's own email for prompts
            if (targetEmail) {
              sendEmail = true;
              console.log(`Admin '${currentPinnedEmergencyData.user}' reported emergency. Notifying self (admin) at: ${targetEmail} as their prompts are active.`);
              emailSubject = `Admin Reported Emergency: ${currentPinnedEmergencyData.type}`;
              emailBody = `Admin '${currentPinnedEmergencyData.user}' reported an emergency (${currentPinnedEmergencyData.type}) in/near ${currentPinnedEmergencyData.area}.\nDetails: ${currentPinnedEmergencyData.details}\nCoordinates: ${currentPinnedEmergencyData.lat}, ${currentPinnedEmergencyData.lng}`;
            } else {
              console.log("Admin reported emergency and their prompts are active, but no admin prompt email is configured in localStorage. No email sent.");
            }
          } else {
            console.log("Admin reported emergency, but their email prompts are not active. No email sent.");
          }
        }

        if (sendEmail && targetEmail) {
          console.log("--- SIMULATING EMAIL SEND ---");
          console.log(`To: ${targetEmail}`);
          console.log(`Subject: ${emailSubject}`);
          console.log(`Body: ${emailBody}`);
          console.log("-----------------------------");
          // In a real app, you would call your backend/Supabase Edge Function here:
          // await supabase.functions.invoke('send-emergency-alert', {
          //   email: targetEmail,
          //   subject: emailSubject,
          //   body: emailBody,
          //   emergencyDetails: currentPinnedEmergencyData
          // });
        } else {
          if (!targetEmail && sendEmail) {
            console.log("Email sending was intended, but the target email address was not determined or was empty.");
          }
          // Other specific console logs for why email might not be sent are handled in the conditional blocks above.
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
    onSelectEmergency(null, 'addEmergency'); // Pass null for item, and 'addEmergency' context
    setShowAuthPrompt(false);
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

  const handleDevClearAll = () => {
    if (typeof onDevClearAllRequest === 'function') {
      onDevClearAllRequest(); // Call the function passed from Dashboard
    }
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clears 'emergenciesList'
      localStorage.removeItem(FULLMAP_EMERGENCY_PINS_KEY); // Also clear 'fullMapEmergencyPins'
      console.log("[Admin Emergency.jsx] Cleared emergenciesList and fullMapEmergencyPins from localStorage.");
      setEmergencies([]); // Clear component state as well
    } catch (error) {
      console.error("[Admin Emergency.jsx] Failed to clear all emergency data from localStorage:", error);
    }
    alert('All emergency data clear request sent. Emergency list and map pins should be cleared.');
  };

  const handleDeleteOneEmergency = (emergencyId) => {
    setEmergencies(prevEmergencies => {
      const updatedEmergencies = prevEmergencies.filter(e => e.id !== emergencyId);
      const emergencyToDelete = prevEmergencies.find(e => e.id === emergencyId);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEmergencies));
        console.log(`[Emergency.jsx] Deleted emergency ${emergencyId} and updated localStorage (emergenciesList).`);

        // Now, also update fullMapEmergencyPins in localStorage
        const storedFullMapPinsRaw = localStorage.getItem(FULLMAP_EMERGENCY_PINS_KEY);
        if (storedFullMapPinsRaw && emergencyToDelete) {
          let storedFullMapPins = JSON.parse(storedFullMapPinsRaw);
          // Filter out the deleted emergency based on properties like lat, lng, and type, 
          // as IDs might not be perfectly synced or might not exist in fullMapEmergencyPins.
          // This assumes that lat, lng, and type are reliable identifiers for matching.
          const updatedFullMapPins = storedFullMapPins.filter(pin => 
            !(pin.lat === emergencyToDelete.lat && 
              pin.lng === emergencyToDelete.lng && 
              pin.type === emergencyToDelete.type &&
              pin.user === emergencyToDelete.user) // Added user to make it more specific
          );
          localStorage.setItem(FULLMAP_EMERGENCY_PINS_KEY, JSON.stringify(updatedFullMapPins));
          console.log(`[Emergency.jsx] Updated fullMapEmergencyPins in localStorage after deleting emergency ${emergencyId}.`);
        }
      } catch (error) {
        console.error("[Emergency.jsx] Failed to update localStorage after deleting one emergency:", error);
      }
      return updatedEmergencies;
    });
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
              className="bg-gray-800 p-4 rounded-lg shadow-md relative group" // Added relative and group for X button positioning
            >
              {/* Admin-only features are now hidden */}
              <div onClick={() => handleViewOnMap(emergency)} className="cursor-pointer"> {/* Made inner content clickable */}
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

      {/* "Add Emergency" Button and Auth Prompt Area */}
      <div className="absolute bottom-0 right-0 p-4 flex flex-col items-end space-y-2">
        {/* Admin Clear All Button - Renders above Add Emergency button if admin and registered */}
        {/* Admin-only features are now hidden */}

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