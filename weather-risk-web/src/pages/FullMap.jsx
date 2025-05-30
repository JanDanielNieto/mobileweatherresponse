import React, { useEffect, useRef, useState } from "react"; // Added useState
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "leaflet-control-geocoder/dist/Control.Geocoder.css"; // Import geocoder CSS
import "leaflet-control-geocoder"; // Adjusted JS import

// Import marker assets
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const FULLMAP_PINS_STORAGE_KEY_FM = 'fullMapEmergencyPins'; // Use the same key as in Location.jsx
const THREE_DAYS_MS_FM = 3 * 24 * 60 * 60 * 1000;

// Fix Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function FullMap() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const geocoderControlRef = useRef(null); // Ref for the geocoder control
  const location = useLocation(); // Get location object
  const geocoderContainerRef = useRef(null); // Ref for the custom geocoder container

  // Placeholder for search functionality (will be largely replaced by geocoder)
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert("Please enter a location to search.");
      return;
    }
    // Trigger geocoding via the control if needed, though direct interaction with input is typical
    if (geocoderControlRef.current) {
      // This is a simplified way to trigger; typically, the control handles its own input.
      // We might not even need this explicit handleSearch if the control is set up correctly.
      console.log("Attempting to use geocoder for:", searchQuery);
      // The geocoder control itself handles the search and updates the map.
      // We'll focus on integrating the control directly.
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      // The geocoder control should ideally handle enter press on its own input.
      // If we are using a separate input, we would call handleSearch or directly interact with geocoder.
      // For now, let's assume the geocoder's input field will handle this.
      // If we were to keep our custom input, we'd call handleSearch() here.
    }
  };

  useEffect(() => {
    const { state } = location; // Destructure state from location

    // Initialize map and geocoder only once, or if mapRef is not set
    if (!mapRef.current) {
      let initialView = [14.5995, 120.9842]; // Default to Manila
      let initialZoom = 13;

      if (state && state.lat != null && state.lng != null) {
        initialView = [state.lat, state.lng];
        initialZoom = state.zoom || 13;
      }

      const map = L.map("map").setView(initialView, initialZoom);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Add Geocoder control
      const geocoder = L.Control.geocoder({
        defaultMarkGeocode: true,
        placeholder: "Search for a location...",
        collapsed: false,
        errorMessage: "Nothing found.",
        geocoder: L.Control.Geocoder.nominatim()
      }).on('markgeocode', function(e) {
        map.setView(e.geocode.center, 16); // Zoom closer on geocode
        setSearchQuery(e.geocode.name);
      }).addTo(map); // Add to map initially to ensure it's fully initialized
      geocoderControlRef.current = geocoder;

      // Move geocoder to custom container
      if (geocoderContainerRef.current && geocoder.getContainer()) {
        geocoderContainerRef.current.appendChild(geocoder.getContainer());
      }

      // Marker Logic: Handles pinned location, user's current location, or Manila as a fallback.
      if (state && state.lat != null && state.lng != null) {
        // Case 1: Location passed via state (e.g., from Emergency page)
        // The map's initial view is already set to this location by setView above.
        L.marker([state.lat, state.lng])
          .addTo(map)
          .bindPopup(state.popupMessage || 'Pinned Location')
          .openPopup();
      } else {
        // Case 2: No specific location passed via state. Try to get user's current location.
        // The map's initial view is default (Manila), map.locate will try to update it.
        map.locate({ setView: true, maxZoom: 16 }); // setView: true will pan to user's location if found.

        map.on('locationfound', function(e) {
          // User's location found
          L.marker(e.latlng)
            .addTo(map)
            .bindPopup("You are here")
            .openPopup();
          // map view is handled by map.locate's setView: true option
        });

        map.on('locationerror', function() {
          // User's location not found or access denied
          // alert("Location access denied. Showing default location (Manila)."); // Optional: inform user
          L.marker([14.5995, 120.9842]) // Manila coordinates
            .addTo(map)
            .bindPopup('Manila, Philippines')
            .openPopup();
          // Ensure map view is set to Manila if locate failed and wasn't already Manila
          // (initialView was Manila, but locate might have briefly changed it before erroring, though unlikely)
          map.setView([14.5995, 120.9842], 13);
        });
      }

      // Add heatmap layer (existing logic)
      const heatData = [
        [14.5995, 120.9842, 0.5],
        [14.6095, 120.9842, 0.8],
        [14.6195, 120.9742, 0.4],
        [14.5895, 120.9642, 0.9]
      ];
      L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17
      }).addTo(map);
      
      // --- Weather API Integration ---
      const latitude = 14.3165; // Carmona latitude
      const longitude = 121.0574; // Carmona longitude

      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`)
        .then(response => response.json())
        .then(data => {
          console.log('Hourly Temperature Forecast:', data.hourly.temperature_2m);
        })
        .catch(error => {
          console.error('Error fetching weather data:', error);
        });
      // --- End Weather API Integration ---

      // Load and display emergency pins from localStorage
      try {
        const storedPinsRaw = localStorage.getItem(FULLMAP_PINS_STORAGE_KEY_FM);
        if (storedPinsRaw) {
          let storedPins = JSON.parse(storedPinsRaw);
          const now = Date.now();
          const validPins = storedPins.filter(
            (pin) => pin.timestamp && now - pin.timestamp < THREE_DAYS_MS_FM
          );

          localStorage.setItem(FULLMAP_PINS_STORAGE_KEY_FM, JSON.stringify(validPins));

          const emergencyIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36]
          });

          validPins.forEach(pin => {
            if (pin.lat != null && pin.lng != null) {
              L.marker([pin.lat, pin.lng], { icon: emergencyIcon })
                .addTo(map)
                .bindPopup(`<b>${pin.type || 'N/A'}</b><br>Location: ${pin.city || 'N/A'}<br>Severity: ${pin.severity || 'N/A'}<br>User: ${pin.user || 'N/A'}`);
            }
          });
        }
      } catch (error) {
        console.error("Failed to load or display emergency pins from localStorage on FullMap:", error);
      }

    } else { // Map already initialized, handle view changes if any
      if (state && state.lat != null && state.lng != null) {
        mapRef.current.setView([state.lat, state.lng], state.zoom || 13);
      }
      // Ensure geocoder is in the correct custom container if map re-renders/updates
      // This might be needed if React re-renders and the DOM structure is affected.
      // However, moving it once should be sufficient if the container itself is stable.
      if (geocoderControlRef.current && geocoderContainerRef.current && geocoderControlRef.current.getContainer()) {
        if (geocoderControlRef.current.getContainer().parentNode !== geocoderContainerRef.current) {
           geocoderContainerRef.current.appendChild(geocoderControlRef.current.getContainer());
        }
      }
    }

  }, [location]); // Add location to dependency array

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white p-4">
      <div className="mb-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          &larr; Back to Dashboard
        </button>
      </div>
      <h1 className="text-2xl font-bold text-center mb-2">
        Emergency Map Overview
      </h1>

      {/* Custom container for the Geocoder - centered and with adjusted width */}
      <div 
        ref={geocoderContainerRef} 
        id="custom-geocoder-container" 
        className="mb-4 flex justify-center w-full md:w-1/2 lg:w-1/3 mx-auto"
      >
        {/* The geocoder control will be appended here by useEffect */}
      </div>

      {/* Map container */}
      <div
        id="map"
        style={{ height: "500px", width: "100%" }}
        className="flex-grow bg-gray-700 rounded-lg shadow-md"
      ></div>
    </div>
  );
}
