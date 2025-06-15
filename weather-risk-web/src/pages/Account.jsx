// filepath: c:\Users\dropt\.vscode\mobileweatherresponse\weather-risk-web\src\pages\Account.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from "../supabase"; // Adjust path if needed

// Receive loggedInUser and isAdmin as props
export default function Account({ loggedInUser, isAdmin }) {
  const navigate = useNavigate();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [frequentLocationsData, setFrequentLocationsData] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState({ email: "", username: "" });
  const [emailPromptsActive, setEmailPromptsActive] = useState(false);
  const [user, setUser] = useState(null);

  // State for the new statistics
  const [emergenciesByMonthData, setEmergenciesByMonthData] = useState([]);
  const [emergencyLocationsPinnedStats, setEmergencyLocationsPinnedStats] = useState([]);

  const EMERGENCY_PINS_STORAGE_KEY = 'fullMapEmergencyPins';
  const PREDEFINED_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d0ed57', '#ff8042', '#00C49F', '#FFBB28', '#FF8042'];

  const ADMIN_PROMPT_EMAIL_STORAGE_KEY = 'adminPromptEmail'; // New key for admin's prompt email
  const EMAIL_PROMPTS_STORAGE_KEY = 'emailPromptsActive';
  const USER_EMAIL_STORAGE_KEY = 'userEmail'; // Key for storing user email

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
        const supabaseUserEmail = currentUser.email || '';
        const supabaseUsername = currentUser.user_metadata?.username || loggedInUser || '';

        setUserInfo({
          email: supabaseUserEmail, // Store Supabase email for display if needed for non-admins
          username: supabaseUsername
        });

        if (isAdmin && loggedInUser === 'admin1') {
          setNewUsername('admin1'); // Admin username is fixed, field hidden
          const storedAdminPromptEmail = localStorage.getItem(ADMIN_PROMPT_EMAIL_STORAGE_KEY);
          if (storedAdminPromptEmail) {
            setNewEmail(storedAdminPromptEmail); // Load admin's prompt email if already set
          }
          // Admin email prompts active status is loaded from localStorage, potentially set by confirm button
          const adminPrompts = localStorage.getItem(EMAIL_PROMPTS_STORAGE_KEY);
          setEmailPromptsActive(adminPrompts === 'true');
        } else {
          // For regular users
          setNewUsername(supabaseUsername);
          setNewEmail(supabaseUserEmail);
          const storedPreference = localStorage.getItem(EMAIL_PROMPTS_STORAGE_KEY);
          if (storedPreference !== null) {
            setEmailPromptsActive(JSON.parse(storedPreference));
          }
          if (supabaseUserEmail) {
            localStorage.setItem(USER_EMAIL_STORAGE_KEY, supabaseUserEmail);
          }
        }
      }
    };
    getUserData();
  }, [loggedInUser, isAdmin]); // Add isAdmin as a dependency

  // REMOVE MOCK DATA DEFINITIONS
  // const emergenciesCalledData = [...]; 
  // const emergencyLocationsPinnedData = [...];

  const loadFrequentLocationsChartData = () => {
    try {
      const historyString = localStorage.getItem('frequentLocationsHistory');
      if (historyString) {
        const history = JSON.parse(historyString);
        const counts = history.reduce((acc, curr) => {
          const locationKey = curr.city || "Unknown";
          acc[locationKey] = (acc[locationKey] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(counts)
          .map(([location, visits]) => ({ location, visits }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 10); // Top 10

        if (chartData.length > 0) {
          setFrequentLocationsData(chartData);
        } else {
          setFrequentLocationsData([{ location: 'No data yet', visits: 0 }]);
        }
      } else {
        setFrequentLocationsData([{ location: 'No data yet', visits: 0 }]);
      }
    } catch (error) {
      console.error("Error loading frequent locations data from localStorage:", error);
      setFrequentLocationsData([{ location: 'Error loading data', visits: 0 }]);
    }
  };

  const loadEmergencyStatistics = () => {
    try {
      const storedPinsRaw = localStorage.getItem(EMERGENCY_PINS_STORAGE_KEY);
      if (storedPinsRaw) {
        const storedPins = JSON.parse(storedPinsRaw);

        // Process for Emergencies Called (Monthly)
        const monthlyCounts = storedPins.reduce((acc, pin) => {
          if (pin.timestamp) {
            const date = new Date(pin.timestamp);
            // Format: "Jan 2023"
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            acc[monthYear] = (acc[monthYear] || 0) + 1;
          }
          return acc;
        }, {});

        const monthlyChartData = Object.entries(monthlyCounts)
          .map(([month, count]) => ({ month, count }))
          // Optional: sort by date if necessary, though object insertion order might be okay for recent months
          .sort((a, b) => new Date(a.month) - new Date(b.month)); // Sort by date
        
        setEmergenciesByMonthData(monthlyChartData.length > 0 ? monthlyChartData : [{ month: 'No data', count: 0 }]);

        // Process for Frequent Emergency Locations Pinned (Pie Chart)
        const locationCounts = storedPins.reduce((acc, pin) => {
          const locationKey = pin.city || 'Unknown Location'; // Use city from pin data
          acc[locationKey] = (acc[locationKey] || 0) + 1;
          return acc;
        }, {});

        const pieChartData = Object.entries(locationCounts)
          .map(([location, pins], index) => ({
            location,
            pins,
            color: PREDEFINED_COLORS[index % PREDEFINED_COLORS.length] // Cycle through predefined colors
          }))
          .sort((a, b) => b.pins - a.pins) // Sort by pin count descending
          .slice(0, 10); // Take top 10 for pie chart clarity

        setEmergencyLocationsPinnedStats(pieChartData.length > 0 ? pieChartData : [{ location: 'No data', pins: 0, color: '#cccccc' }]);
      } else {
        setEmergenciesByMonthData([{ month: 'No data', count: 0 }]);
        setEmergencyLocationsPinnedStats([{ location: 'No data', pins: 0, color: '#cccccc' }]);
      }
    } catch (error) {
      console.error("Error loading emergency statistics from localStorage:", error);
      setEmergenciesByMonthData([{ month: 'Error loading', count: 0 }]);
      setEmergencyLocationsPinnedStats([{ location: 'Error loading', pins: 0, color: '#cccccc' }]);
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
    setMessage('');
    let usernameUpdated = false;
    let emailUpdated = false; // This refers to Supabase auth email
    let passwordChanged = false;

    // Update Username - only if not admin (admin username is hidden and fixed)
    if (!isAdmin && newUsername && newUsername !== userInfo.username) {
      const { error } = await supabase.auth.updateUser({
        data: { username: newUsername }
      });
      if (error) {
        setMessage(prev => prev + `Error updating username: ${error.message}\n`);
      } else {
        setUserInfo(prev => ({ ...prev, username: newUsername }));
        usernameUpdated = true;
      }
    }

    // Update Supabase Auth Email - only if not admin
    // Admin uses a separate mechanism for their prompt email
    if (!isAdmin && newEmail && newEmail !== userInfo.email) {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) {
        setMessage(prev => prev + `Error updating Supabase email: ${error.message}\n`);
      } else {
        emailUpdated = true; // Indicates Supabase email update initiated
      }
    }

    // Update Password (available for all, including admin)
    if (newPassword) {
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
    if (emailUpdated) successMessage += "Supabase email update initiated (check new email for confirmation). ";
    if (passwordChanged) successMessage += "Password updated. ";

    if (successMessage && !message.includes("Error")) {
      setMessage(successMessage.trim());
    } else if (!usernameUpdated && !emailUpdated && !passwordChanged && !message) {
        // Avoid "No changes made" if only admin prompt email was potentially changed by its own button
        if (!isAdmin) setMessage("No changes were made to username, email, or password.");
        else if (isAdmin && !passwordChanged) setMessage("No changes were made to password.")
    }
  };

  const handleConfirmAdminPromptEmail = () => {
    if (!newEmail.trim()) {
      setMessage("Admin prompt email cannot be empty.");
      return;
    }
    localStorage.setItem(ADMIN_PROMPT_EMAIL_STORAGE_KEY, newEmail);
    localStorage.setItem(EMAIL_PROMPTS_STORAGE_KEY, JSON.stringify(true)); // Activate prompts for admin
    setEmailPromptsActive(true);
    setMessage(`Admin email for prompts confirmed: ${newEmail}. Prompts activated.`);
  };

  const toggleEmailPrompts = () => {
    // This function is for regular users only
    if (isAdmin) return;
    const newPreference = !emailPromptsActive;
    setEmailPromptsActive(newPreference);
    localStorage.setItem(EMAIL_PROMPTS_STORAGE_KEY, JSON.stringify(newPreference));
    setMessage(newPreference ? "Email prompts activated." : "Email prompts deactivated.");
  };

  const closeModal = () => {
    setShowAnalytics(false);
  };

  // Define styles statically (defaulting to dark theme values)
  const cardBg = "bg-gray-800";
  const textColor = "text-gray-100";
  const secondaryTextColor = "text-gray-300";
  const borderColor = "border-gray-700";
  const inputBg = "bg-gray-700"; 
  const inputBorder = "border-gray-600";
  const backButtonBg = "bg-gray-600 text-white hover:bg-gray-500";
  // REMOVED: buttonTextColor, inactiveThemeButtonBg, activeThemeButtonBg

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
              {/* For admin, display their fixed username. For others, display Supabase username. */}
              <p className={`${secondaryTextColor} mb-1`}>Username: {isAdmin && loggedInUser === 'admin1' ? 'admin1' : (user.user_metadata?.username || userInfo.username || 'Not set')}</p>
              {/* Display Supabase auth email for non-admins. For admin, this section might not show their prompt email. */}
              {!isAdmin && <p className={`${secondaryTextColor} mb-1`}>Registered Email: {user.email}</p>}
              <p className={`${secondaryTextColor} mb-1`}>User ID: {user.id}</p>
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
            {/* Username field hidden for admin */} 
            {!isAdmin && (
              <div>
                <label htmlFor="newUsername" className={`block text-sm font-medium mb-1 ${secondaryTextColor}`}>Username</label>
                <input type="text" id="newUsername" name="newUsername" value={newUsername} onChange={handleInputChange}
                       className={`w-full p-2 border rounded ${inputBg} ${textColor} ${inputBorder}`} />
              </div>
            )}
            
            {/* Email field: For admin, it's for prompt email. For users, it's Supabase auth email. */}
            <div>
              <label htmlFor="newEmail" className={`block text-sm font-medium mb-1 ${secondaryTextColor}`}>
                {isAdmin ? "Admin Email for Prompts" : "Email Address"}
              </label>
              <input type="email" id="newEmail" name="newEmail" value={newEmail} onChange={handleInputChange} 
                     placeholder={isAdmin ? "Enter email for admin alerts" : "Enter new email"}
                     className={`w-full p-2 border rounded ${inputBg} ${textColor} ${inputBorder}`} />
            </div>

            {/* Admin-specific button to confirm prompt email */} 
            {isAdmin && (
              <button onClick={handleConfirmAdminPromptEmail}
                      className="bg-orange-500 text-white px-5 py-2 rounded hover:bg-orange-600 w-full mt-2">
                Confirm Admin Email for Prompts
              </button>
            )}

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
            <button onClick={handleSaveChanges} // This button now primarily handles password for admin, and all for users
                    className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </div>

        {/* Email Prompt Section - Hidden for admin, shown for regular users */} 
        {!isAdmin && (
          <div className={`${cardBg} shadow-lg rounded-lg p-6 mb-8`}>
            <h2 className={`text-2xl font-semibold mb-4 border-b ${borderColor} pb-2 ${textColor}`}>Email Prompt Settings</h2>
            <div className="flex items-center space-x-4">
              <span className={`text-sm font-medium ${secondaryTextColor}`}>Registered Email for Prompts: {userInfo.email}</span>
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
        )}

        {/* Analytics Section */}
        <div className={`${cardBg} shadow-lg rounded-lg p-6`}>
           <h2 className={`text-2xl font-semibold mb-4 border-b ${borderColor} pb-2 ${textColor}`}>Analytics</h2>
           <button onClick={() => {
             setShowAnalytics(true);
             loadFrequentLocationsChartData(); // Load data for frequent locations checked
             loadEmergencyStatistics(); // Load data for emergency stats
           }}
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
                    <BarChart data={emergenciesByMonthData}> {/* UPDATED DATA SOURCE */}
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Frequent Locations Checked Chart - REMAINS UNCHANGED */}
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
                        data={emergencyLocationsPinnedStats} /* UPDATED DATA SOURCE */
                        dataKey="pins"
                        nameKey="location"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false} // Optional: cleaner look
                        label={({ location, pins, percent }) => `${location}: ${pins} (${(percent * 100).toFixed(0)}%)`} // Improved label
                      >
                        {emergencyLocationsPinnedStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${props.payload.pins} pins`, name]} /> {/* Custom tooltip */}
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