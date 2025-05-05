import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FeaturesSlideshow from '../components/FeaturesSlideshow'; // Corrected import name

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (username && password) {
      console.log("Simulating login for:", username);
      onLogin();
      navigate("/dashboard");
    } else {
      alert("Please enter your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Login Form */}
      <div className="w-1/3 bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm"> {/* Adjusted width */}
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 mb-4 border rounded text-gray-800"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded text-gray-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-2" // Added margin-bottom
            onClick={handleLoginClick}
          >
            Login
          </button>
          <button
            className="w-full text-sm text-purple-500 hover:underline"
            onClick={() => navigate("/register")}
          >
            Don't have an account? Register
          </button>
        </div>
      </div>

      {/* Right Column - Feature Slideshow */}
      <div className="w-2/3 bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
        <FeaturesSlideshow /> {/* Corrected component name */}
      </div>
    </div>
  );
}