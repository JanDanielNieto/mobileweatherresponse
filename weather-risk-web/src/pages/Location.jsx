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

// Fix Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const FULLMAP_PINS_STORAGE_KEY = 'fullMapEmergencyPins'; // Key for FullMap pins
const THREE_DAYS_MS_LOCATION = 3 * 24 * 60 * 60 * 1000; // For consistency

// Accept context and onWeatherLocationPin prop
export default function Location({ isRegistered, context, onWeatherLocationPin, onEmergencyPin, loggedInUser }) {
  const navigate = useNavigate();
  const mapRef = useRef(null); // To store the map instance
  const [isPinning, setIsPinning] = useState(false); // To track pinning mode
  useEffect(() => {
    if (!isRegistered) return;
    if (mapRef.current && !isPinning) { // If map exists and not entering pinning mode, do nothing
        // If context changes and we were pinning, reset
        if (mapRef.current.getContainer().style.cursor === 'crosshair') {
            mapRef.current.getContainer().style.cursor = '';
        }
        return;
    }
    if (mapRef.current && isPinning) { // If map exists and we are pinning
        mapRef.current.getContainer().style.cursor = 'crosshair';
        return; // Don't reinitialize map
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
        if (L.heatLayer) {
          const heatData = [
            [14.5995, 120.9842, 0.5],
            [14.6005, 120.9820, 0.8],
            [14.5980, 120.9860, 0.4]
          ];
          L.heatLayer(heatData, { radius: 25 }).addTo(map);
        }

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
  }, [isRegistered]); // Initial map setup effect

  // Effect for handling map clicks when pinning
  useEffect(() => {
    if (!isRegistered || !isPinning || !mapRef.current) {
      if(mapRef.current && mapRef.current.getContainer().style.cursor === 'crosshair') {
        mapRef.current.getContainer().style.cursor = ''; // Reset cursor if not pinning
      }
      return;
    }

    mapRef.current.getContainer().style.cursor = 'crosshair';

    const handleMapClick = async (e) => {
      if (context === 'weather') {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;        try {
          // 1. Reverse geocode to get location name
          const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
          const nominatimResp = await fetch(nominatimUrl, { 
            headers: { 'User-Agent': 'weather-risk-web/1.0' } 
          });
          const nominatimData = await nominatimResp.json();
          const locationName = nominatimData.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;

          // 2. Fetch weather data from Open-Meteo
          const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;
          const meteoResp = await fetch(meteoUrl);
          const meteoData = await meteoResp.json();

          // 3. Call onWeatherLocationPin with the data instead of navigating
          if (onWeatherLocationPin) {
            onWeatherLocationPin({
              locationName,
              lat,
              lng,
              weatherData: meteoData,
              addressDetails: nominatimData.address // Pass the full address details
            });
          } else {
            // Fallback or error if the handler isn't provided, though it should be by Dashboard
            console.error('onWeatherLocationPin handler not provided to Location component');
            // Optionally, navigate to /weather as a fallback if direct display isn't possible
            navigate('/weather', {
              state: {
                locationName,
                lat,
                lng,
                weatherData: meteoData
              }
            });
          }        } catch (err) {
          console.error('Failed to fetch location or weather data:', err);
          alert('Failed to fetch location or weather data. Please try again.');
        }        setIsPinning(false);
        if (mapRef.current && mapRef.current.getContainer()) { // Check if mapRef.current and container exist
          mapRef.current.getContainer().style.cursor = '';
        }
        return;
      }
      // Emergency pin logic
      if (context === 'addEmergency') {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;        try {
          // 1. Reverse geocode to get city/location
          const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
          const nominatimResp = await fetch(nominatimUrl, { 
            headers: { 'User-Agent': 'weather-risk-web/1.0' } 
          });
          const nominatimData = await nominatimResp.json();
          const city = nominatimData.address.city || nominatimData.address.town || nominatimData.address.village || nominatimData.address.county || 'Unknown Area';

          // 2. Prompt for emergency type
          const type = prompt('Enter emergency type (e.g., Flood, Fire, Earthquake):', 'Flood');
          if (!type) {
            setIsPinning(false);
            mapRef.current.getContainer().style.cursor = '';
            return;
          }

          // 3. Optionally prompt for severity/details
          const severity = prompt('Enter severity (Low, Moderate, High):', 'Moderate');
          const details = prompt('Enter details for this emergency:', '');

          // 4. Place a marker for the new emergency
          const emergencyIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Pin-shaped icon
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36]
          });
          const marker = L.marker([lat, lng], { icon: emergencyIcon })
            .addTo(mapRef.current)
            .bindPopup(`<b>${type}</b><br>${city}<br>Severity: ${severity}`)
            .openPopup();

          const emergencyDataForDashboard = {
            type,
            city,
            severity,
            details,
            user: loggedInUser || (isRegistered ? 'Registered User' : 'Anonymous'),
            lat,
            lng,
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

          // Save pin for FullMap.jsx
          try {
            const fullMapPinData = {
              ...emergencyDataForDashboard, // Includes type, city, severity, user, lat, lng
              timestamp: Date.now()
            };
            const storedPinsRaw = localStorage.getItem(FULLMAP_PINS_STORAGE_KEY);
            let storedPins = storedPinsRaw ? JSON.parse(storedPinsRaw) : [];
            // Filter out old pins before adding new one
            const now = Date.now();
            storedPins = storedPins.filter(p => p.timestamp && now - p.timestamp < THREE_DAYS_MS_LOCATION);
            storedPins.push(fullMapPinData);
            localStorage.setItem(FULLMAP_PINS_STORAGE_KEY, JSON.stringify(storedPins));
          } catch (err) {
            console.error("Failed to save emergency pin to localStorage for FullMap:", err);
          }        } catch (err) {
          console.error('Failed to fetch location for emergency pin:', err);
          alert('Failed to fetch location for emergency pin. Please try again.');
        }
        setIsPinning(false);
        mapRef.current.getContainer().style.cursor = '';
        return;
      }
      // Fallback for other contexts, if needed
      alert(`Pinned for ${context} at ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
      setIsPinning(false); // Exit pinning mode
      mapRef.current.getContainer().style.cursor = ''; // Reset cursor
    };

    mapRef.current.on('click', handleMapClick);

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
        mapRef.current.getContainer().style.cursor = ''; // Ensure cursor is reset
      }
    };
  }, [isRegistered, isPinning, context, mapRef, navigate, onWeatherLocationPin, onEmergencyPin]);


  const handlePinButtonClick = () => {
    if (!isRegistered) return; // Should not happen if buttons are hidden, but good check
    setIsPinning(true);
  };

  const handleCancelPinning = () => {
    setIsPinning(false);
    if (mapRef.current) {
      mapRef.current.getContainer().style.cursor = ''; // Reset cursor
    }
  };


  return (
    <div className="w-full h-full flex flex-col items-center relative"> {/* Added h-full and relative */}
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Location Details
      </h2>
      {isRegistered ? (
        <>
          {/* Ensure map container takes available space */}
          <div className="w-full flex-grow max-w-2xl h-[calc(100%-150px)] bg-gray-700 rounded-lg shadow-md mb-4"> {/* Adjusted height */}
            <div
              id="location-map-container"
              style={{ height: "100%", width: "100%" }}
              className="rounded-lg"
            ></div>
          </div>
          {/* Buttons Area - Positioned absolutely within the parent */}
          <div className="absolute bottom-4 right-4 z-[1000] flex flex-col space-y-2">
            {!isPinning && context === 'weather' && (
              <button
                onClick={handlePinButtonClick}
                className="bg-blue-500 text-white px-3 py-2 rounded shadow-lg hover:bg-blue-600 text-sm"
              >
                Pin Weather Location
              </button>
            )}
            {!isPinning && (context === 'addEmergency' || context === 'viewEmergency') && (
              <button
                onClick={handlePinButtonClick}
                className="bg-red-500 text-white px-3 py-2 rounded shadow-lg hover:bg-red-600 text-sm"
              >
                Pin Emergency Location
              </button>
            )}
            {isPinning && (
              <button
                onClick={handleCancelPinning}
                className="bg-gray-500 text-white px-3 py-2 rounded shadow-lg hover:bg-gray-600 text-sm"
              >
                Cancel Pinning
              </button>
            )}
          </div>
          <p className="text-gray-300 text-sm text-center mt-2">
            {isPinning ? `Click on the map to pin for ${context}.` : 'Map controls will appear here.'}
          </p>
        </>
      ) : (
        <div className="text-center p-6 bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-300 text-lg mb-4">
            Please log in or register to view location details and the map.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mr-2"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 ml-2"
          >
            Register
          </button>
        </div>
      )}
    </div>
  );
}