import React from 'react';

const EmergencyModal = ({ isOpen, onClose, onSubmit, emergencyDetails, setEmergencyDetails, emergencyType, setEmergencyType, emergencySeverity, setEmergencySeverity }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1010] p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-xl font-semibold text-white mb-4">Report Emergency</h3>
        <div className="mb-4">
          <label htmlFor="emergencyType" className="block text-sm font-medium text-gray-300 mb-1">Emergency Type</label>
          <select
            id="emergencyType"
            value={emergencyType}
            onChange={(e) => setEmergencyType(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Flood">Flood</option>
            <option value="Fire">Fire</option>
            <option value="Earthquake">Earthquake</option>
            <option value="Landslide">Landslide</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="emergencySeverity" className="block text-sm font-medium text-gray-300 mb-1">Severity</label>
          <select
            id="emergencySeverity"
            value={emergencySeverity}
            onChange={(e) => setEmergencySeverity(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="emergencyDetails" className="block text-sm font-medium text-gray-300 mb-1">Details (Optional)</label>
          <textarea
            id="emergencyDetails"
            value={emergencyDetails}
            onChange={(e) => setEmergencyDetails(e.target.value)}
            rows="3"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Provide any additional details..."
          ></textarea>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Submit Emergency
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;
