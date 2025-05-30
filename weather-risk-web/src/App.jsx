import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import FullMap from "./pages/FullMap";
import Weather from "./pages/Weather"; // Import the Weather component
import './css/index.css';

function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null); // Added state for logged in user
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

  // Retrieve loggedInUser from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setLoggedInUser(storedUser);
      setIsRegistered(true); // Consider user as registered if username exists
    }
  }, []);

  // Define base classes based on theme state
  const themeClasses = theme === 'light'
    ? 'bg-blue-50 text-blue-950' // Light theme base
    : 'bg-[#242424] text-[rgba(255,255,255,0.87)]'; // Dark theme base (matches :root)

  return (
    // Apply theme classes to this main wrapper
    <div className={`min-h-screen ${themeClasses} transition-colors duration-300`}>
      <Router>
        <Routes>
          {/* Pass theme state and setter down to components that need them */}
          <Route path="/" element={<Dashboard isRegistered={isRegistered} setIsRegistered={setIsRegistered} loggedInUser={loggedInUser} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route path="/dashboard" element={<Dashboard isRegistered={isRegistered} setIsRegistered={setIsRegistered} loggedInUser={loggedInUser} />} />
          <Route path="/account" element={<Account theme={theme} setTheme={setTheme} loggedInUser={loggedInUser} />} />
          <Route path="/map" element={<FullMap />} />
          <Route path="/weather" element={<Weather />} /> {/* Add the route for Weather */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;