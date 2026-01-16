// filepath: c:\Users\dropt\.vscode\mobileweatherresponse\weather-risk-web\src\pages\Location.jsx
import React, { useEffect, useRef, useState } from "react"; // Added useState
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// Import marker assets
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { supabase } from "../supabase"; // Import Supabase client

// Fix Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const FULLMAP_EMERGENCY_PINS_KEY = 'fullMapEmergencyPins'; // Standardized key
const THREE_DAYS_MS_LOCATION = 3 * 24 * 60 * 60 * 1000; // Suffix for clarity
const EMAIL_PROMPTS_STORAGE_KEY = 'emailPromptsActive'; // Added
const USER_EMAIL_STORAGE_KEY = 'userEmail'; // Added

// Define icons for different severities (can be moved to a shared utility if used elsewhere)
const highSeverityIcon = L.icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
});
const moderateSeverityIcon = L.icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
});
const lowSeverityIcon = L.icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
});
const defaultEmergencyIcon = L.icon({ // Fallback icon
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Default red emergency icon
    iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36]
});


export default function Location({ onEmergencyPin }) { // Removed onClearAllEmergencies
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyLat, setEmergencyLat] = useState(null);
  const [emergencyLng, setEmergencyLng] = useState(null);
  const [emergencyCity, setEmergencyCity] = useState('');
  const [fullAddress, setFullAddress] = useState(''); // <-- ADDED: State for full address
  const [emergencyType, setEmergencyType] = useState('Flood'); // Default value
  const [emergencySeverity, setEmergencySeverity] = useState('Moderate'); // Default value
  const [emergencyDetails, setEmergencyDetails] = useState('');
  // REMOVED: const [showDevClearButton, setShowDevClearButton] = useState(false); 

  const navigate = useNavigate();
  const mapRef = useRef(null); // To store the map instance
  const [isPinning, setIsPinning] = useState(false); // To track pinning mode
  useEffect(() => {
    if (mapRef.current) { // If map exists, do nothing
        return;
    }

    // Add a small delay to ensure DOM is ready and avoid race conditions
    const initializeMap = () => {
      try {
        const mapContainer = document.getElementById("location-map-container");
        if (!mapContainer) {
          console.error("Map container not found");
          return;
        }

        // Defensively clear _leaflet_id from the container before map initialization
        if (mapContainer._leaflet_id) {
          delete mapContainer._leaflet_id;
        }

        // Initialize the map
        const map = L.map("location-map-container", {
          zoomControl: true,
          attributionControl: true
        }).setView([14.5995, 120.9842], 13);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        // Add heatmap layer with sample data (check if L.heatLayer is available)
        // if (L.heatLayer) {
        //   const heatData = [
        //     [14.5995, 120.9842, 0.5],
        //     [14.6005, 120.9820, 0.8],
        //     [14.5980, 120.9860, 0.4]
        //   ];
        //   L.heatLayer(heatData, { radius: 25 }).addTo(map);
        // }

        // Get user's location and add a marker
        map.locate({ setView: true, maxZoom: 16 });

        map.on('locationfound', function(e) {
          L.marker(e.latlng)
            .addTo(map)
            .bindPopup("You are here").openPopup();
        });

        map.on('locationerror', function() {
          console.warn("Location access denied or unavailable");
          // Don't show alert, just log the warning
        });

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Use setTimeout to ensure DOM is ready
    const timeoutId = setTimeout(initializeMap, 100);

    // Cleanup map instance on component unmount
    return () => {
      clearTimeout(timeoutId);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
        mapRef.current = null;
      }
    };
  }, []); // Initial map setup effect

  // Effect for handling map clicks when pinning
  useEffect(() => {
    if (!isPinning || !mapRef.current) {
      if(mapRef.current && mapRef.current.getContainer() && mapRef.current.getContainer().style.cursor === 'crosshair') { // Added null check for getContainer
        mapRef.current.getContainer().style.cursor = ''; // Reset cursor if not pinning
      }
      return;
    }

    mapRef.current.getContainer().style.cursor = 'crosshair';

    const handleMapClick = async (e) => {
      // Emergency pin logic
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        try {
          // 1. Reverse geocode to get city/location
          const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
          const nominatimResp = await fetch(nominatimUrl, {
            headers: { 'User-Agent': 'weather-risk-web/1.0' }
          });
          const nominatimData = await nominatimResp.json();
          const city = nominatimData.address.city || nominatimData.address.town || nominatimData.address.village || nominatimData.address.county || 'Unknown Area';
          const detailedAddress = nominatimData.display_name || city;
          
          console.log("[Location.jsx] Nominatim display_name:", nominatimData.display_name);
          console.log("[Location.jsx] Determined city:", city);
          console.log("[Location.jsx] detailedAddress to be set for fullAddress:", detailedAddress);

          // Store lat, lng, city and show modal instead of prompting
          setEmergencyLat(lat);
          setEmergencyLng(lng);
          setEmergencyCity(city);
          setFullAddress(detailedAddress); // Set full address state
          setShowEmergencyModal(true);
          // No longer prompting here, so remove old prompt logic.
          // The rest of the logic (marker placement, data saving) will be in handleEmergencySubmit

        } catch (err) {
          console.error('Failed to fetch location for emergency pin:', err);
          alert('Failed to fetch location for emergency pin. Please try again.');
          setIsPinning(false); // Reset pinning state on error
          if (mapRef.current && mapRef.current.getContainer()) {
            mapRef.current.getContainer().style.cursor = '';
          }
        }
        // Do not reset pinning or cursor here, modal will handle it or cancel pinning will.
        return; // Return early as modal will handle the next steps
      };

    mapRef.current.on('click', handleMapClick);

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
        mapRef.current.getContainer().style.cursor = ''; // Ensure cursor is reset
      }
    };
  }, [isPinning, mapRef, navigate, onEmergencyPin]);
  

  const handlePinButtonClick = () => {
    setIsPinning(true);
    // Reset modal fields when starting a new pin action
    setEmergencyType('Flood');
    setEmergencySeverity('Moderate');
    setEmergencyDetails('');
  };

  const handleCancelPinning = () => {
    setIsPinning(false);
    if (mapRef.current && mapRef.current.getContainer()) { // Added null check for getContainer
      mapRef.current.getContainer().style.cursor = ''; // Reset cursor
    }
  };

  // New handler for submitting the emergency modal
  const handleEmergencySubmit = async () => {
    if (emergencyLat === null || emergencyLng === null) {
      alert('Location not set. Please try pinning again.');
      return;
    }

    try {
      // 4. Place a marker for the new emergency
      const emergencyIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Pin-shaped icon
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });
      if (mapRef.current) { // Ensure map is still available
        L.marker([emergencyLat, emergencyLng], { icon: emergencyIcon })
          .addTo(mapRef.current)
          .bindPopup(`<b>${emergencyType}</b><br>Location: ${fullAddress || city}<br>Severity: ${emergencySeverity}${emergencyDetails ? `<br>Details: ${emergencyDetails}` : ''}`)
          .openPopup();
      }

      const emergencyDataForDashboard = {
        type: emergencyType,
        city: emergencyCity,
        fullAddress: fullAddress, 
        severity: emergencySeverity,
        details: emergencyDetails,
        user: 'Anonymous',
        lat: emergencyLat, // Still useful for mapping, just not primary in email
        lng: emergencyLng,   // Still useful for mapping, just not primary in email
      };

      // 5. Pass the new emergency object to the Dashboard (parent)
      if (typeof onEmergencyPin === 'function') {
        onEmergencyPin(emergencyDataForDashboard);
      } else {
        console.warn("onEmergencyPin handler not provided to Location component. Navigating with state as fallback.");
        navigate('/dashboard', {
          state: { pinnedEmergency: emergencyDataForDashboard }
        });
      }

      // ---- ADDED: Save to frequent locations history for analytics ----
      try {
        const historyString = localStorage.getItem('frequentLocationsHistory');
        let history = historyString ? JSON.parse(historyString) : [];
        history.push({
          city: emergencyCity,
          fullLocationName: fullAddress,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('frequentLocationsHistory', JSON.stringify(history));
        console.log("[Location.jsx] Updated frequent locations history for analytics.");
      } catch (error) {
        console.error("Error updating localStorage for frequent locations:", error);
      }
      // ---- END ADDED ----

      // Save pin for FullMap.jsx
      try {
        const fullMapPinData = {
          lat: emergencyLat,
          lng: emergencyLng,
          type: emergencyType,
          severity: emergencySeverity,
          description: emergencyDetails,
          city: emergencyCity, 
          user: 'Anonymous',
          timestamp: Date.now(),
          // Ensure all fields from emergencyDataForDashboard are here if needed by FullMap
          fullAddress: fullAddress, 
        };
        console.log("[Location.jsx] Saving to localStorage with key:", FULLMAP_EMERGENCY_PINS_KEY, "Data:", fullMapPinData);
        const storedPinsRaw = localStorage.getItem(FULLMAP_EMERGENCY_PINS_KEY);
        let storedPins = storedPinsRaw ? JSON.parse(storedPinsRaw) : [];
        const now = Date.now();
        storedPins = storedPins.filter(p => p.timestamp && now - p.timestamp < THREE_DAYS_MS_LOCATION);
        storedPins.push(fullMapPinData);
        localStorage.setItem(FULLMAP_EMERGENCY_PINS_KEY, JSON.stringify(storedPins));
        console.log("[Location.jsx] Successfully saved pins to localStorage:", storedPins);
      } catch (err) {
        console.error("Failed to save emergency pin to localStorage for FullMap:", err);
      }

      // ---- MODIFIED: Send email prompt if active with more logging ----
      try {
        const emailPromptsActiveRaw = localStorage.getItem(EMAIL_PROMPTS_STORAGE_KEY);
        const userEmail = localStorage.getItem(USER_EMAIL_STORAGE_KEY);

        console.log("[EmailDebug] In handleEmergencySubmit:");
        console.log("[EmailDebug] emailPromptsActiveRaw from localStorage:", emailPromptsActiveRaw);
        console.log("[EmailDebug] userEmail from localStorage:", userEmail);

        if (emailPromptsActiveRaw && userEmail && userEmail.trim() !== "") { // Added check for non-empty userEmail
          const emailPromptsActive = JSON.parse(emailPromptsActiveRaw);
          console.log("[EmailDebug] emailPromptsActive (parsed):", emailPromptsActive);

          if (emailPromptsActive) {
            console.log(`[EmailDebug] Conditions met. Attempting to invoke send-emergency-alert for ${userEmail}. Details:`, emergencyDataForDashboard);
            const { data, error } = await supabase.functions.invoke('send-emergency-alert', {
              body: {
                emergencyDetails: emergencyDataForDashboard,
                recipientEmail: userEmail
              }
            });

            if (error) {
              console.error('[EmailDebug] Error invoking send-emergency-alert function:', error);
              // alert('Emergency reported, but there was an issue sending the email alert.');
            } else {
              console.log('[EmailDebug] send-emergency-alert function invoked successfully:', data);
              // alert('Emergency reported and email alert sent!');
            }
          } else {
            console.log("[EmailDebug] Email prompts are not active (parsed as false).");
          }
        } else {
          console.log("[EmailDebug] Email not sent. Conditions not met:");
          if (!emailPromptsActiveRaw) console.log("[EmailDebug] - emailPromptsActiveRaw is missing or falsy.");
          if (!userEmail || userEmail.trim() === "") console.log("[EmailDebug] - userEmail is missing, null, or empty.");
        }
      } catch (emailError) {
        console.error("[EmailDebug] Error during email prompt logic:", emailError);
      }
      // ---- END MODIFIED ----

    } catch (err) {
      console.error('Error submitting emergency details:', err);
      alert('Error submitting emergency details. Please try again.');
    } finally {
      // Reset states and hide modal
      setShowEmergencyModal(false);
      setIsPinning(false);
      if (mapRef.current && mapRef.current.getContainer()) {
        mapRef.current.getContainer().style.cursor = '';
      }
      // Clear lat/lng for next pin
      setEmergencyLat(null);
      setEmergencyLng(null);
      setEmergencyCity('');
      setFullAddress(''); // <-- ADDED: Reset full address state
    }
  };

  const handleModalCancel = () => {
    setShowEmergencyModal(false);
    setIsPinning(false); // Also cancel pinning mode
    if (mapRef.current && mapRef.current.getContainer()) {
      mapRef.current.getContainer().style.cursor = '';
    }
    setEmergencyLat(null);
    setEmergencyLng(null);
    setEmergencyCity('');
    setFullAddress(''); // <-- ADDED: Reset full address state
  };


  return (
    <div className="w-full h-full flex flex-col items-center relative p-4 md:p-0"> {/* Added padding for mobile, h-full */}
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
        Location Details
      </h2>
        <>
          {/* Map container: flex-grow to take available space, responsive height */}
          <div className="w-full flex-grow max-w-3xl h-[300px] sm:h-[400px] md:h-[500px] bg-gray-700 rounded-lg shadow-md mb-4"> 
            <div
              id="location-map-container"
              style={{ height: "100%", width: "100%" }}
              className="rounded-lg"
            ></div>
          </div>

          {/* Emergency Input Modal (remains the same, already a modal) */}
          {showEmergencyModal && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1001] p-4"> {/* Added padding to modal container */}
              <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Report Emergency</h3>
                <div className="mb-3 md:mb-4">
                  <label htmlFor="emergencyType" className="block text-sm font-medium text-gray-300 mb-1">Emergency Type</label>
                  <select
                    id="emergencyType"
                    value={emergencyType}
                    onChange={(e) => setEmergencyType(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                  >
                    <option value="Flood">Flood</option>
                    <option value="Fire">Fire</option>
                    <option value="Earthquake">Earthquake</option>
                  </select>
                </div>
                <div className="mb-3 md:mb-4">
                  <label htmlFor="emergencySeverity" className="block text-sm font-medium text-gray-300 mb-1">Severity</label>
                  <select
                    id="emergencySeverity"
                    value={emergencySeverity}
                    onChange={(e) => setEmergencySeverity(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="mb-3 md:mb-4">
                  <label htmlFor="emergencyDetails" className="block text-sm font-medium text-gray-300 mb-1">Details (Optional)</label>
                  <textarea
                    id="emergencyDetails"
                    value={emergencyDetails}
                    onChange={(e) => setEmergencyDetails(e.target.value)}
                    rows="2" // Reduced rows for smaller screens
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    placeholder="Provide any additional details..."
                  ></textarea>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
                  <button
                    onClick={handleModalCancel}
                    className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500 text-sm md:text-base w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEmergencySubmit}
                    className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 text-sm md:text-base w-full sm:w-auto"
                  >
                    Submit Emergency
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Buttons Area - Adjusted for better mobile layout */}
          <div className="w-full md:absolute md:bottom-4 md:right-4 z-[1000] flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-2 md:mt-0 px-4 md:px-0">
            {!isPinning && (
              <button
                onClick={handlePinButtonClick}
                className="bg-red-500 text-white px-3 py-2 rounded shadow-lg hover:bg-red-600 text-sm w-full sm:w-auto"
              >
                Pin Emergency Location
              </button>
            )}
            {isPinning && (
              <button
                onClick={handleCancelPinning}
                className="bg-gray-500 text-white px-3 py-2 rounded shadow-lg hover:bg-gray-600 text-sm w-full sm:w-auto"
              >
                Cancel Pinning
              </button>
            )}
          </div>
          <p className="text-gray-300 text-xs md:text-sm text-center mt-2 md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2 md:pb-2">
            {isPinning ? `Click on the map to pin an emergency.` : 'Select an action above to interact with the map.'}
          </p>
        </>
    </div>
  );
}