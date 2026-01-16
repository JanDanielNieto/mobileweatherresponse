import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 ease-in-out z-50"
      style={{ width: isOpen ? '250px' : '60px' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex flex-col p-4">
        <div className="text-2xl font-bold mb-10">
          {isOpen ? 'Menu' : 'M'}
        </div>
        <nav>
          <ul>
            <li className="mb-4">
              <Link to="/dashboard" className="flex items-center">
                <span className="mr-2">🏠</span>
                {isOpen && 'Dashboard'}
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/weather" className="flex items-center">
                <span className="mr-2">🌦️</span>
                {isOpen && 'Weather'}
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/emergency" className="flex items-center">
                <span className="mr-2">🚨</span>
                {isOpen && 'Emergency'}
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/location" className="flex items-center">
                <span className="mr-2">📍</span>
                {isOpen && 'Location'}
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/fullmap" className="flex items-center">
                <span className="mr-2">🗺️</span>
                {isOpen && 'Full Map'}
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/account" className="flex items-center">
                <span className="mr-2">👤</span>
                {isOpen && 'Account'}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
