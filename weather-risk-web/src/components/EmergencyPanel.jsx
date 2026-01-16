import React, { useState } from 'react';

const EmergencyPanel = ({ emergencies, isPanelOpen, onClose, onSelectEmergency, onSearchQuerySubmit }) => {
  const [query, setQuery] = useState('');

  return (
    <div className={`fixed top-0 right-0 h-full w-full md:w-1/3 bg-gray-800 bg-opacity-90 backdrop-blur-sm shadow-lg z-[1001] transform transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'} ${isPanelOpen ? 'pointer-events-auto' : 'pointer-events-none'} p-4 overflow-y-auto`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Active Emergencies</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim() && onSearchQuerySubmit) {
                onSearchQuerySubmit(query.trim());
                setQuery('');
              }
            }}
            placeholder="Search location..."
            className="w-40 bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => {
              if (query.trim() && onSearchQuerySubmit) {
                onSearchQuerySubmit(query.trim());
                setQuery('');
              }
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded px-2 py-1"
          >
            Go
          </button>
          <button onClick={onClose} className="text-white text-2xl">&times;</button>
        </div>
      </div>
      <div className="space-y-4">
        {emergencies.length > 0 ? (
          emergencies.map((emergency) => (
            <div
              key={emergency.id}
              className="bg-gray-700 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-600"
              onClick={() => onSelectEmergency(emergency)}
            >
              <h3 className="text-xl font-semibold text-red-400 mb-1">
                {emergency.type} - {emergency.area}
              </h3>
              <p className="text-sm text-gray-400 mb-2">Severity: {emergency.severity}</p>
              <p className="text-gray-300">{emergency.details}</p>
              {emergency.user && <p className="text-xs text-gray-500 mt-1">Reported by: {emergency.user}</p>}
              {emergency.timestamp && (
                <p className="text-xs text-gray-600 mt-1">
                  Reported: {new Date(emergency.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No active emergencies reported.</p>
        )}
      </div>
    </div>
  );
};

export default EmergencyPanel;
