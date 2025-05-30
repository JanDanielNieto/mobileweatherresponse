import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Weather({ onSelectLocation }) {
  const location = useLocation();
  // Defensive: fallback if navigation state is missing
  const passed = location.state || {};
  const [weather, setWeather] = useState(passed.weatherData?.current_weather || null);
  const [hourly, setHourly] = useState(passed.weatherData?.hourly || null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!passed.weatherData);

  // Use coordinates from navigation state, or default to Manila
  const latitude = passed.lat ?? 14.5995;
  const longitude = passed.lng ?? 120.9842;
  const locationName = passed.locationName ?? `Lat: ${latitude}, Lng: ${longitude}`;

  useEffect(() => {
    if (passed.weatherData) return; // Already have data
    setLoading(true);
    setError(null);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,rain,showers,pressure_msl,wind_speed_120m,wind_speed_180m,wind_direction_120m,temperature_180m,relative_humidity_2m,precipitation_probability,precipitation&current_weather=true`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setWeather(data.current_weather || null);
        setHourly(data.hourly || null);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch weather data.");
        setLoading(false);
      });
  }, [latitude, longitude, passed]);

  // Defensive: fallback UI if weather is null
  return (
    <div className="w-full relative pb-16">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Weather Forecast
      </h2>
      <div className="text-center text-gray-400 mb-4">
        <span>Location: {locationName}</span>
      </div>
      {loading && <p className="text-gray-300 text-center">Loading...</p>}
      {error && <p className="text-red-400 text-center">{error}</p>}
      {weather ? (
        <div className="space-y-4 text-lg">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-300">Temperature:</span>
            <span className="text-gray-100">{weather.temperature}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-300">Wind Speed:</span>
            <span className="text-gray-100">{weather.windspeed} km/h</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-300">Wind Direction:</span>
            <span className="text-gray-100">{weather.winddirection}°</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-300">Weather Code:</span>
            <span className="text-gray-100">{weather.weathercode}</span>
          </div>
        </div>
      ) : (
        !loading && <p className="text-gray-300 text-center">No weather data available.</p>
      )}
      {hourly && hourly.time && hourly.temperature_2m && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg text-white mb-2">
            Hourly Temperature (next 24h):
          </h3>
          <ul className="text-sm max-h-48 overflow-y-auto">
            {hourly.time.slice(0, 24).map((t, i) => (
              <li key={t} className="flex justify-between">
                <span className="text-gray-300">{t}:</span>
                <span className="text-gray-100">{hourly.temperature_2m[i]}°C</span>
              </li>
            ))}
          </ul>
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