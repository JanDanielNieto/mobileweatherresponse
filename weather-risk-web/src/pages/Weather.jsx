import React from "react";
// Import the mock data from the mock folder
import { mockWeather } from "../mock/weatherData.js";

// Accept the onSelectLocation prop
export default function Weather({ onSelectLocation }) {
  // Remove the hardcoded mockWeather object
  // const mockWeather = {
  //   location: "New York",
  //   temperature: 25,
  //   humidity: 60,
  //   condition: "Sunny",
  //   aiPrediction: "Low Risk",
  //   riskScore: 2,
  // };

  return (
    // Use relative positioning on the main container
    <div className="w-full relative pb-16"> {/* Added relative and padding-bottom */}
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Weather Forecast
      </h2>
      {/* The JSX below will now use the imported mockWeather object */}
      <div className="space-y-4 text-lg">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-300">Location:</span>
          <span className="text-gray-100">{mockWeather.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-300">Temperature:</span>
          <span className="text-gray-100">{mockWeather.temperature}°C</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-300">Humidity:</span>
          <span className="text-gray-100">{mockWeather.humidity}%</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-300">Condition:</span>
          <span className="text-gray-100">{mockWeather.condition}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-300">AI Prediction:</span>
          <span className="text-gray-100">{mockWeather.aiPrediction}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-300">Disaster Risk Score:</span>
          <span className="text-gray-100">{mockWeather.riskScore}</span>
        </div>
      </div>

      {/* Button positioned absolutely at the bottom right */}
      <button
        onClick={onSelectLocation} // Call the passed function on click
        className="absolute bottom-0 right-0 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-sm"
      >
        Select Location
      </button>
    </div>
  );
}