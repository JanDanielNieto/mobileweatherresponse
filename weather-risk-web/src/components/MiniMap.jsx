import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import { Icon } from 'leaflet';

const MiniMap = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null); // To store the map instance
  const [currentCityName, setCurrentCityName] = useState("Fetching location...");
  const [fullAddress, setFullAddress] = useState(""); // To store the full address for tooltip or other uses

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const initializeMap = (lat, lon, zoom) => {
        const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([lat, lon], zoom); // Disable default zoom control
        mapInstanceRef.current = map;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18, // Slightly lower maxZoom for a mini-map feel
        }).addTo(map);
        // Add a subtle zoom control if desired, or remove for cleaner look
        // L.control.zoom({ position: 'bottomright' }).addTo(map);
        return map;
      };

      const extractCity = (address) => {
        if (!address) return "Location name not found";
        return address.city || address.town || address.village || address.hamlet || "City not found";
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const map = initializeMap(latitude, longitude, 12); // Zoom out a bit for city view
            L.marker([latitude, longitude], {
              icon: new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })
            }).addTo(map);

            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`)
              .then(response => response.json())
              .then(data => {
                setFullAddress(data?.display_name || "Full address not found");
                setCurrentCityName(extractCity(data?.address));
              })
              .catch(() => {
                setFullAddress("Could not fetch full address");
                setCurrentCityName("Could not fetch city name");
              });
          },
          () => { // Geolocation failed
            setCurrentCityName("Default View");
            setFullAddress("Unable to retrieve your location. Showing default map of London.");
            initializeMap(51.505, -0.09, 9); // Default view (e.g., London)
          }
        );
      } else {
        setCurrentCityName("Default View");
        setFullAddress("Geolocation is not supported. Showing default map of London.");
        initializeMap(51.505, -0.09, 9); // Default view
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once

  return (
    <div className="w-full max-w-xl mx-auto p-3 rounded-xl shadow-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center">
      <h3 className="text-2xl font-bold mb-3 text-center text-blue-600 dark:text-blue-400">
        {currentCityName}
      </h3>
      <div 
        ref={mapContainerRef} 
        style={{ height: '350px', borderRadius: '12px', width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} 
        title={fullAddress} // Show full address on hover of the map
      />
      {/* Optional: Display full address or a note below the map */}
      {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">{fullAddress}</p> */}
    </div>
  );
};

export default MiniMap;
