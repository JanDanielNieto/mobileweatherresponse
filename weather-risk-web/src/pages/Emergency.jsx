import React from 'react';
import { emergencyData } from '../data/emergencyData';

// Accept onSelectEmergency prop (which will likely trigger showing Location)
export default function Emergency({ onSelectEmergency }) {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Active Emergencies
      </h2>
      <div className="space-y-4">
        {emergencyData.length > 0 ? (
          emergencyData.map((emergency) => (
            <div
              key={emergency.id}
              className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => onSelectEmergency(emergency)} // Pass emergency data if needed later
            >
              <h3 className="text-xl font-semibold text-red-400 mb-1">
                {emergency.type} - {emergency.area}
              </h3>
              <p className="text-sm text-gray-400 mb-2">Severity: {emergency.severity}</p>
              <p className="text-gray-300">{emergency.details}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No active emergencies reported.</p>
        )}
      </div>
    </div>
  );
}