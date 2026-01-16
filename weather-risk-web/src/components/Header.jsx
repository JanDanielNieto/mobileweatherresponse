import React, { useState, useEffect } from 'react';
import SeiaWeatherIcon from '../../public/SeiaWeather.png';

const Header = ({ isPopupOpen }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isPopupOpen) {
      const timer = setTimeout(() => setIsVisible(true), 100); // Shorter delay for header
      return () => clearTimeout(timer);
    }
  }, [isPopupOpen]);

  return (
    <header className={`bg-gray-800 text-white p-2 shadow-md z-[1002] relative transition-transform duration-500 ease-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto flex items-center">
        <img src={SeiaWeatherIcon} alt="SeiaWeather Icon" className="h-8 w-8 mr-3" />
        <h1 className="text-2xl font-bold font-serif">SeiaWeather</h1>
      </div>
    </header>
  );
};

export default Header;
