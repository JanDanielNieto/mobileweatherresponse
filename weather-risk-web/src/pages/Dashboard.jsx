import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Weather from "./Weather";
import Location from "./Location";
import Emergency from "./Emergency";
import MiniMap from "../components/MiniMap";
import SeiaWeatherIcon from "../../public/SeiaWeather.png"; // Import the icon

export default function Dashboard({ isRegistered, setIsRegistered, loggedInUser }) {
  const [activeComponent, setActiveComponent] = useState(null);
  const [activeComponentContext, setActiveComponentContext] = useState(null);
  const [pinnedWeatherData, setPinnedWeatherData] = useState(null);
  const [isFetchingLiveWeather, setIsFetchingLiveWeather] = useState(false);
  const navigate = useNavigate();
  const justSetByViewWeatherClickRef = useRef(false);
  const prevActiveComponentRef = useRef(); // Ref to store previous activeComponent

  useEffect(() => {
    // This effect runs after activeComponent has been updated and the component has re-rendered.
    if (prevActiveComponentRef.current === 'weather' && activeComponent !== 'weather') {
      // We have navigated away from the Weather component.
      if (justSetByViewWeatherClickRef.current) {
        // If the Weather component was showing "live" weather data (ref is true),
        // it means that "live" context is now over.
        // We set the ref to false so that if the Weather component's cleanup runs,
        // it will now be allowed to clear the pinnedWeatherData.
        console.log("Dashboard.jsx: Navigated AWAY from Weather (was live). Setting justSetByViewWeatherClickRef to false.");
        justSetByViewWeatherClickRef.current = false;
      }
    }
    // Update previous active component ref for the next run.
    prevActiveComponentRef.current = activeComponent;
  }, [activeComponent]); // Dependency: only run when activeComponent changes.

  const handleLogout = () => {
    setIsRegistered(false);
    setLoggedInUser(null);
    localStorage.removeItem('loggedInUser');
    setActiveComponent(null);
    setActiveComponentContext(null);
    setPinnedWeatherData(null);
    justSetByViewWeatherClickRef.current = false;
    console.log("Dashboard.jsx: Logout. justSetByViewWeatherClickRef set to false.");
  };

  const showLocation = (item, context) => {
    console.log("Showing location for context:", context, "Item:", item);
    setActiveComponent("location");
    setActiveComponentContext(context);
    // If 'item' exists and context is 'viewEmergency', you might pass 'item' to Location component later
  };

  // Function to clear active component and context, e.g., when navigating away or closing a view
  const clearActiveComponent = () => {
    setActiveComponent(null);
    setActiveComponentContext(null);
    // We don't necessarily clear pinnedWeatherData here,
    // as Weather component's unmount (if it was showing pinned data) would handle it.
    // If we want to explicitly clear it, then: setPinnedWeatherData(null);
    // justSetByViewWeatherClickRef.current = false; // Reset if clearing
  };

  const handleClearPinnedData = useCallback(() => {
    if (justSetByViewWeatherClickRef.current) {
      // If this flag is true, it means the pinnedWeatherData is "fresh" from a
      // live fetch or pin, and Weather component is likely in its Strict Mode
      // unmount/remount cycle. We want to protect the data from being cleared prematurely.
      // The flag will be set to false by other actions (e.g., navigating away from Weather,
      // starting a new live weather fetch, logging out).
      console.log("Dashboard.jsx: handleClearPinnedData - justSetByViewWeatherClickRef is true. IGNORING clear.");
      return; // Do not clear pinnedWeatherData
    }
    console.log("Dashboard.jsx: handleClearPinnedData - justSetByViewWeatherClickRef is false. Clearing pinnedWeatherData.");
    setPinnedWeatherData(null);
  }, [setPinnedWeatherData]); // setPinnedWeatherData is stable

  // Function to handle pinned weather location from Location.jsx
  const handleWeatherLocationPin = (data) => {
    // data contains { locationName, lat, lng, weatherData, addressDetails }
    let city = "Unknown City";
    if (data.addressDetails) {
      city = data.addressDetails.city || data.addressDetails.town || data.addressDetails.village || data.addressDetails.county || data.locationName.split(',')[0] || "N/A";
    } else if (data.locationName) {
      const parts = data.locationName.split(',');
      if (parts.length > 0) {
        city = parts[0].trim(); // Take the first part as a fallback for city
        if (parts.length > 1 && (parts[0].trim().toLowerCase() === "unnamed road" || parts[0].trim().match(/^\d/))) { // if first part is not a good city name
          city = parts[1].trim(); // try the second part
        }
      } else {
        city = data.locationName; // Full name if no comma
      }
    }

    try {
      const historyString = localStorage.getItem('frequentLocationsHistory');
      let history = historyString ? JSON.parse(historyString) : [];
      history.push({
        city: city,
        fullLocationName: data.locationName,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('frequentLocationsHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Error updating localStorage for frequent locations:", error);
    }

    setPinnedWeatherData(data);
    setActiveComponent("weather");
    // setActiveComponentContext("pinned"); // Context for how weather was activated
    if (data) {
        // This signifies that the pinnedWeatherData is fresh and should be protected
        // during Weather component's initial Strict Mode lifecycle.
        justSetByViewWeatherClickRef.current = true;
        console.log("Dashboard.jsx: Location Pinned. justSetByViewWeatherClickRef set to true.");
    }
  };

  const handleViewWeatherClick = () => {
    console.log("View Weather button clicked.");
    setActiveComponent(null); // Clear current component first
    setPinnedWeatherData(null); // Clear any existing pinned data
    setActiveComponentContext(null);
    // Reset the flag at the START of the operation. If fetching fails, it remains false.
    // If successful, it will be set to true before Weather component renders with new data.
    justSetByViewWeatherClickRef.current = false;
    console.log("Dashboard.jsx: handleViewWeatherClick start. justSetByViewWeatherClickRef set to false.");
    setIsFetchingLiveWeather(true);
    console.log("isFetchingLiveWeather set to true");

    if (navigator.geolocation) {
      console.log("Attempting to get geolocation...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log("Geolocation success:", position.coords);
          const { latitude, longitude } = position.coords;
          try {
            console.log(`Fetching reverse geocoding for lat: ${latitude}, lng: ${longitude}`);
            const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
            const nominatimResp = await fetch(nominatimUrl, { headers: { 'User-Agent': 'weather-risk-web/1.0' } });
            const nominatimData = await nominatimResp.json();
            console.log("Nominatim response:", nominatimData);
            const locationName = nominatimData.display_name || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
            const addressDetails = nominatimData.address;

            console.log(`Fetching weather data for ${locationName}`);
            const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;
            const meteoResp = await fetch(meteoUrl);
            const meteoData = await meteoResp.json();
            console.log("Open-Meteo response:", meteoData);

            const weatherPayload = {
              locationName,
              lat: latitude,
              lng: longitude,
              weatherData: meteoData,
              addressDetails,
            };
            console.log("Setting pinnedWeatherData with:", weatherPayload);
            setPinnedWeatherData(weatherPayload);
            console.log("Setting activeComponent to 'weather'");
            setActiveComponent("weather");
            if (weatherPayload) { // Only set flag if we actually got data
                justSetByViewWeatherClickRef.current = true;
                console.log("Dashboard.jsx: Live weather fetched. justSetByViewWeatherClickRef set to true.");
            }
          } catch (err) {
            console.error("Error fetching live weather data (inside try-catch):", err);
            // justSetByViewWeatherClickRef.current remains false (set at start)
            setActiveComponent("weather");
            console.log("Fell back to setting activeComponent to 'weather' after error.");
          }
          setIsFetchingLiveWeather(false);
          console.log("isFetchingLiveWeather set to false (after success/try-catch)");
        },
        (error) => {
          console.error("Geolocation error callback:", error.message, error);
          // justSetByViewWeatherClickRef.current remains false (set at start)
          setActiveComponent("weather");
          setIsFetchingLiveWeather(false);
          console.log("isFetchingLiveWeather set to false (after geolocation error)");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // justSetByViewWeatherClickRef.current remains false (set at start)
      setActiveComponent("weather");
      setIsFetchingLiveWeather(false);
      console.log("isFetchingLiveWeather set to false (geolocation not supported)");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className="w-1/3 bg-gray-100 dark:bg-gray-800 p-8 flex flex-col justify-between">
        <div> {/* Container for top elements */}
          {/* New SeiaWeather Heading - Make it clickable */}
          <div className="text-center mb-4 cursor-pointer flex items-center justify-center" onClick={() => { setActiveComponent(null); setPinnedWeatherData(null); setIsFetchingLiveWeather(false); justSetByViewWeatherClickRef.current = false; console.log("Dashboard.jsx: Header clicked. justSetByViewWeatherClickRef set to false."); }}>
            <img src={SeiaWeatherIcon} alt="SeiaWeather Icon" className="h-10 w-10 mr-2" /> {/* Add icon here */}
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 font-serif">SeiaWeather</h1>
          </div>
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
            Dashboard
          </h1>
          <div className="flex flex-col items-center space-y-4"> {/* Reverted to space-y-4 */}
            <button
              className="w-full bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 px-6 py-2 rounded text-base"
              onClick={handleViewWeatherClick}
            >
              View Weather
            </button>
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 px-6 py-2 rounded text-base"
              onClick={() => navigate('/map')}
            >
              View Full Map
            </button>
            <button
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700 px-6 py-2 rounded text-base"
              onClick={() => { setActiveComponent("emergency"); setActiveComponentContext(null); }}
            >
              View Emergencies
            </button>
            {isRegistered ? (
              <button
                className="w-full bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-700 px-6 py-2 rounded text-base"
                onClick={() => navigate("/account")}
              >
                Account
              </button>
            ) : (
              <button
                className="w-full bg-purple-500 hover:bg-purple-600 text-white dark:bg-purple-600 dark:hover:bg-purple-700 px-6 py-2 rounded text-base"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            )}
          </div>
        </div>
        <div>
          {isRegistered && (
            <button
              className="w-full bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 px-4 py-1.5 rounded text-sm mt-8"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Right Content Area - Now uses flex-col to position welcome message at the bottom */}
      <div className={`w-2/3 bg-blue-50 dark:bg-[#242424] text-blue-900 dark:text-[rgba(255,255,255,0.87)] p-8 flex flex-col transition-colors duration-300`}>
        {/* Main dynamic content area - takes up available space */}
        <div className="flex-grow flex items-center justify-center">
          {isFetchingLiveWeather && <p className="text-lg">Fetching your location and weather...</p>}
          {!isFetchingLiveWeather && activeComponent === null && <MiniMap />}
          {!isFetchingLiveWeather && activeComponent === "weather" && <Weather initialData={pinnedWeatherData} clearInitialData={handleClearPinnedData} onSelectLocation={(item, context) => showLocation(item, context)} />}
          {!isFetchingLiveWeather && activeComponent === "location" && <Location isRegistered={isRegistered} context={activeComponentContext} onWeatherLocationPin={handleWeatherLocationPin} />}
          {!isFetchingLiveWeather && activeComponent === "emergency" && <Emergency onSelectEmergency={(item, context) => showLocation(item, context)} isRegistered={isRegistered} navigate={navigate} />}
        </div>

        {/* Welcome Message - at the bottom of this right content area */}
        {loggedInUser && (
          <div className="pt-4 text-center text-sm text-gray-700 dark:text-gray-300">
            Welcome, {loggedInUser}!
          </div>
        )}
      </div>
    </div>
  );
}