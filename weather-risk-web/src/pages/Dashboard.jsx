import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Weather from "./Weather";
import Location from "./Location";
import Emergency from "./Emergency";
import MiniMap from "../components/MiniMap";
import SeiaWeatherIcon from "../../public/SeiaWeather.png"; // Import the icon

export default function Dashboard({ isRegistered, setIsRegistered, loggedInUser }) {
  const [activeComponent, setActiveComponent] = useState(null);
  const [activeComponentContext, setActiveComponentContext] = useState(null);
  const [pinnedWeatherData, setPinnedWeatherData] = useState(null); // State for pinned weather data
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsRegistered(false);
    setLoggedInUser(null); // Clear loggedInUser on logout
    localStorage.removeItem('loggedInUser'); // Remove from localStorage
    setActiveComponent(null);
    setActiveComponentContext(null);
    setPinnedWeatherData(null); // Clear pinned data on logout
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
    setPinnedWeatherData(null); // Clear pinned data when clearing component
  };

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
    setActiveComponentContext("pinned"); // Optional: set a specific context
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className="w-1/3 bg-gray-100 dark:bg-gray-800 p-8 flex flex-col justify-between">
        <div> {/* Container for top elements */}
          {/* New SeiaWeather Heading - Make it clickable */}
          <div className="text-center mb-4 cursor-pointer flex items-center justify-center" onClick={() => { setActiveComponent(null); setPinnedWeatherData(null); }}>
            <img src={SeiaWeatherIcon} alt="SeiaWeather Icon" className="h-10 w-10 mr-2" /> {/* Add icon here */}
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 font-serif">SeiaWeather</h1>
          </div>
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
            Dashboard
          </h1>
          <div className="flex flex-col items-center space-y-4"> {/* Reverted to space-y-4 */}
            <button
              className="w-full bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 px-6 py-2 rounded text-base"
              onClick={() => { setActiveComponent("weather"); setActiveComponentContext(null); setPinnedWeatherData(null); }}
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
          {activeComponent === null && <MiniMap />}
          {activeComponent === "weather" && <Weather initialData={pinnedWeatherData} clearInitialData={() => setPinnedWeatherData(null)} onSelectLocation={(item, context) => showLocation(item, context)} />}
          {activeComponent === "location" && <Location isRegistered={isRegistered} context={activeComponentContext} onWeatherLocationPin={handleWeatherLocationPin} />}
          {activeComponent === "emergency" && <Emergency onSelectEmergency={(item, context) => showLocation(item, context)} isRegistered={isRegistered} navigate={navigate} />}
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