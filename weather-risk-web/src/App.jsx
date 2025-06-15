import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import FullMap from "./pages/FullMap";
import Weather from "./pages/Weather";
import UpdatePassword from "./pages/UpdatePassword"; // Import the new component
import DevLogin from "./pages/DevLogin"; // <-- IMPORT DevLogin
import './css/index.css';

function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null); // Added state for logged in user
  const [isAdmin, setIsAdmin] = useState(false); // <-- ADDED isAdmin state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Default to 'dark' if nothing saved or invalid value
    return savedTheme === 'light' ? 'light' : 'dark';
  });

  // Effect to apply the 'dark' class to <html> and save preference
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleRegister = (username) => { // Modified to accept username
    setIsRegistered(true);
    setLoggedInUser(username); // Set loggedInUser on registration
    localStorage.setItem('loggedInUser', username); // Store username in localStorage
  };

  const handleLogin = (username) => { // Modified to accept username (assuming login will also provide it)
    setIsRegistered(true);
    setLoggedInUser(username);
    localStorage.setItem('loggedInUser', username);
  };

  // Effect to load initial state from localStorage (runs once on mount)
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    const storedIsAdmin = localStorage.getItem('isAdmin');

    if (storedUser) {
      setLoggedInUser(storedUser); // This will trigger the effect below to set isRegistered
      if (storedIsAdmin === 'true') {
        setIsAdmin(true);
      } else {
        // If user exists but no admin flag, ensure isAdmin is false.
        setIsAdmin(false);
      }
    } else {
      // No stored user, ensure all auth state is cleared.
      // setLoggedInUser(null); // already null by default
      // setIsRegistered(false); // already false by default
      setIsAdmin(false); // ensure isAdmin is false
      localStorage.removeItem('loggedInUser'); // Clean up just in case, though should be null
      localStorage.removeItem('isAdmin');    // Clean up any orphaned isAdmin flag
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs once on mount; setters are stable

  // Effect to react to changes in loggedInUser (e.g., after login/logout)
  useEffect(() => {
    if (loggedInUser) {
      setIsRegistered(true);
      // Admin status is set by DevLogin directly or loaded from localStorage in the mount effect.
      // This effect should not override isAdmin to false if a user is logged in.
    } else {
      // User is logged out
      setIsRegistered(false);
      setIsAdmin(false); // Clear admin state as well when loggedInUser is null
    }
  }, [loggedInUser]); // Runs when loggedInUser changes

  // Define base classes based on theme state
  const themeClasses = theme === 'light'
    ? 'bg-blue-50 text-blue-950' // Light theme base
    : 'bg-[#242424] text-[rgba(255,255,255,0.87)]'; // Dark theme base (matches :root)

  return (
    // Apply theme classes to this main wrapper
    <div className={`min-h-screen ${themeClasses} transition-colors duration-300`}>
      <Router>
        <main>
          <Routes>
            {/* Pass theme state and setter down to components that need them */}
            {/* Default route changed to always render Dashboard */}
            <Route path="/" element={<Dashboard isAdmin={isAdmin} isRegistered={isRegistered} setIsRegistered={setIsRegistered} loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} setIsAdmin={setIsAdmin} />} />
            <Route path="/register" element={<Register onRegister={handleRegister} />} /> {/* Pass onRegister */}
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/devlogin" element={<DevLogin setLoggedInUser={setLoggedInUser} setIsAdmin={setIsAdmin} />} /> {/* <-- ADDED DevLogin Route */}
            {/* Dashboard route is now the default, can be removed if / is sufficient */}
            <Route path="/dashboard" element={<Dashboard isAdmin={isAdmin} isRegistered={isRegistered} setIsRegistered={setIsRegistered} loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} setIsAdmin={setIsAdmin} />} />
            <Route path="/map" element={isRegistered ? <FullMap /> : <Navigate to="/login" />} />
            <Route path="/weather" element={isRegistered ? <Weather /> : <Navigate to="/login" />} />
            <Route path="/account" element={isRegistered ? <Account loggedInUser={loggedInUser} isAdmin={isAdmin} /> : <Navigate to="/login" />} /> {/* Pass isAdmin to Account */}
            <Route path="/update-password" element={<UpdatePassword />} /> 
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;