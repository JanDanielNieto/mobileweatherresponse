import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
// import Weather from "./pages/Weather"; // Likely not needed as separate routes
// import Location from "./pages/Location"; // Likely not needed as separate routes
import Account from "./pages/Account";
import FullMap from "./pages/FullMap"; // Import the new FullMap component
// Import Emergency if needed as a standalone page, but it's used within Dashboard here
// import Emergency from "./pages/Emergency";

function App() {
  const [isRegistered, setIsRegistered] = React.useState(false);

  const handleRegister = () => {
    setIsRegistered(true);
  };

  const handleLogin = () => {
    setIsRegistered(true);
  };

  return (
    <Router>
      <Routes>
        {/* Default route is Dashboard */}
        <Route path="/" element={<Dashboard isRegistered={isRegistered} setIsRegistered={setIsRegistered} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleRegister} />} />
        <Route path="/dashboard" element={<Dashboard isRegistered={isRegistered} setIsRegistered={setIsRegistered} />} />
        <Route path="/account" element={<Account />} />
        {/* Add route for the full map page */}
        <Route path="/map" element={<FullMap />} />
      </Routes>
    </Router>
  );
}

export default App;