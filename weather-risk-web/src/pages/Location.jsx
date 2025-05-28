// filepath: c:\Users\dropt\.vscode\mobileweatherresponse\weather-risk-web\src\pages\Location.jsx
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

export default function Location({ isRegistered }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  useEffect(() => {
    if (!isRegistered) return;
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
  }, [isRegistered]);

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Location Details
      </h2>
      {isRegistered ? (
        <>
          <div className="w-full max-w-2xl h-96 bg-gray-700 rounded-lg shadow-md mb-6 flex items-center justify-center">
            <div
              id="map"
              style={{ height: "100%", width: "100%" }}
              className="rounded-lg"
            ></div>
          </div>
          <p className="text-gray-300 text-lg text-center">
            Detailed location information and map controls will appear here.
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