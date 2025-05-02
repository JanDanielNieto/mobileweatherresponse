import React from "react";

export default function Weather() {
  const mockWeather = {
    location: "New York",
    temperature: 25,
    humidity: 60,
    condition: "Sunny",
    aiPrediction: "Low Risk",
    riskScore: 2,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Weather Forecast
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Location:</span>
            <span className="text-gray-800">{mockWeather.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Temperature:</span>
            <span className="text-gray-800">{mockWeather.temperature}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Humidity:</span>
            <span className="text-gray-800">{mockWeather.humidity}%</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Condition:</span>
            <span className="text-gray-800">{mockWeather.condition}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">AI Prediction:</span>
            <span className="text-gray-800">{mockWeather.aiPrediction}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Disaster Risk Score:</span>
            <span className="text-gray-800">{mockWeather.riskScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
}