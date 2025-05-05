// filepath: c:\Users\dropt\.vscode\mobileweatherresponse\weather-risk-web\src\pages\Account.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const navigate = useNavigate();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: "user@example.com",
  });

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    return savedTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    console.log("Theme changed to:", newTheme);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    console.log("Saving changes:", userInfo);
    alert("Changes saved (simulated).");
  };

  // Define base styles for light theme, dark: variants for dark theme
  const pageBg = "bg-blue-50 dark:bg-[#242424]"; // Match body styles
  const cardBg = "bg-white dark:bg-gray-800";
  const textColor = "text-blue-950 dark:text-gray-100";
  const secondaryTextColor = "text-blue-800 dark:text-gray-300";
  const borderColor = "border-blue-200 dark:border-gray-700";
  const inputBg = "bg-blue-100 dark:bg-gray-700";
  const inputBorder = "border-blue-300 dark:border-gray-600";
  const buttonTextColor = "text-blue-900 dark:text-white"; // For theme buttons

  return (
    // Apply base page background and text color
    <div className={`min-h-screen ${pageBg} ${textColor} p-8 transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-start">
          <button
            onClick={() => navigate('/dashboard')}
            // Use light/dark styles consistent with index.css button base
            className={`px-4 py-2 rounded bg-blue-200 text-blue-800 hover:bg-blue-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500`}
          >
            &larr; Back to Dashboard
          </button>
        </div>

        <h1 className={`text-4xl font-bold mb-8 text-center ${textColor}`}>Account Settings</h1>

        {/* Edit Account Information Section */}
        <div className={`${cardBg} shadow-lg rounded-lg p-6 mb-8`}>
          <h2 className={`text-2xl font-semibold mb-4 border-b ${borderColor} pb-2`}>Edit Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${secondaryTextColor}`}>Email Address</label>
              <input
                type="email" id="email" name="email" value={userInfo.email} onChange={handleInputChange}
                className={`w-full p-2 border rounded ${inputBg} ${textColor} ${inputBorder}`}
              />
            </div>
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-1 ${secondaryTextColor}`}>New Password (Optional)</label>
              <input
                type="password" id="password" name="password" placeholder="Leave blank to keep current password"
                className={`w-full p-2 border rounded ${inputBg} ${textColor} ${inputBorder}`}
              />
            </div>
            <button
              onClick={handleSaveChanges}
              // Specific button style - primary action
              className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Display Settings Section */}
        <div className={`${cardBg} shadow-lg rounded-lg p-6 mb-8`}>
          <h2 className={`text-2xl font-semibold mb-4 border-b ${borderColor} pb-2`}>Display Settings</h2>
          <div className="flex items-center space-x-4">
            <span className={`text-sm font-medium ${secondaryTextColor}`}>Theme:</span>
            <button
              onClick={() => handleThemeChange('light')}
              // Active state: primary blue; Inactive state: lighter blue/gray
              className={`px-3 py-1 rounded text-sm ${theme === 'light'
                  ? 'bg-blue-500 text-white'
                  : `bg-blue-100 dark:bg-gray-600 ${buttonTextColor} hover:bg-blue-200 dark:hover:bg-gray-500`
                }`}
            >
              Light
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              // Active state: primary blue (consistent); Inactive state: lighter blue/gray
              className={`px-3 py-1 rounded text-sm ${theme === 'dark'
                  ? 'bg-blue-500 text-white' // Use same active color for consistency
                  : `bg-blue-100 dark:bg-gray-600 ${buttonTextColor} hover:bg-blue-200 dark:hover:bg-gray-500`
                }`}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Analytics Section */}
        <div className={`${cardBg} shadow-lg rounded-lg p-6`}>
          <h2 className={`text-2xl font-semibold mb-4 border-b ${borderColor} pb-2`}>Analytics</h2>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
             // Specific button style - secondary action
            className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 mb-4"
          >
            {showAnalytics ? 'Hide' : 'Show'} Statistics
          </button>
          {showAnalytics && (
            <div className={`bg-blue-100 dark:bg-gray-700 p-4 rounded`}>
              <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>Usage Statistics (Placeholder)</h3>
              <ul className={`list-disc list-inside space-y-1 text-sm ${secondaryTextColor}`}>
                <li>Logins this month: 15</li>
                <li>Locations saved: 3</li>
                <li>Alerts received: 5</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}