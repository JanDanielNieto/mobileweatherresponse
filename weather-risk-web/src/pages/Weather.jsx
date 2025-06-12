import React, { useEffect, useState, useRef } from "react";

export default function Weather({ initialData, clearInitialData, onSelectLocation }) {
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState(null);
  const [currentLocationName, setCurrentLocationName] = useState("Loading location...");
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHourlyExpanded, setIsHourlyExpanded] = useState(false); // State for hourly forecast collapse
  const [isDailyExpanded, setIsDailyExpanded] = useState(false); // State for daily forecast collapse

  // Ref to store the initialData that was present when the effect ran
  const initialDataSnapshotForCleanup = useRef(null); 

  // Typical values for the Philippines
  const TYPICAL_TEMP_PH = "25-32°C";
  const TYPICAL_WIND_SPEED_PH = "5-15 km/h";

  // Function to interpret WMO weather codes
  const getWeatherDescription = (code) => {
    const descriptions = {
      0: "Clear Sky / Sunny",
      1: "Mainly Clear / Mainly Sunny",
      2: "Partly Cloudy",
      3: "Overcast / Cloudy",
      45: "Fog",
      48: "Depositing Rime Fog", // Rare, keep standard
      51: "Light Drizzle / Ambon",
      53: "Moderate Drizzle / Ambon",
      55: "Heavy Drizzle / Ambon",
      56: "Light Freezing Drizzle", // Rare, keep standard
      57: "Dense Freezing Drizzle", // Rare, keep standard
      61: "Light Rain",
      63: "Moderate Rain",
      65: "Heavy Rain",
      66: "Light Freezing Rain", // Rare, keep standard
      67: "Heavy Freezing Rain", // Rare, keep standard
      71: "Light Snow Fall", // Rare, keep standard
      73: "Moderate Snow Fall", // Rare, keep standard
      75: "Heavy Snow Fall", // Rare, keep standard
      77: "Snow Grains", // Rare, keep standard
      80: "Light Rain Showers",
      81: "Moderate Rain Showers",
      82: "Heavy Rain Showers",
      85: "Light Snow Showers", // Rare, keep standard
      86: "Heavy Snow Showers", // Rare, keep standard
      95: "Thunderstorm", // Widely understood, can be localized further if PAGASA specific terms are preferred for stages
      96: "Thunderstorm with Light Hail", // Hail is rare but possible
      99: "Thunderstorm with Heavy Hail", // Hail is rare but possible
    };
    return descriptions[code] || "Unknown weather condition"; // Changed fallback message slightly
  };

  console.log("Weather.jsx: Rendering. initialData valid:", !!(initialData && initialData.weatherData), "onSelectLocation type:", typeof onSelectLocation, "InitialData:", initialData);

  useEffect(() => {
    // Capture the initialData for this effect's lifecycle
    initialDataSnapshotForCleanup.current = initialData; 

    console.log("Weather.jsx: Effect to process initialData. Current initialData prop is:", initialData);

    if (initialData && initialData.weatherData) {
      setWeather(initialData.weatherData.current_weather || null);
      setHourly(initialData.weatherData.hourly || null);
      // Assuming initialData.weatherData.daily exists and is structured as expected
      // No, setDaily(initialData.weatherData.daily || null) should be here, but daily is not a state yet.
      // We will access initialData.weatherData.daily directly in the render or process it if needed.
      
      let nameToDisplay = `Lat: ${initialData.lat?.toFixed(4)}, Lng: ${initialData.lng?.toFixed(4)}`; // Default fallback

      if (initialData.addressDetails) {
        const ad = initialData.addressDetails;
        const city = ad.city || ad.town || ad.village;
        // Use state or state_district first, then county as a fallback for the broader region
        const region = ad.state || ad.state_district || ad.county; 
        const country = ad.country;

        if (city) {
          nameToDisplay = city;
          if (country && city.toLowerCase() !== country.toLowerCase()) {
            nameToDisplay += `, ${country}`;
          } else if (region && city.toLowerCase() !== region.toLowerCase()) {
            // Add region if different from city and no country was added
            nameToDisplay += `, ${region}`;
          }
        } else if (region) { // No city/town/village, but a region exists
          nameToDisplay = region;
          if (country && region.toLowerCase() !== country.toLowerCase()) {
            nameToDisplay += `, ${country}`;
          }
        } else if (country) { // Only country is known from addressDetails
          nameToDisplay = country;
        }
      }

      // Fallback to parsing locationName if addressDetails didn't yield a good name
      // (i.e., nameToDisplay is still the Lat/Lng default) and locationName is available.
      if (nameToDisplay.startsWith("Lat:") && initialData.locationName) {
        const parts = initialData.locationName.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          // Assumes "City/Region, Country" is often the last two parts.
          // This provides a more general name like "Muntinlupa, Philippines".
          nameToDisplay = `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
        } else if (parts.length === 1) {
          nameToDisplay = parts[0]; // Use the single part if that's all there is
        }
      }
      setCurrentLocationName(nameToDisplay);
      setLoading(false);
      setError(null);
      console.log("Weather.jsx: Processed truthy initialData. Display Location:", nameToDisplay);
    } else {
      console.log("Weather.jsx: initialData is falsy or invalid. Loading default weather (Manila).");
      const defaultLat = 14.5995;
      const defaultLng = 120.9842;
      setCurrentLocationName("Manila, Philippines (Default)");
      setLoading(true); 
      setError(null);
      setWeather(null);
      setHourly(null);

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${defaultLat}&longitude=${defaultLng}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          console.log("Weather.jsx: Fetched default weather data:", data);
          setWeather(data.current_weather || null);
          setHourly(data.hourly || null);
          // Set daily data for default location as well
          // No, setDaily(data.daily || null) here either for the same reason.
          setLoading(false);
        })
        .catch((err) => {
          console.error("Weather.jsx: Failed to fetch default weather data:", err);
          setError("Failed to fetch default weather data.");
          setLoading(false);
        });
    }

    return () => {
      // Use the snapshot captured when this effect instance ran
      const capturedInitialData = initialDataSnapshotForCleanup.current; 
      console.log(
        "Weather.jsx: Unmount cleanup. Captured initialData for this effect instance was:",
        (capturedInitialData && capturedInitialData.weatherData) ? "valid" : "invalid/falsy"
      );

      if (capturedInitialData && capturedInitialData.weatherData) {
        console.log("Weather.jsx: Cleanup: Captured initialData was valid. Calling clearInitialData().");
        if (clearInitialData) { 
            clearInitialData();
        }
      } else {
        console.log("Weather.jsx: Cleanup: Captured initialData was invalid/falsy. Not calling clearInitialData().");
      }
    };
  }, [initialData, clearInitialData]); 

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
            <span className="text-gray-100">{weather.temperature}°C (Typical: {TYPICAL_TEMP_PH})</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-300">Wind Speed:</span>
            <span className="text-gray-100">{weather.windspeed} km/h (Typical: {TYPICAL_WIND_SPEED_PH})</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-300">Condition:</span>
            <span className="text-gray-100">{getWeatherDescription(weather.weathercode)}</span>
          </div>
          {hourly && hourly.precipitation_probability && hourly.precipitation_probability.length > 0 && (
            <div className="flex justify-between">
              <span className="font-semibold text-gray-300">Precipitation Chance:</span>
              {/* Assuming the first entry in hourly.precipitation_probability corresponds to the current or very near forecast */}
              <span className="text-gray-100">{hourly.precipitation_probability[0]}%</span>
            </div>
          )}
        </div>
      ) : (
        !loading && <p className="text-gray-300 text-center">No current weather data available.</p>
      )}
      {hourly && hourly.time && hourly.temperature_2m && (
        <div className="mt-6">
          <button 
            onClick={() => setIsHourlyExpanded(!isHourlyExpanded)}
            className="font-semibold text-lg text-white mb-2 w-full text-left focus:outline-none flex justify-between items-center"
          >
            <span>Hourly Temperature (next 24h)</span>
            <span>{isHourlyExpanded ? 'Hide' : 'Show'}</span>
          </button>
          {isHourlyExpanded && (
            <ul className="text-sm max-h-48 overflow-y-auto bg-gray-700 p-2 rounded">
              {hourly.time.slice(0, 24).map((t, i) => (
                <li key={t + i} className="flex justify-between py-1 border-b border-gray-600 last:border-b-0">
                  <span className="text-gray-300">{new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:</span>
                  <span className="text-gray-100">{hourly.temperature_2m[i]}°C</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Daily Forecast Section */}
      {initialData && initialData.weatherData && initialData.weatherData.daily && (
        <div className="mt-6">
          <button 
            onClick={() => setIsDailyExpanded(!isDailyExpanded)}
            className="font-semibold text-lg text-white mb-2 w-full text-left focus:outline-none flex justify-between items-center"
          >
            <span>Daily Forecast (next {isDailyExpanded ? '7' : '3'} days)</span>
            <span>{isDailyExpanded ? 'Show Less' : 'Show More'}</span>
          </button>
          { (
            <ul className="text-sm bg-gray-700 p-2 rounded space-y-2">
              {initialData.weatherData.daily.time.slice(0, isDailyExpanded ? 7 : 3).map((dateString, i) => {
                const date = new Date(dateString);
                const dayName = date.toLocaleDateString([], { weekday: 'short' });
                const condition = getWeatherDescription(initialData.weatherData.daily.weather_code[i]);
                const maxTemp = initialData.weatherData.daily.temperature_2m_max[i];
                const minTemp = initialData.weatherData.daily.temperature_2m_min[i];
                const precipSum = initialData.weatherData.daily.precipitation_sum ? initialData.weatherData.daily.precipitation_sum[i] : null;

                return (
                  <li key={dateString} className="p-2 border-b border-gray-600 last:border-b-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-200">{dayName}, {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      <span className="text-gray-300 text-xs">{condition}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300">Temp: {minTemp}°C / {maxTemp}°C</span>
                      {precipSum !== null && <span className="text-gray-300">Rain: {precipSum}mm</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Button positioned absolutely at the bottom right */}
      <button
        onClick={() => {
          console.log("Weather.jsx: 'Select New Location' button explicitly clicked OR onSelectLocation called programmatically.");
          if (onSelectLocation) {
            onSelectLocation(null, "weather");
          }
        }}
        className="absolute bottom-0 right-0 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-sm mt-4"
      >
        Select New Location
      </button>
    </div>
  );
}