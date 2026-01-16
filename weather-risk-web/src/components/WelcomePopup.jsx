import React from 'react';

const WelcomePopup = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1002] p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
        >
          &times;
        </button>
        <div className="text-justify">
          <h2 className="text-3xl font-bold mb-6 text-blue-300">Welcome to SeiaWeather!</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-200">Emergencies Qualified for the system:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Floods</li>
              <li>Earthquakes</li>
              <li>Landslides</li>
              <li>Fires</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-200">Emergencies not listed for the system:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Vehicular Accidents</li>
              <li>Medical Accidents</li>
              <li>Missing Person Incidents</li>
              <li>Criminal Incidents</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2 text-red-400">Philippine Emergency Hotlines:</h3>
            <ul className="list-none space-y-1 text-gray-300">
              <li><strong>National Emergency Hotline:</strong> 911</li>
              <li><strong>Philippine Red Cross:</strong> 143</li>
              <li><strong>NDRRMC (National Disaster Risk Reduction and Management Council):</strong> (02) 8911-5061 to 65, (02) 8912-2665, (02) 8912-5668</li>
              <li><strong>BFP (Bureau of Fire Protection):</strong> (02) 8426-0219, (02) 8426-0246</li>
              <li><strong>PAGASA (Weather Bureau):</strong> (02) 8284-0800</li>
            </ul>
            <p className="mt-3 text-sm text-gray-400">In case of immediate danger, always contact local authorities or dial 911 first.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
