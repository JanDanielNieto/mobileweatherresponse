// filepath: c:\Users\dropt\.vscode\mobileweatherresponse\weather-risk-web\src\pages\Location.jsx
import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Accept isRegistered prop
export default function Location({ isRegistered }) {
  const navigate = useNavigate(); // Initialize navigate

  return (
    <div className="w-full flex flex-col items-center"> {/* Center content */}
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Location Details
      </h2>

      {isRegistered ? (
        <>
          {/* Placeholder Map Box */}
          <div className="w-full max-w-2xl h-96 bg-gray-700 rounded-lg shadow-md mb-6 flex items-center justify-center">
            <p className="text-gray-400 text-xl">Map Placeholder</p>
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
            onClick={() => navigate("/login")} // Navigate to login page
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mr-2"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")} // Navigate to register page
            className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 ml-2"
          >
            Register
          </button>
        </div>
      )}
    </div>
  );
}