// filepath: c:\Users\dropt\.vscode\mobileweatherresponse\weather-risk-web\src\pages\Account.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from "../supabase"; // Adjust path if needed

// Receive theme, setTheme, and loggedInUser as props
export default function Account({ theme, setTheme, loggedInUser }) {
  const navigate = useNavigate();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [userInfo, setUserInfo] = useState({ email: loggedInUser ? `${loggedInUser.toLowerCase().replace(/\s+/g, '.')}@example.com` : "user@example.com" });
  const [emailPromptsActive, setEmailPromptsActive] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }
      setUser(user);
    };
    getUser();
  }, []);

  // Mock data for charts
  const emergenciesCalledData = [
    { month: 'Jan', count: 2 },
    { month: 'Feb', count: 4 },
    { month: 'Mar', count: 1 },
    { month: 'Apr', count: 6 },
    { month: 'May', count: 3 },
    { month: 'Jun', count: 5 }
  ];

  const frequentLocationsData = [
    { location: 'San Pedro City', visits: 15 },
    { location: 'Makati', visits: 8 },
    { location: 'Quezon City', visits: 12 },
    { location: 'Manila', visits: 6 },
    { location: 'Pasig', visits: 4 }
  ];

  const emergencyLocationsPinnedData = [
    { location: 'Hospital District', pins: 8, color: '#8884d8' },
    { location: 'Fire Station Area', pins: 5, color: '#82ca9d' },
    { location: 'Police Station', pins: 6, color: '#ffc658' },
    { location: 'Flood Zone', pins: 10, color: '#ff7300' },
    { location: 'Earthquake Risk', pins: 3, color: '#8dd1e1' }
  ];

  const handleThemeChange = (newTheme) => {
    // Only call setTheme if the new theme is different from the current theme
    if (theme !== newTheme) {
      setTheme(newTheme);
      console.log("Theme changed to:", newTheme);
    } else {
      console.log("Theme is already:", newTheme);
    }
  };

  // Update userInfo if loggedInUser changes (e.g., after login)
  React.useEffect(() => {
    if (loggedInUser) {
      setUserInfo({ email: `${loggedInUser.toLowerCase().replace(/\s+/g, '.')}@example.com` });
    }
  }, [loggedInUser]);

  const handleInputChange = (e) => {};
  const handleSaveChanges = () => {};

  const toggleEmailPrompts = () => {
    setEmailPromptsActive(!emailPromptsActive);
  };

  const closeModal = () => {
    setShowAnalytics(false);
  };

  // Define styles based on the theme prop
  const cardBg = theme === 'light' ? "bg-white" : "bg-gray-800";
  const textColor = theme === 'light' ? "text-blue-950" : "text-gray-100";
  const secondaryTextColor = theme === 'light' ? "text-blue-800" : "text-gray-300";
  const borderColor = theme === 'light' ? "border-blue-200" : "border-gray-700";
  const inputBg = theme === 'light' ? "bg-blue-100" : "bg-gray-700";
  const inputBorder = theme === 'light' ? "border-blue-300" : "border-gray-600";
  const buttonTextColor = theme === 'light' ? "text-blue-900" : "text-white";
  const backButtonBg = theme === 'light' ? "bg-blue-200 text-blue-800 hover:bg-blue-300" : "bg-gray-600 text-white hover:bg-gray-500";
  const inactiveThemeButtonBg = theme === 'light' ? "bg-blue-100 hover:bg-blue-200" : "bg-gray-600 hover:bg-gray-500";
  const activeThemeButtonBg = "bg-blue-500 text-white";

  // Email Prompt Button Styles
  const activePromptButton = "bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600";
  const inactivePromptButton = "bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600";

  return (
    <div className="p-8">
      {/* Supabase user info section */}
      <div className="text-white p-4">
        <h2 className="text-xl font-bold mb-4">Account Page</h2>
        {user ? (
          <div>
            <p>Email: {user.email}</p>
            <p>User ID: {user.id}</p>
          </div>
        ) : (
          <p>Loading user info...</p>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-start">
          <button
            onClick={() => navigate('/dashboard')}
            className={`px-4 py-2 rounded ${backButtonBg}`}
          >
            &larr; Back to Dashboard
          </button>
        </div>

        <h1 className={`text-4xl font-bold mb-8 text-center ${textColor}`}>Account Settings</h1>

        {/* User Welcome Message */}
        {loggedInUser && (
          <div className={`${cardBg} shadow-lg rounded-lg p-4 mb-8 text-center ${textColor}`}>
            <p className="text-lg">Welcome, <span className="font-semibold">{loggedInUser}</span>!</p>
          </div>
        )}

        {/* Edit Account Information Section */}
        <div className={`${cardBg} shadow-lg rounded-lg p-6 mb-8`}>
          <h2 className={`text-2xl font-semibold mb-4 border-b ${borderColor} pb-2 ${textColor}`}>Edit Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className={`block text-sm font-medium mb-1 ${secondaryTextColor}`}>Username</label>
              <input type="text" id="username" name="username" value={loggedInUser || ''} readOnly
                     className={`w-full p-2 border rounded ${inputBg} ${textColor} ${inputBorder} cursor-not-allowed`} />
            </div>
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

        {/* Email Prompt Section */}
        <div className={`${cardBg} shadow-lg rounded-lg p-6 mb-8`}>
          <h2 className={`text-2xl font-semibold mb-4 border-b ${borderColor} pb-2 ${textColor}`}>Email Prompt</h2>
          <div className="flex items-center space-x-4">
            <span className={`text-sm font-medium ${secondaryTextColor}`}>Email: {userInfo.email}</span>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <button
              onClick={toggleEmailPrompts}
              className={emailPromptsActive ? activePromptButton : inactivePromptButton}
            >
              {emailPromptsActive ? 'Deactivate Email Prompts' : 'Activate Email Prompts'}
            </button>
          </div>
        </div>

        {/* Analytics Section */}
        <div className={`${cardBg} shadow-lg rounded-lg p-6`}>
           <h2 className={`text-2xl font-semibold mb-4 border-b ${borderColor} pb-2 ${textColor}`}>Analytics</h2>
           <button onClick={() => setShowAnalytics(true)}
                   className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 mb-4">
             Show Statistics
           </button>
         </div>

         {/* Analytics Modal */}
         {showAnalytics && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${cardBg} rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative`}>
              <button onClick={closeModal} className="absolute top-4 right-4 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-gray-800">
                ✕
              </button>
              <h2 className={`text-2xl font-semibold mb-6 ${textColor}`}>Usage Statistics</h2>

              {/* Emergencies Called Chart */}
              <div className="mb-8">
                <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Emergencies Called (Monthly)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emergenciesCalledData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Frequent Locations Checked Chart */}
              <div className="mb-8">
                <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Frequent Locations Checked</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={frequentLocationsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visits" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Emergency Locations Pinned Chart */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Frequent Emergency Locations Pinned</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={emergencyLocationsPinnedData}
                        dataKey="pins"
                        nameKey="location"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({location, pins}) => `${location}: ${pins}`}
                      >
                        {emergencyLocationsPinnedData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}