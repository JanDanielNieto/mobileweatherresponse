import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Weather from "./Weather";
import Location from "./Location";
import Emergency from "./Emergency";

export default function Dashboard({ isRegistered, setIsRegistered }) {
  const [activeComponent, setActiveComponent] = useState(null);
  const [activeComponentContext, setActiveComponentContext] = useState(null); // 'weather', 'viewEmergency', 'addEmergency'
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsRegistered(false);
    setActiveComponent(null);
    setActiveComponentContext(null);
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
  };


  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className="w-1/3 bg-gray-100 p-8 flex flex-col justify-between">
        <div> {/* Container for top elements */}
          {/* New SeiaWeather Heading */}
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold text-blue-600 font-serif">SeiaWeather</h1>
          </div>
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Dashboard
          </h1>
          <div className="flex flex-col items-center space-y-4">
            <button
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full text-base"
              onClick={() => { setActiveComponent("weather"); setActiveComponentContext(null); }}
            >
              View Weather
            </button>
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full text-base"
              onClick={() => navigate('/map')}
            >
              View Full Map
            </button>
             <button
              className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 w-full text-base"
              onClick={() => { setActiveComponent("emergency"); setActiveComponentContext(null); }}
            >
              View Emergencies
            </button>
            {isRegistered ? (
              <button
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 w-full text-base"
                onClick={() => navigate("/account")}
              >
                Account
              </button>
            ) : (
              <button
                className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 w-full text-base"
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
              className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 w-full text-sm mt-8"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className={`w-2/3 bg-blue-50 dark:bg-[#242424] text-blue-900 dark:text-[rgba(255,255,255,0.87)] p-8 flex items-center justify-center transition-colors duration-300`}>
        {activeComponent === "weather" && <Weather onSelectLocation={(item, context) => showLocation(item, context)} />}
        {/* Pass context to Location component */}
        {activeComponent === "location" && <Location isRegistered={isRegistered} context={activeComponentContext} />}
        {activeComponent === "emergency" && <Emergency onSelectEmergency={(item, context) => showLocation(item, context)} isRegistered={isRegistered} navigate={navigate} />}
        {!activeComponent && (
          <div className="text-center text-blue-800 dark:text-gray-400">
            <p>Select an option from the dashboard to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}