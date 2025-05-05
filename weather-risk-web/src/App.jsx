import React, { useState, useEffect } from "react"; // Import useState and useEffect
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import FullMap from "./pages/FullMap";

function App() {
  const [isRegistered, setIsRegistered] = useState(false);

  // Apply theme on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark if nothing saved
    const root = window.document.documentElement;
    if (savedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []); // Empty dependency array means this runs only once on mount

  const handleRegister = () => {
    setIsRegistered(true);
  };

  const handleLogin = () => {
    setIsRegistered(true);
  };

  return (
    <Router>
      <Routes>
        {/* Routes remain the same */}
        <Route path="/" element={<Dashboard isRegistered={isRegistered} setIsRegistered={setIsRegistered} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleRegister} />} />
        <Route path="/dashboard" element={<Dashboard isRegistered={isRegistered} setIsRegistered={setIsRegistered} />} />
        <Route path="/account" element={<Account />} />
        <Route path="/map" element={<FullMap />} />
      </Routes>
    </Router>
  );
}

export default App;