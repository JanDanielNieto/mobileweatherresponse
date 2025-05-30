import React, { useEffect, useState } from "react";

export default function Weather({ initialData, clearInitialData, onSelectLocation }) {
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState(null);
  const [currentLocationName, setCurrentLocationName] = useState("Loading location...");
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialData && initialData.weatherData) {
      setWeather(initialData.weatherData.current_weather || null);
      setHourly(initialData.weatherData.hourly || null);
      setCurrentLocationName(initialData.locationName || `Lat: ${initialData.lat?.toFixed(4)}, Lng: ${initialData.lng?.toFixed(4)}`);
      setLoading(false);
      setError(null);
    } else {
      // Default behavior: Fetch for a default location (e.g., Manila)
      const defaultLat = 14.5995;
      const defaultLng = 120.9842;
      setCurrentLocationName("Manila, Philippines (Default)");
      setLoading(true);
      setError(null);
      setWeather(null); // Clear previous weather data
      setHourly(null);  // Clear previous hourly data

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${defaultLat}&longitude=${defaultLng}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setWeather(data.current_weather || null);
          setHourly(data.hourly || null);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch default weather data:", err);
          setError("Failed to fetch default weather data.");
          setLoading(false);
        });
    }
  }, [initialData]); // Re-run if initialData changes

  // Cleanup effect to clear initialData in Dashboard when Weather component unmounts
  useEffect(() => {
    return () => {
      if (clearInitialData) {
        // Only clear if it was specifically for initialData (pinned)
        // This prevents clearing when just viewing default weather
        if (initialData) {
             clearInitialData();
        }
      }
    };
  }, [clearInitialData, initialData]);

  // ... existing rendering logic ...
  // Ensure the rendering logic below uses currentLocationName, weather, hourly, loading, error states.
  return (
    <div className="w-full relative pb-16">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Weather Forecast
      </h2>
      <div className="text-center text-gray-400 mb-4">
        <span>Location: {currentLocationName}</span>
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
            <span className="text-gray-100">{weather.weathercode}</span> {/* You might want to map this to a description */}
          </div>
        </div>
      ) : (
        !loading && <p className="text-gray-300 text-center">No current weather data available.</p>
      )}
      {hourly && hourly.time && hourly.temperature_2m && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg text-white mb-2">
            Hourly Temperature (next 24h):
          </h3>
          {/* Ensure unique keys if time strings can repeat, though unlikely for this API */}
          <ul className="text-sm max-h-48 overflow-y-auto bg-gray-700 p-2 rounded">
            {hourly.time.slice(0, 24).map((t, i) => (
              <li key={t + i} className="flex justify-between py-1 border-b border-gray-600 last:border-b-0">
                <span className="text-gray-300">{new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:</span>
                <span className="text-gray-100">{hourly.temperature_2m[i]}°C</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Button positioned absolutely at the bottom right */}
      <button
        onClick={() => onSelectLocation && onSelectLocation(null, "weather")}
        className="absolute bottom-0 right-0 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-sm mt-4"
      >
        Select New Location
      </button>
    </div>
  );
}