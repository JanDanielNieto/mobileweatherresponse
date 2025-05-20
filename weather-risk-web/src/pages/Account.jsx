// filepath: c:\Users\dropt\.vscode\mobileweatherresponse\weather-risk-web\src\pages\Account.jsx
import React, { useState } from 'react'; // Removed useEffect
import { useNavigate } from 'react-router-dom';

// Receive theme and setTheme as props
export default function Account({ theme, setTheme }) {
  const navigate = useNavigate();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [userInfo, setUserInfo] = useState({ email: "user@example.com" });

  // REMOVED local theme useState and useEffect

  // Use the setTheme prop directly
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme); // Call the function passed from App.jsx
    console.log("Theme changed to:", newTheme);
  };

  const handleInputChange = (e) => { /* ... no change ... */ };
  const handleSaveChanges = () => { /* ... no change ... */ };

  // Define styles based on the theme prop
  // Note: Base page background/text is now handled by App.jsx wrapper
  const cardBg = theme === 'light' ? "bg-white" : "bg-gray-800";
  const textColor = theme === 'light' ? "text-blue-950" : "text-gray-100"; // Primary text within cards/page
  const secondaryTextColor = theme === 'light' ? "text-blue-800" : "text-gray-300";
  const borderColor = theme === 'light' ? "border-blue-200" : "border-gray-700";
  const inputBg = theme === 'light' ? "bg-blue-100" : "bg-gray-700";
  const inputBorder = theme === 'light' ? "border-blue-300" : "border-gray-600";
  const buttonTextColor = theme === 'light' ? "text-blue-900" : "text-white"; // For inactive theme buttons
  const backButtonBg = theme === 'light' ? "bg-blue-200 text-blue-800 hover:bg-blue-300" : "bg-gray-600 text-white hover:bg-gray-500";
  const inactiveThemeButtonBg = theme === 'light' ? "bg-blue-100 hover:bg-blue-200" : "bg-gray-600 hover:bg-gray-500";
  const activeThemeButtonBg = "bg-blue-500 text-white"; // Same for both themes

  return (
    // No need for pageBg/textColor here, inherited from App.jsx wrapper
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-start">
          <button
            onClick={() => navigate('/dashboard')}
            className={`px-4 py-2 rounded ${backButtonBg}`}
          >
            &larr; Back to Dashboard
          </button>
        </div>

        {/* Use textColor for main heading */}
        <h1 className={`text-4xl font-bold mb-8 text-center ${textColor}`}>Account Settings</h1>

        {/* Edit Account Information Section */}
        <div className={`${cardBg} shadow-lg rounded-lg p-6 mb-8`}>
          <h2 className={`text-2xl font-semibold mb-4 border-b ${borderColor} pb-2 ${textColor}`}>Edit Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${secondaryTextColor}`}>Email Address</label>
              <input type="email" id="email" name="email" value={userInfo.email} onChange={handleInputChange}
                     className={`w-full p-2 border rounded ${inputBg} ${textColor} ${inputBorder}`} />
            </div>
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-1 ${secondaryTextColor}`}>New Password (Optional)</label>
              <input type="password" id="password" name="password" placeholder="Leave blank to keep current password"
                     className={`w-full p-2 border rounded ${inputBg} ${textColor} ${inputBorder}`} />
            </div>
            <button onClick={handleSaveChanges}
                    className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </div>

        {/* Display Settings Section */}
        <div className={`${cardBg} shadow-lg rounded-lg p-6 mb-8`}>
          <h2 className={`text-2xl font-semibold mb-4 border-b ${borderColor} pb-2 ${textColor}`}>Display Settings</h2>
          <div className="flex items-center space-x-4">
            <span className={`text-sm font-medium ${secondaryTextColor}`}>Theme:</span>
            <button
              onClick={() => handleThemeChange('light')}
              className={`px-3 py-1 rounded text-sm ${theme === 'light' ? activeThemeButtonBg : `${inactiveThemeButtonBg} ${buttonTextColor}`}`}
            >
              Light
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`px-3 py-1 rounded text-sm ${theme === 'dark' ? activeThemeButtonBg : `${inactiveThemeButtonBg} ${buttonTextColor}`}`}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Analytics Section */}
        <div className={`${cardBg} shadow-lg rounded-lg p-6`}>
           <h2 className={`text-2xl font-semibold mb-4 border-b ${borderColor} pb-2 ${textColor}`}>Analytics</h2>
           <button onClick={() => setShowAnalytics(!showAnalytics)}
                   className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 mb-4">
             {showAnalytics ? 'Hide' : 'Show'} Statistics
           </button>
           {showAnalytics && (
             <div className={`${theme === 'light' ? 'bg-blue-100' : 'bg-gray-700'} p-4 rounded`}>
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