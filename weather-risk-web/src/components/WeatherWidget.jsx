import React, { useState, useEffect } from 'react';

const WeatherWidget = ({ map, isPanelOpen, isPopupOpen }) => {
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState('Map Center');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isPopupOpen) {
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isPopupOpen]);

  useEffect(() => {
    if (!map) return;

    const fetchWeather = async () => {
      const center = map.getCenter();
      const { lat, lng } = center;

      try {
        // Fetch location name
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
        const nominatimResp = await fetch(nominatimUrl, { headers: { 'User-Agent': 'weather-risk-web/1.0' } });
        const nominatimData = await nominatimResp.json();
        setLocationName(nominatimData.display_name.split(',')[0] || 'Unknown Area');

        // Fetch weather data
        const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&timezone=auto`;
        const meteoResp = await fetch(meteoUrl);
        const meteoData = await meteoResp.json();
        setWeather(meteoData.current_weather);
      } catch (error) {
        console.error("Failed to fetch weather for map center:", error);
        setWeather(null);
      }
    };

    // Use a timeout to debounce the moveend event
    let timer;
    const onMoveEnd = () => {
      clearTimeout(timer);
      timer = setTimeout(fetchWeather, 500); // Debounce for 500ms
    };

    map.on('moveend', onMoveEnd);
    fetchWeather(); // Initial fetch

    return () => {
      map.off('moveend', onMoveEnd);
      clearTimeout(timer);
    };
  }, [map]);

  return (
    <div className={`absolute top-4 bg-gray-800 bg-opacity-80 p-4 rounded-lg shadow-lg z-[1000] w-64 transition-all duration-500 ease-in-out ${isVisible ? (isPanelOpen ? 'right-1/3 mr-4' : 'right-16') : '-right-full'} ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <h3 className="text-white text-lg font-bold mb-2">Current Weather</h3>
      {weather ? (
        <div>
          <p className="text-white font-semibold">{locationName}</p>
          <p className="text-white text-4xl">{weather.temperature}°C</p>
          <p className="text-white">Wind: {weather.windspeed} km/h</p>
        </div>
      ) : (
        <p className="text-white">Loading weather...</p>
      )}
    </div>
  );
};

export default WeatherWidget;
