import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet"; // Import Leaflet
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS

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
  const mapRef = useRef(null); // Use a ref to track the map instance

  useEffect(() => {
    // Check if the map is already initialized
    if (mapRef.current) return;

    // Initialize the map
    const map = L.map("map").setView([14.5995, 120.9842], 13); // Example: Manila coordinates
    mapRef.current = map; // Store the map instance in the ref

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Add a marker
    L.marker([14.5995, 120.9842])
      .addTo(map)
      .bindPopup("You are here!")
      .openPopup();
  }, []); // Empty dependency array ensures this runs only once

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
      <h1 className="text-2xl font-bold text-center mb-4">Emergency Map Overview</h1>
      {/* Map container */}
      <div
        id="map"
        style={{ height: "500px", width: "100%" }}
        className="flex-grow bg-gray-700 rounded-lg shadow-md"
      ></div>
    </div>
  );
}