import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import FullMap from "./pages/FullMap";

function App() {
  const [isRegistered, setIsRegistered] = useState(false);

  // --- Centralized Theme State ---
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
  // --- End Theme State ---

  const handleRegister = () => setIsRegistered(true);
  const handleLogin = () => setIsRegistered(true);

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
          <Route path="/" element={<Dashboard isRegistered={isRegistered} setIsRegistered={setIsRegistered} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route path="/dashboard" element={<Dashboard isRegistered={isRegistered} setIsRegistered={setIsRegistered} />} />
          {/* Pass theme and setTheme to Account */}
          <Route path="/account" element={<Account theme={theme} setTheme={setTheme} />} />
          <Route path="/map" element={<FullMap />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;