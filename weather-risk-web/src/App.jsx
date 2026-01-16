import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FullMap from "./pages/FullMap";
import Weather from "./pages/Weather";
import UpdatePassword from "./pages/UpdatePassword";
import DevLogin from "./pages/DevLogin";
import Location from "./pages/Location";
import './css/index.css';

function App() {
  const [emergencyData, setEmergencyData] = useState(null);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? 'light' : 'dark';
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

  const themeClasses = theme === 'light'
    ? 'bg-blue-50 text-blue-950'
    : 'bg-[#242424] text-[rgba(255,255,255,0.87)]';

  return (
    <div className={`min-h-screen ${themeClasses} transition-colors duration-300`}>
      <Router>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard emergencyData={emergencyData} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/devlogin" element={<DevLogin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fullmap" element={<FullMap />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/location" element={<Location onEmergencyPin={setEmergencyData} />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;