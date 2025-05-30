// filepath: c:\Users\dropt\.vscode\mobileweatherresponse\weather-risk-web\src\pages\Account.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from "../supabase"; // Adjust path if needed

// Receive theme, setTheme, and loggedInUser as props
export default function Account({ theme, setTheme, loggedInUser }) {
  const navigate = useNavigate();
  const [showAnalytics, setShowAnalytics] = useState(false);
  // Remove mock email generation, fetch from Supabase or use props
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState({ email: "", username: "" }); // Initialize with empty strings
  const [emailPromptsActive, setEmailPromptsActive] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError.message);
        setMessage(`Error: ${userError.message}`);
        return;
      }
      setUser(currentUser);
      if (currentUser) {
        setUserInfo({
          email: currentUser.email || '',
          username: currentUser.user_metadata?.username || loggedInUser || ''
        });
        setNewUsername(currentUser.user_metadata?.username || loggedInUser || '');
        setNewEmail(currentUser.email || '');
      }
    };
    getUserData();
  }, [loggedInUser]); // Add loggedInUser as a dependency

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
  // This useEffect is redundant due to the one above, consider merging or removing
  // React.useEffect(() => {
  //   if (loggedInUser) {
  //     // setUserInfo({ email: `${loggedInUser.toLowerCase().replace(/\\s+/g, '.')}@example.com` });
  //   }
  // }, [loggedInUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "newEmail") {
      setNewEmail(value);
    } else if (name === "currentPassword") {
      setCurrentPassword(value);
    } else if (name === "newPassword") {
      setNewPassword(value);
    } else if (name === "newUsername") {
      setNewUsername(value);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      setMessage("Username cannot be empty.");
      return;
    }
    const { data, error } = await supabase.auth.updateUser({
      data: { username: newUsername }
    });
    if (error) {
      setMessage(`Error updating username: ${error.message}`);
    } else {
      setMessage("Username updated successfully!");
      setUserInfo(prev => ({ ...prev, username: newUsername }));
      // Optionally, update loggedInUser in App.jsx via a callback if needed for immediate global update
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      setMessage("Email cannot be empty.");
      return;
    }
    const { data, error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      setMessage(`Error updating email: ${error.message}`);
      // It might say "User not found" or similar if the email requires confirmation and the old one is used for lookup.
      // Or "Email rate limit exceeded"
    } else {
      setMessage("Email update initiated. Please check your new email address for a confirmation link.");
      // Email won't be updated in user object until confirmed.
      // You might want to inform the user about this.
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      setMessage("New password cannot be empty.");
      return;
    }
    // Supabase requires the user to be recently signed in to change password,
    // or you need to implement a "forgot password" flow.
    // For direct password update, it's usually done via supabase.auth.updateUser
    // but it's best practice to re-authenticate for password changes if possible,
    // or ensure the session is fresh. Supabase handles this by requiring current password
    // implicitly if the session is not new enough, or explicitly if you use a different method.
    // The simplest way is:
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage(`Error updating password: ${error.message}`);
    } else {
      setMessage("Password updated successfully!");
      setNewPassword(''); // Clear the field
      setCurrentPassword(''); // Clear the field
    }
  };


  const handleSaveChanges = async () => {
    setMessage(''); // Clear previous messages
    let usernameUpdated = false;
    let emailUpdated = false;
    let passwordChanged = false;

    // Update Username
    if (newUsername && newUsername !== userInfo.username) {
      const { error } = await supabase.auth.updateUser({
        data: { username: newUsername }
      });
      if (error) {
        setMessage(prev => prev + `Error updating username: ${error.message}\n`);
      } else {
        setUserInfo(prev => ({ ...prev, username: newUsername }));
        // Consider calling a prop function to update App.jsx's loggedInUser state
        usernameUpdated = true;
      }
    }

    // Update Email
    if (newEmail && newEmail !== userInfo.email) {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) {
        setMessage(prev => prev + `Error updating email: ${error.message}\n`);
      } else {
        // Email update requires confirmation. The user object's email won't change immediately.
        emailUpdated = true;
      }
    }

    // Update Password
    if (newPassword) {
      if (!currentPassword && !(await supabase.auth.getSession())?.data.session?.user) {
          // This check is a bit simplified. Ideally, you'd ensure the user has recently reauthenticated
          // if Supabase requires it for password changes without the current password.
          // However, supabase.auth.updateUser({ password: newPassword }) should handle this.
          // If current password is required by your setup/rules, you'd check for currentPassword here.
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setMessage(prev => prev + `Error updating password: ${error.message}\n`);
      } else {
        passwordChanged = true;
        setCurrentPassword('');
        setNewPassword('');
      }
    }

    let successMessage = "";
    if (usernameUpdated) successMessage += "Username updated. ";
    if (emailUpdated) successMessage += "Email update initiated (check new email for confirmation). ";
    if (passwordChanged) successMessage += "Password updated. ";

    if (successMessage && !message.includes("Error")) {
      setMessage(successMessage.trim());
    } else if (!usernameUpdated && !emailUpdated && !passwordChanged && !message) {
      setMessage("No changes were made.");
    }
  };

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
  const inputBg = theme === 'light' ? "bg-blue-100" : "bg-gray-700"; // Ensure this is distinct enough
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
      {/* The existing Supabase user info section at the top will be removed. */}
      {/* 
      <div className={`${textColor} p-4`}>
        <h2 className="text-xl font-bold mb-4">Account Page</h2>
        {user ? (
          <div>
            <p>Current Email: {user.email}</p>
            <p>User ID: {user.id}</p>
            <p>Current Username (from metadata): {user.user_metadata?.username || 'Not set'}</p>
          </div>
        ) : (
          <p>Loading user info...</p>
        )}
        {message && <p className={`mt-4 text-sm ${message.includes("Error") ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
      </div>
      */}

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

        {/* Session Information Section */}
        <div className={`${cardBg} shadow-lg rounded-lg p-6 mb-8`}>
          <h2 className={`text-2xl font-semibold mb-4 border-b ${borderColor} pb-2 ${textColor}`}>Session Information</h2>
          {user ? (
            <div>
              <p className={`${secondaryTextColor} mb-1`}>Email: {user.email}</p>
              <p className={`${secondaryTextColor} mb-1`}>User ID: {user.id}</p>
              <p className={`${secondaryTextColor} mb-1`}>Username: {user.user_metadata?.username || userInfo.username || 'Not set'}</p>
            </div>
          ) : (
            <p className={`${secondaryTextColor}`}>Loading user info...</p>
          )}
          {message && (
            <p className={`mt-4 text-sm ${message.toLowerCase().includes("error") || message.toLowerCase().includes("failed") || message.toLowerCase().includes("missing") ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
        </div>

        {/* Edit Account Information Section */}
        <div className={`${cardBg} shadow-lg rounded-lg p-6 mb-8`}>
          <h2 className={`text-2xl font-semibold mb-4 border-b ${borderColor} pb-2 ${textColor}`}>Edit Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="newUsername" className={`block text-sm font-medium mb-1 ${secondaryTextColor}`}>Username</label>
              <input type="text" id="newUsername" name="newUsername" value={newUsername} onChange={handleInputChange}
                     className={`w-full p-2 border rounded ${inputBg} ${textColor} ${inputBorder}`} />
            </div>
            <div>
              <label htmlFor="newEmail" className={`block text-sm font-medium mb-1 ${secondaryTextColor}`}>Email Address</label>
              <input type="email" id="newEmail" name="newEmail" value={newEmail} onChange={handleInputChange}
                     className={`w-full p-2 border rounded ${inputBg} ${textColor} ${inputBorder}`} />
            </div>
            <div>
              <label htmlFor="currentPassword" className={`block text-sm font-medium mb-1 ${secondaryTextColor}`}>Current Password (needed for password change)</label>
              <input type="password" id="currentPassword" name="currentPassword" placeholder="Enter current password to change"
                     value={currentPassword} onChange={handleInputChange}
                     className={`w-full p-2 border rounded ${inputBg} ${textColor} ${inputBorder}`} />
            </div>
            <div>
              <label htmlFor="newPassword" className={`block text-sm font-medium mb-1 ${secondaryTextColor}`}>New Password</label>
              <input type="password" id="newPassword" name="newPassword" placeholder="Enter new password"
                     value={newPassword} onChange={handleInputChange}
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