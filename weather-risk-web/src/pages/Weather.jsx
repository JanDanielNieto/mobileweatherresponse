import React, { useEffect, useState } from "react";

export default function Weather({ onSelectLocation }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Example: Manila coordinates
  const latitude = 14.5995;
  const longitude = 120.9842;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.current_weather) {
          setWeather({
            location: "Manila",
            temperature: data.current_weather.temperature,
            windspeed: data.current_weather.windspeed,
            winddirection: data.current_weather.winddirection,
            weathercode: data.current_weather.weathercode,
            time: data.current_weather.time,
          });
        } else {
          setError("No weather data available.");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch weather data.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full relative pb-16">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Weather Forecast
      </h2>
      {loading && <p className="text-gray-300 text-center">Loading...</p>}
      {error && <p className="text-red-400 text-center">{error}</p>}
      {weather && (
        <div className="space-y-4 text-lg">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-300">Location:</span>
            <span className="text-gray-100">{weather.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-300">Temperature:</span>
            <span className="text-gray-100">{weather.temperature}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-300">Windspeed:</span>
            <span className="text-gray-100">{weather.windspeed} km/h</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-300">Wind Direction:</span>
            <span className="text-gray-100">{weather.winddirection}°</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-300">Time:</span>
            <span className="text-gray-100">{weather.time}</span>
          </div>
        </div>
      )}
      {/* Button positioned absolutely at the bottom right */}
      <button
        onClick={() => onSelectLocation && onSelectLocation(null, "weather")}
        className="absolute bottom-0 right-0 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-sm"
      >
        Select Location
      </button>
    </div>
  );
}