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

// Accept context prop
export default function Location({ isRegistered, context }) {
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


    // Initialize the map
    const map = L.map("map").setView([14.5995, 120.9842], 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Custom Geoapify icon
    const customIcon = L.icon({
      iconUrl: "https://api.geoapify.com/v1/icon?type=awesome&color=%2352b74c&size=x-large&icon=tree&noWhiteCircle=true&scaleFactor=2&apiKey=d607abafaa864efbae4af049e4cbbdee",
      iconSize: [62, 92],
      iconAnchor: [31, 92],
      popupAnchor: [0, -92]
    });

    // Add marker with custom icon
    L.marker([14.5995, 120.9842], { icon: customIcon })
      .addTo(map)
      .bindPopup("Custom Geoapify Tree Icon")
      .openPopup();

    // Add heatmap layer with sample data
    const heatData = [
      [14.5995, 120.9842, 0.5],
      [14.6005, 120.9820, 0.8],
      [14.5980, 120.9860, 0.4]
    ];
    L.heatLayer(heatData, { radius: 25 }).addTo(map);

    // Get user's location and add a marker
    map.locate({ setView: true, maxZoom: 16 });

    map.on('locationfound', function(e) {
      L.marker(e.latlng)
        .addTo(map)
        .bindPopup("You are here").openPopup();
    });

    map.on('locationerror', function() {
      alert("Location access denied.");
    });


    // Cleanup map instance on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
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
        const lng = e.latlng.lng;
        try {
          // 1. Reverse geocode to get location name
          const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
          const nominatimResp = await fetch(nominatimUrl, { headers: { 'User-Agent': 'weather-risk-web/1.0' } });
          const nominatimData = await nominatimResp.json();
          const locationName = nominatimData.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;

          // 2. Fetch weather data from Open-Meteo
          const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
          const meteoResp = await fetch(meteoUrl);
          const meteoData = await meteoResp.json();

          // 3. Redirect to Weather page with data
          navigate('/weather', {
            state: {
              locationName,
              lat,
              lng,
              weatherData: meteoData
            }
          });
        } catch (err) {
          alert('Failed to fetch location or weather data.');
        }
        setIsPinning(false);
        mapRef.current.getContainer().style.cursor = '';
        return;
      }
      // Emergency pin logic untouched
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
  }, [isRegistered, isPinning, context, mapRef, navigate]);


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
              id="map"
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