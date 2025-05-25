import React, { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (mapRef.current) return;

    // Initialize the map
    const map = L.map("map").setView([14.5995, 120.9842], 13);
    mapRef.current = map;

    // Add OpenStreetMap tiles
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
      <h1 className="text-2xl font-bold text-center mb-4">
        Emergency Map Overview
      </h1>
      {/* Map container */}
      <div
        id="map"
        style={{ height: "500px", width: "100%" }}
        className="flex-grow bg-gray-700 rounded-lg shadow-md"
      ></div>
    </div>
  );
}
