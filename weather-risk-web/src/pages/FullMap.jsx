import React, { useEffect, useRef, useState } from "react"; // Added useState
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "leaflet-control-geocoder/dist/Control.Geocoder.css"; // Import geocoder CSS
import "leaflet-control-geocoder"; // Adjusted JS import
import EmergencyPanel from "../components/EmergencyPanel"; // Import the new panel
import AnalyticsWidget from "../components/AnalyticsWidget"; // Import Analytics Widget
import WeatherWidget from "../components/WeatherWidget"; // Import Weather Widget
import ContextMenu from "../components/ContextMenu"; // Import ContextMenu
import EmergencyModal from "../components/EmergencyModal"; // Import EmergencyModal
import NearestCentersWidget from "../components/NearestCentersWidget";
import { emergencyData } from "../data/emergencyData"; // Assuming this is where you get your data
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const FULLMAP_EMERGENCY_PINS_KEY = 'fullMapEmergencyPins'; // Standardized key
const THREE_DAYS_MS_FULLMAP = 3 * 24 * 60 * 60 * 1000; // Suffix for clarity

// Fix Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function FullMap({ isPopupOpen }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const geocoderControlRef = useRef(null); // Ref for the geocoder control
  const location = useLocation(); // Get location object
  const geocoderContainerRef = useRef(null); // Ref for the custom geocoder container
  const poiLayerRef = useRef(null); // Layer group for highlighted POIs
  const [searchQuery, setSearchQuery] = useState(''); // For the search input
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [emergencies, setEmergencies] = useState([]);
  const [contextMenu, setContextMenu] = useState({ x: null, y: null, latlng: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLatLng, setModalLatLng] = useState(null); // Separate state for modal's latlng
  const [emergencyDetails, setEmergencyDetails] = useState('');
  const [emergencyType, setEmergencyType] = useState('Flood');
  const [emergencySeverity, setEmergencySeverity] = useState('Moderate');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [centersWidgetOpen, setCentersWidgetOpen] = useState(false);
  const [centersData, setCentersData] = useState(null);
  const [centersWidgetPos, setCentersWidgetPos] = useState({ x: 0, y: 0 });
  const [centersWidgetAnchored, setCentersWidgetAnchored] = useState(false);
  const [centersWidgetAnchorLatLng, setCentersWidgetAnchorLatLng] = useState(null);
  
  // Perform forward geocoding (Nominatim) and center the map
  const handleSearchQuerySubmit = async (query) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      const resp = await fetch(url, { headers: { 'User-Agent': 'weather-risk-web/1.0' } });
      const results = await resp.json();
      if (Array.isArray(results) && results.length > 0) {
        const r = results[0];
        const lat = parseFloat(r.lat);
        const lon = parseFloat(r.lon);
        if (mapRef.current) {
          mapRef.current.setView([lat, lon], 16);
        }
        // Hide any overlay geocoder if visible
        setIsSearchVisible(false);
      } else {
        alert('No results found for that query.');
      }
    } catch (err) {
      console.error('Search failed:', err);
      alert('Search failed. Please try again.');
    }
  };


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
    // Load emergencies from localStorage
    const storedEmergencies = JSON.parse(localStorage.getItem('emergenciesList')) || [];
    const now = Date.now();
    const validEmergencies = storedEmergencies.filter(e => e.timestamp && now - e.timestamp < THREE_DAYS_MS_FULLMAP);
    setEmergencies(validEmergencies);

    const { state } = location; // Destructure state from location

    // Initialize map and geocoder only once, or if mapRef is not set
    if (!mapRef.current) {
      // Add a small delay to ensure DOM is ready and avoid race conditions
      const initializeMap = () => {
        try {
          const mapContainer = document.getElementById("map");
          if (!mapContainer) {
            console.error("Map container not found");
            return;
          }

          // Defensively clear _leaflet_id from the container before map initialization
          if (mapContainer._leaflet_id) {
            delete mapContainer._leaflet_id;
          }

          let initialView = [14.5995, 120.9842]; // Default to Manila
          let initialZoom = 13;

          if (state && state.lat != null && state.lng != null) {
            initialView = [state.lat, state.lng];
            initialZoom = state.zoom || 13;
          }

          const map = L.map("map", {
            zoomControl: true,
            attributionControl: true
          }).setView(initialView, initialZoom);
          mapRef.current = map;

          // Create a layer group for POI highlights
          poiLayerRef.current = L.layerGroup().addTo(map);

          // Reposition anchored widget on map move/zoom
          const updateAnchoredWidgetPosition = () => {
            if (centersWidgetAnchored && centersWidgetAnchorLatLng) {
              const pt = map.latLngToContainerPoint(centersWidgetAnchorLatLng);
              setCentersWidgetPos({ x: pt.x + 12, y: pt.y - 12 });
            }
          };
          map.on('move zoom zoomend moveend', updateAnchoredWidgetPosition);

          // Right-click event listener
          map.on('contextmenu', (e) => {
            e.originalEvent.preventDefault();
            setContextMenu({ x: e.containerPoint.x, y: e.containerPoint.y, latlng: e.latlng });
          });

          // Click event to close context menu
          map.on('click', () => {
            setContextMenu({ x: null, y: null, latlng: null });
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          }).addTo(map);

          // Add a button to toggle the emergency panel
          const emergencyButton = L.control({ position: 'topright' });
          emergencyButton.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            div.innerHTML = `<a href="#" title="View Emergencies" role="button" aria-label="View Emergencies">🚨</a>`;
            div.onmouseenter = (e) => { // Change to onmouseenter
              e.stopPropagation();
              setIsPanelOpen(true);
            };
            // No onclick needed anymore
            return div;
          };
          emergencyButton.addTo(map);

          // Add Geocoder control (check if available)
          if (L.Control.geocoder) {
            const geocoder = L.Control.geocoder({
              defaultMarkGeocode: true,
              placeholder: "Search for a location...",
              collapsed: false,
              errorMessage: "Nothing found.",
              geocoder: L.Control.Geocoder.nominatim()
            }).on('markgeocode', function(e) {
              map.setView(e.geocode.center, 16); // Zoom closer on geocode
              setSearchQuery(e.geocode.name);
              // Hide the geocoder overlay after selecting a location
              setIsSearchVisible(false);
            }).addTo(map); // Add to map initially to ensure it's fully initialized
            geocoderControlRef.current = geocoder;

            // Move geocoder to custom container
            if (geocoderContainerRef.current && geocoder.getContainer()) {
              geocoderContainerRef.current.appendChild(geocoder.getContainer());
            }
          } else {
            console.warn("Leaflet geocoder control not available");
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
              console.warn("Location access denied or unavailable. Showing default location (Manila).");
              L.marker([14.5995, 120.9842]) // Manila coordinates
                .addTo(map)
                .bindPopup('Manila, Philippines')
                .openPopup();
              // Ensure map view is set to Manila if locate failed and wasn't already Manila
              // (initialView was Manila, but locate might have briefly changed it before erroring, though unlikely)
              map.setView([14.5995, 120.9842], 13);
            });
          }

          // Add heatmap layer (check if L.heatLayer is available)
          // if (L.heatLayer) {
          //   const heatData = [
          //     [14.5995, 120.9842, 0.5],
          //     [14.6095, 120.9842, 0.8],
          //     [14.6195, 120.9742, 0.4],
          //     [14.5895, 120.9642, 0.9]
          //   ];
          //   L.heatLayer(heatData, {
          //     radius: 25,
          //     blur: 15,
          //     maxZoom: 17
          //   }).addTo(map);
          // }
          
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
            console.log("[FullMap.jsx] Attempting to load pins from localStorage with key:", FULLMAP_EMERGENCY_PINS_KEY);
            const storedPinsRaw = localStorage.getItem(FULLMAP_EMERGENCY_PINS_KEY);
            if (storedPinsRaw) {
              let storedPins = JSON.parse(storedPinsRaw);
              console.log("[FullMap.jsx] Raw pins from localStorage:", storedPins);
              const now = Date.now();
              const validPins = storedPins.filter(
                (pin) => pin.timestamp && now - pin.timestamp < THREE_DAYS_MS_FULLMAP && pin.lat != null && pin.lng != null
              );
              console.log("[FullMap.jsx] Valid pins after filtering:", validPins);

              localStorage.setItem(FULLMAP_EMERGENCY_PINS_KEY, JSON.stringify(validPins)); // Update with filtered list

              // Define icons for different severities
              const highSeverityIcon = L.icon({
                iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
              });
              const moderateSeverityIcon = L.icon({
                iconUrl: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
              });
              const lowSeverityIcon = L.icon({
                iconUrl: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
              });
              const defaultEmergencyIcon = L.icon({ // Fallback icon
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Default red emergency icon
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -36]
              });

              validPins.forEach(pin => {
                // if (pin.lat != null && pin.lng != null) { // This check is now in the filter
                  let iconToUse = defaultEmergencyIcon;
                  if (pin.severity) {
                    switch (pin.severity.toLowerCase()) {
                      case 'high':
                        iconToUse = highSeverityIcon;
                        break;
                      case 'moderate':
                        iconToUse = moderateSeverityIcon;
                        break;
                      case 'low':
                        iconToUse = lowSeverityIcon;
                        break;
                      default:
                        iconToUse = defaultEmergencyIcon;
                    }
                  }

                  L.marker([pin.lat, pin.lng], { icon: iconToUse })
                    .addTo(map)
                    .bindPopup(`<b>${pin.type || 'N/A'}</b><br>Location: ${pin.fullAddress || pin.city || 'N/A'}<br>Severity: ${pin.severity || 'N/A'}<br>User: ${pin.user || 'Anonymous'}`);
                // }
              });
              console.log("[FullMap.jsx] Finished processing and adding markers for valid pins.");
            } else {
              console.log("[FullMap.jsx] No pins found in localStorage with key:", FULLMAP_EMERGENCY_PINS_KEY);
            }
          } catch (error) {
            console.error("Failed to load or display emergency pins from localStorage on FullMap:", error);
          }

        } catch (error) {
          console.error('Error initializing FullMap:', error);
        }
      };

      // Use setTimeout to ensure DOM is ready
      const timeoutId = setTimeout(initializeMap, 100);

      return () => {
        clearTimeout(timeoutId);
        if (mapRef.current) {
          try {
            mapRef.current.remove();
          } catch (error) {
            console.error('Error removing FullMap:', error);
          }
          mapRef.current = null;
        }
      };

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

  }, [location]); // Re-run if location state changes

  const handleContextMenuClose = () => {
    setContextMenu({ x: null, y: null, latlng: null });
  };

  const handleSearchClick = () => {
    // Ensure geocoder exists; lazily create if needed (overlay, optional)
    if (!geocoderControlRef.current && mapRef.current && L.Control.geocoder) {
      const geocoder = L.Control.geocoder({
        defaultMarkGeocode: true,
        placeholder: "Search for a location...",
        collapsed: false,
        errorMessage: "Nothing found.",
        geocoder: L.Control.Geocoder.nominatim()
      }).on('markgeocode', function(e) {
        mapRef.current.setView(e.geocode.center, 16);
        setSearchQuery(e.geocode.name);
        // Hide overlay geocoder after selection
        setIsSearchVisible(false);
      }).addTo(mapRef.current);
      geocoderControlRef.current = geocoder;
    }

    // Show our overlay container and focus the geocoder input, but keep context menu open
    setIsSearchVisible(true);
    if (geocoderControlRef.current) {
      const container = geocoderControlRef.current.getContainer();
      if (geocoderContainerRef.current && container && container.parentNode !== geocoderContainerRef.current) {
        geocoderContainerRef.current.appendChild(container);
      }
      setTimeout(() => {
        const input = container.querySelector('input');
        if (input) input.focus();
      }, 0);
    }
  };

  const handlePinEmergencyClick = () => {
    if (contextMenu.latlng) {
      setModalLatLng(contextMenu.latlng); // Set the latlng for the modal
      setIsModalOpen(true);
    }
    handleContextMenuClose();
  };

  const handleCenterMapClick = () => {
    if (contextMenu.latlng) {
      mapRef.current.panTo(contextMenu.latlng);
    }
    handleContextMenuClose();
  };

  const handleModalSubmit = async () => {
    if (!modalLatLng) return; // Use the dedicated state for the modal

    const { lat, lng } = modalLatLng;
    
    // Logic to get city name from lat/lng
    let city = 'Unknown Area';
    let fullAddress = 'N/A';
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
      const nominatimResp = await fetch(nominatimUrl, { headers: { 'User-Agent': 'weather-risk-web/1.0' } });
      const nominatimData = await nominatimResp.json();
      city = nominatimData.address.city || nominatimData.address.town || nominatimData.address.village || 'Unknown Area';
      fullAddress = nominatimData.display_name || 'N/A';
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }


    const newEmergency = {
      id: Date.now(),
      type: emergencyType,
      area: city,
      fullAddress: fullAddress, // Store the full address
      severity: emergencySeverity,
      details: emergencyDetails,
      user: 'Anonymous', // Or some identifier if you have one
      lat,
      lng,
      timestamp: Date.now(),
    };

    // Determine icon based on severity
    let iconToUse;
    switch (newEmergency.severity.toLowerCase()) {
        case 'high':
            iconToUse = L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
            break;
        case 'moderate':
            iconToUse = L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
            break;
        case 'low':
            iconToUse = L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
            break;
        default:
            iconToUse = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] });
    }

    // Add to map
    L.marker([lat, lng], { icon: iconToUse })
      .addTo(mapRef.current)
      .bindPopup(`<b>${newEmergency.type}</b><br>Location: ${newEmergency.fullAddress}<br>Severity: ${newEmergency.severity}<br>User: ${newEmergency.user}`)
      .openPopup();

    // --- Update localStorage for Pins ---
    try {
        const existingPins = JSON.parse(localStorage.getItem(FULLMAP_EMERGENCY_PINS_KEY)) || [];
        const updatedPins = [newEmergency, ...existingPins];
        localStorage.setItem(FULLMAP_EMERGENCY_PINS_KEY, JSON.stringify(updatedPins));
        console.log("[FullMap.jsx] New pin saved to localStorage:", newEmergency);
    } catch (error) {
        console.error("Error saving new pin to localStorage:", error);
    }
    
    // --- Update in-memory emergencies for the panel immediately ---
    try {
      setEmergencies((prev) => [newEmergency, ...prev]);
      // Persist a simplified list used by EmergencyPanel
      const existingList = JSON.parse(localStorage.getItem('emergenciesList')) || [];
      const updatedList = [newEmergency, ...existingList];
      localStorage.setItem('emergenciesList', JSON.stringify(updatedList));
      // Open the panel so the user can see it right away
      setIsPanelOpen(true);
    } catch (error) {
      console.error('Error updating emergencies list for panel:', error);
    }
    
    // --- Update localStorage for Analytics ---
    try {
      const historyString = localStorage.getItem('frequentLocationsHistory');
      let history = historyString ? JSON.parse(historyString) : [];
      history.push({ city: city, fullLocationName: fullAddress, timestamp: new Date().toISOString() });
      localStorage.setItem('frequentLocationsHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Error updating localStorage for frequent locations:", error);
    }

    // --- Reset and Close Modal ---
    setIsModalOpen(false);
    setEmergencyDetails('');
    setEmergencyType('Flood');
    setEmergencySeverity('Moderate');
    setModalLatLng(null); // Clear the latlng after submission
  };

  // Haversine distance in KM
  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fetch relevant nearby centers using Overpass API and return grouped data
  const fetchRelevantCentersForEmergency = async (emergency) => {
    if (!mapRef.current || !poiLayerRef.current || !emergency || emergency.lat == null || emergency.lng == null) return;
    const { lat, lng } = emergency;
    const type = (emergency.type || '').toLowerCase();

    // Gather tags across categories; we query all to populate the widget
    const hospitals = ["[amenity=hospital]", "[healthcare=hospital]", "[amenity=clinic]", "[healthcare=clinic]", "[healthcare=centre]"];
    const fireStations = ["[amenity=fire_station]"];
    const shelters = ["[amenity=shelter]", "[emergency=assembly_point]", "[social_facility=shelter]", "[amenity=evacuation_centre]", "[amenity=evacuation_center]"];
    const drrmo = ["[office=government][name~\"(DRRMO|CDRRMO|MDRRMO|Disaster|Rescue|Response)\",i]", "[office=civil_defence]"];
    const allFilters = [hospitals, fireStations, shelters, drrmo];

    // Prefer limiting to what's visible: use viewport bbox when zoomed in, else smaller radius
    const zoom = mapRef.current?.getZoom?.() ?? 14;
    const useViewport = zoom >= 13; // limit to visible area for reasonable zooms
    const bounds = mapRef.current?.getBounds?.();
    const sw = bounds?.getSouthWest?.();
    const ne = bounds?.getNorthEast?.();
    const south = sw?.lat;
    const west = sw?.lng;
    const north = ne?.lat;
    const east = ne?.lng;

    const aroundRadius = 2500; // meters (reduced from 4000 to mitigate server load)
    // Use nwr (nodes/ways/relations) combined to reduce query size and load
    const parts = allFilters.flatMap(group => group.map(f => (
      useViewport && south != null && west != null && north != null && east != null
        ? `nwr${f}(${south},${west},${north},${east});`
        : `nwr${f}(around:${aroundRadius},${lat},${lng});`
    )));
    const outLimit = 50; // reduce element output limit
    const query = `[
      out:json][timeout:60];(
      ${parts.join('\n')}
    );out center ${outLimit};`;
    console.info('[Overpass] Strategy:', useViewport ? 'bbox (visible area)' : `around:${aroundRadius}m`);

    try {
      // Clear previous highlights (even if we're not adding markers anymore)
      poiLayerRef.current.clearLayers();
      const endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://overpass.openstreetmap.fr/api/interpreter',
        'https://overpass.osm.ch/api/interpreter',
        'https://overpass.openstreetmap.ru/api/interpreter'
      ];
      let data = null;
      for (const ep of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutMs = 20000;
          const timeoutId = setTimeout(() => {
            // Provide a clearer abort reason for diagnostics
            try { controller.abort('timeout'); } catch {
              // Older browsers may not support abort reasons; best-effort only
              controller.abort();
            }
          }, timeoutMs);
          const resp = await fetch(`${ep}?data=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'weather-risk-web/1.0' },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (!resp.ok) {
            const status = resp.status;
            const hint = status === 504
              ? 'Gateway Timeout (server overloaded or query too heavy)'
              : status === 429
              ? 'Too Many Requests (rate-limited)'
              : `HTTP ${status}`;
            console.warn('[Overpass] Endpoint responded with', hint, ep);
            continue;
          }
          data = await resp.json();
          if (Array.isArray(data?.elements)) break;
        } catch (e) {
          if (e?.name === 'AbortError') {
            console.warn('[Overpass] Endpoint timed out after', timeoutMs, 'ms:', ep);
          } else {
            console.warn('[Overpass] Endpoint failed:', ep, e?.message || e);
          }
        }
      }
      if (!data) {
        console.warn('All Overpass endpoints failed; proceeding with OTM fallback only');
      }
      const elements = Array.isArray(data?.elements) ? data.elements : [];
      const mapElToItem = (el) => {
        const eLat = el.lat || (el.center && el.center.lat);
        const eLon = el.lon || (el.center && el.center.lon);
        if (eLat == null || eLon == null) return null;
        const tags = el.tags || {};
        const name = tags.name || 'Unnamed';
        const address = [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', ');
        const amenity = tags.amenity || tags.emergency || tags.healthcare || tags.office || '';
        const distanceKm = haversineKm(lat, lng, eLat, eLon);
        return { name, address, amenity, lat: eLat, lon: eLon, distanceKm, tags };
      };

      const items = elements.map(mapElToItem).filter(Boolean);
      const hospitalsList = items.filter(i => i.tags.amenity === 'hospital' || i.tags.healthcare === 'hospital').sort((a,b)=>a.distanceKm-b.distanceKm);
      const fireStationsList = items.filter(i => i.tags.amenity === 'fire_station').sort((a,b)=>a.distanceKm-b.distanceKm);
      const sheltersList = items.filter(i => i.tags.amenity === 'shelter' || i.tags.emergency === 'assembly_point' || i.tags.social_facility === 'shelter').sort((a,b)=>a.distanceKm-b.distanceKm);
      const drrmoList = items.filter(i => i.tags.office === 'government' && /DRRMO|CDRRMO|MDRRMO|Disaster/i.test(i.tags.name || '')).sort((a,b)=>a.distanceKm-b.distanceKm);

      // --- OpenTripMap fallback/supplement ---
      const rawKey = import.meta.env?.VITE_OPENTRIPMAP_API_KEY;
      const otmKey = typeof rawKey === 'string' ? rawKey.replace(/[^A-Za-z0-9]/g, '').trim() : null;
      console.info('[OTM] Key present:', !!otmKey);
      if (rawKey && otmKey && rawKey !== otmKey) {
        console.warn('[OTM] API key contained invalid characters; sanitized for request.');
      }
      const mergeDedup = (list, add) => {
        const seen = new Set(list.map(i => `${i.name}|${i.lat}|${i.lon}`));
        add.forEach(i => {
          const key = `${i.name}|${i.lat}|${i.lon}`;
          if (!seen.has(key)) list.push(i);
        });
        list.sort((a,b)=>a.distanceKm-b.distanceKm);
      };

      if (otmKey) {
        // OTM returns 400 for many direct kinds; fetch general POIs and filter client-side
        const base = 'https://api.opentripmap.com/0.1/en/places/radius';
        let radiusM = aroundRadius;
        if (useViewport && south != null && west != null && north != null && east != null) {
          // Approximate radius that covers the current viewport from the selected emergency point
          const d1 = haversineKm(lat, lng, south, west);
          const d2 = haversineKm(lat, lng, north, east);
          const d3 = haversineKm(lat, lng, south, east);
          const d4 = haversineKm(lat, lng, north, west);
          radiusM = Math.ceil(Math.max(d1, d2, d3, d4) * 1000);
        }

        const parseOtm = (js) => {
          let otmItems = [];
          if (Array.isArray(js?.features)) {
            const feats = js.features;
            otmItems = feats.map(f => {
              const p = f.properties || {};
              const g = f.geometry || {};
              const coords = Array.isArray(g.coordinates) ? g.coordinates : [p.lon, p.lat];
              const eLon = parseFloat(coords[0]);
              const eLat = parseFloat(coords[1]);
              if (isNaN(eLon) || isNaN(eLat)) return null;
              const name = p.name || 'Unnamed';
              const kindsStr = (p.kinds || '').toLowerCase();
              const amenity = kindsStr.includes('fire_station') ? 'fire_station'
                : kindsStr.includes('hospital') ? 'hospital'
                : kindsStr.includes('clinic') ? 'clinic'
                : kindsStr.includes('pharmacy') || kindsStr.includes('drugstore') ? 'pharmacy'
                : kindsStr.includes('shelter') || kindsStr.includes('evacuation') ? 'shelter'
                : kindsStr.includes('government') || kindsStr.includes('town_hall') || kindsStr.includes('city_hall') ? 'government'
                : 'facility';
              const distanceKm = haversineKm(lat, lng, eLat, eLon);
              return { name, address: '', amenity, lat: eLat, lon: eLon, distanceKm, tags: { amenity } };
            }).filter(Boolean);
          } else if (Array.isArray(js)) {
            otmItems = js.map(p => {
              const pt = p.point || {};
              const eLat = parseFloat(pt.lat);
              const eLon = parseFloat(pt.lon);
              if (isNaN(eLon) || isNaN(eLat)) return null;
              const name = p.name || 'Unnamed';
              const kindsStr = (p.kinds || '').toLowerCase();
              const amenity = kindsStr.includes('fire_station') ? 'fire_station'
                : kindsStr.includes('hospital') ? 'hospital'
                : kindsStr.includes('clinic') ? 'clinic'
                : kindsStr.includes('pharmacy') || kindsStr.includes('drugstore') ? 'pharmacy'
                : kindsStr.includes('shelter') || kindsStr.includes('evacuation') ? 'shelter'
                : kindsStr.includes('government') || kindsStr.includes('town_hall') || kindsStr.includes('city_hall') ? 'government'
                : 'facility';
              const distanceKm = haversineKm(lat, lng, eLat, eLon);
              return { name, address: '', amenity, lat: eLat, lon: eLon, distanceKm, tags: { amenity } };
            }).filter(Boolean);
          }
          return otmItems;
        };

        try {
          const urlGJ = `${base}?radius=${radiusM}&lon=${lng}&lat=${lat}&format=geojson&limit=100&apikey=${otmKey}`;
          console.info('[OTM] Fetching (no kinds):', urlGJ);
          let r = await fetch(urlGJ);
          if (!r.ok) {
            const url = `${base}?radius=${radiusM}&lon=${lng}&lat=${lat}&limit=100&apikey=${otmKey}`;
            console.info('[OTM] Fallback fetch (no kinds):', url);
            r = await fetch(url);
          }
          if (r.ok) {
            const js = await r.json();
            const otmAll = parseOtm(js);
            const otmHospitals = otmAll.filter(i => i.amenity === 'hospital' || i.amenity === 'clinic');
            const otmFire = otmAll.filter(i => i.amenity === 'fire_station');
            const otmShelters = otmAll.filter(i => i.amenity === 'shelter');
            const otmGov = otmAll.filter(i => i.amenity === 'government');
            mergeDedup(hospitalsList, otmHospitals);
            mergeDedup(fireStationsList, otmFire);
            mergeDedup(sheltersList, otmShelters);
            mergeDedup(drrmoList, otmGov);
          } else {
            console.warn('[OTM] General fetch failed with status', r.status);
          }
        } catch (err) {
          console.warn('OpenTripMap general fetch failed:', err);
        }
      } else {
        console.info('VITE_OPENTRIPMAP_API_KEY not set; skipping OTM fallback');
      }

      return {
        hospitals: hospitalsList,
        fireStations: fireStationsList,
        shelters: sheltersList,
        drrmo: drrmoList,
      };
    } catch (error) {
      console.error('Failed to fetch nearby centers via Overpass:', error);
      return { hospitals: [], fireStations: [], shelters: [], drrmo: [] };
    }
  };

  const handleSelectEmergency = (emergency) => {
    if (mapRef.current && emergency.lat && emergency.lng) {
      mapRef.current.setView([emergency.lat, emergency.lng], 15);
      setIsPanelOpen(false); // Close panel on selection
      setCentersWidgetOpen(true);
      setCentersData(null);
      // Anchor the widget near the marker
      const latlng = L.latLng(emergency.lat, emergency.lng);
      setCentersWidgetAnchorLatLng(latlng);
      setCentersWidgetAnchored(true);
      const pt = mapRef.current.latLngToContainerPoint(latlng);
      setCentersWidgetPos({ x: pt.x + 12, y: pt.y - 12 });
      fetchRelevantCentersForEmergency(emergency).then((data) => setCentersData(data));
    }
  };

  return (
    <div className={`w-full h-full relative transition-opacity duration-500 ease-in-out ${isPopupOpen ? 'opacity-0' : 'opacity-100'}`}>
      <div id="map" style={{ height: "100%", width: "100%" }}></div>
      {/* Geocoder overlay container (hidden until Search is clicked) */}
      <div
        ref={geocoderContainerRef}
        className={`absolute top-4 left-4 z-[2000] min-w-[320px] pointer-events-auto ${isSearchVisible ? 'block' : 'hidden'}`}
      />
      <AnalyticsWidget isPopupOpen={isPopupOpen} />
      <WeatherWidget map={mapRef.current} isPanelOpen={isPanelOpen} isPopupOpen={isPopupOpen} />
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        onSearch={handleSearchClick}
        map={mapRef.current}
        onSearchResultSelect={(lat, lon) => {
          if (mapRef.current) {
            mapRef.current.setView([lat, lon], 16);
          }
          setIsSearchVisible(false);
        }}
        onSearchQuerySubmit={handleSearchQuerySubmit}
        onPinEmergency={handlePinEmergencyClick}
        onCenterMap={handleCenterMapClick}
        onClose={handleContextMenuClose}
      />
      <NearestCentersWidget
        visible={centersWidgetOpen}
        x={centersWidgetPos.x}
        y={centersWidgetPos.y}
        data={centersData}
        onClose={() => setCentersWidgetOpen(false)}
        onMove={(nx, ny) => { setCentersWidgetPos({ x: nx, y: ny }); setCentersWidgetAnchored(false); }}
        onUnanchor={() => setCentersWidgetAnchored(false)}
        onSelectItem={(it) => {
          if (mapRef.current && it && it.lat != null && it.lon != null) {
            mapRef.current.setView([it.lat, it.lon], 17);
          }
        }}
      />
      <EmergencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        emergencyDetails={emergencyDetails}
        setEmergencyDetails={setEmergencyDetails}
        emergencyType={emergencyType}
        setEmergencyType={setEmergencyType}
        emergencySeverity={emergencySeverity}
        setEmergencySeverity={setEmergencySeverity}
      />
      <div onMouseLeave={() => setIsPanelOpen(false)}> {/* Add mouse leave event to a wrapper */}
        <EmergencyPanel
          emergencies={emergencies}
          isPanelOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          onSearchQuerySubmit={handleSearchQuerySubmit}
          onSelectEmergency={handleSelectEmergency}
        />
      </div>
    </div>
  );
}