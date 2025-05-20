// filepath: c:\Users\dropt\.vscode\mobileweatherresponse\weather-risk-web\src\pages\Location.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FeaturesSlideshow from '../components/FeaturesSlideshow'; // Import the slideshow component

// Accept onRegister prop to update the state in App.jsx
export default function Register({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    if (email && password) {
      // Simulate successful registration
      console.log("Simulating registration for:", email);
      onRegister(); // Call the function passed from App.jsx
      alert("Registration successful!");
      navigate("/dashboard"); // Navigate back to dashboard after registration
    } else {
      alert("Please fill in all fields.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Registration Form */}
      <div className="w-1/3 bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          {/* This should be correct */}
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h1>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-4 border rounded text-gray-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded text-gray-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 mb-2"
            onClick={handleRegisterClick}
          >
            Register
          </button>
          <button
            className="w-full text-sm text-blue-500 hover:underline"
            onClick={() => navigate("/login")}
          >
            Already have an account? Login
          </button>
        </div>
      </div>

      {/* Right Column - Feature Slideshow */}
      <div className="w-2/3 bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
        <FeaturesSlideshow />
      </div>
    </div>
  );
}