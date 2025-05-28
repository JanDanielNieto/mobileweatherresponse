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

export default function FullMap() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  // Placeholder for search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert("Please enter a location to search.");
      return;
    }
    console.log("Searching for:", searchQuery);
    // In a real application, you would use a geocoding service here
    // to get coordinates for the searchQuery and then pan/zoom the map.
    // For example: mapRef.current.setView([lat, lng], 13);
    alert(`Search for "${searchQuery}" initiated. (Geocoding not implemented)`);
  };

  useEffect(() => {
    if (mapRef.current) {
      // If map already exists, remove the old tile layer and add a new one for up-to-date tiles
      mapRef.current.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
          mapRef.current.removeLayer(layer);
        }
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapRef.current);
      return;
    }

    // Initialize the map (Manila coordinates)
    const map = L.map("map").setView([14.5995, 120.9842], 13);
    mapRef.current = map;

    // Add OpenStreetMap tiles (updated in real time)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Add a marker for Manila
    L.marker([14.5995, 120.9842])
      .addTo(map)
      .bindPopup('Manila, Philippines')
      .openPopup();

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

    // Add heatmap layer with updated sample data and options
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

    // --- Weather API Integration ---
    const latitude = 14.3165; // Carmona latitude
    const longitude = 121.0574; // Carmona longitude

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`)
      .then(response => response.json())
      .then(data => {
        console.log('Hourly Temperature Forecast:', data.hourly.temperature_2m);
        // You can use the data here, e.g., show on the map or in a popup
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
      });
    // --- End Weather API Integration ---

  }, []);

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
      <h1 className="text-2xl font-bold text-center mb-2"> {/* Reduced margin-bottom */}
        Emergency Map Overview
      </h1>

      {/* Search Bar Section */}
      <div className="my-4 flex justify-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a location..."
          className="px-4 py-2 w-1/2 rounded-l-md border-0 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
        >
          Search
        </button>
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
