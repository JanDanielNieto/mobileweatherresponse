import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Weather from "./Weather";
import Location from "./Location";
import Emergency from "./Emergency"; // Import the Emergency component

export default function Dashboard({ isRegistered, setIsRegistered, theme }) { // Receive theme prop
  const [activeComponent, setActiveComponent] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsRegistered(false);
    setActiveComponent(null);
  };

  // Function to switch the view to Location (used by Weather and Emergency)
  const showLocation = (item) => { // Accept optional item data
    console.log("Showing location, potentially for:", item); // Log which item triggered this
    setActiveComponent("location");
    // Later, you might pass item data to the Location component
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className="w-1/3 bg-gray-100 p-8 flex flex-col justify-between">
        <div> {/* Container for top elements */}
          {/* This should be correct */}
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Dashboard
          </h1>
          <div className="flex flex-col items-center space-y-4">
            <button
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full text-base"
              onClick={() => setActiveComponent("weather")}
            >
              View Weather
            </button>
            {/* Changed: This button now navigates to the full map page */}
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full text-base"
              onClick={() => navigate('/map')} // Navigate to /map route
            >
              View Full Map
            </button>
            {/* Added: Button to view emergencies */}
             <button
              className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 w-full text-base"
              onClick={() => setActiveComponent("emergency")}
            >
              View Emergencies
            </button>

            {/* Conditional Button: Register or Account */}
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
        {/* Logout button */}
         <div> {/* Container for bottom elements (Logout) */}
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
      {/* This area correctly uses theme-based background/text */}
      <div className={`w-2/3 bg-blue-50 dark:bg-[#242424] text-blue-900 dark:text-[rgba(255,255,255,0.87)] p-8 flex items-center justify-center transition-colors duration-300`}>
        {/* Pass the showLocation function to Weather */}
        {activeComponent === "weather" && <Weather onSelectLocation={showLocation} />}
        {/* Pass isRegistered prop to Location */}
        {activeComponent === "location" && <Location isRegistered={isRegistered} />}
        {/* Add Emergency component, pass showLocation as the handler */}
        {activeComponent === "emergency" && <Emergency onSelectEmergency={showLocation} />}
        {!activeComponent && (
          // Adjust placeholder text color for theme
          <div className="text-center text-blue-800 dark:text-gray-400">
            <p>Select an option from the dashboard to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}