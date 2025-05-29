import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FeaturesSlideshow from '../components/FeaturesSlideshow';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState(""); // Changed from username to email
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (email && password) { // Changed from username to email
      console.log("Simulating login for:", email); // Changed from username to email
      onLogin();
      navigate("/dashboard");
    } else {
      alert("Please enter your credentials.");
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google login logic
    console.log("Google login clicked");
    alert("Google login - Coming Soon!");
  };

  const handleFacebookLogin = () => {
    // Placeholder for Facebook login logic
    console.log("Facebook login clicked");
    alert("Facebook login - Coming Soon!");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Login Form */}
      <div className="w-1/3 bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          {/* This should be correct */}
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
          <input
            type="email" // Changed from text to email
            placeholder="Email" // Changed from Username to Email
            className="w-full p-2 mb-4 border rounded text-gray-800"
            value={email} // Changed from username to email
            onChange={(e) => setEmail(e.target.value)} // Changed from setUsername to setEmail
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded text-gray-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-2"
            onClick={handleLoginClick}
          >
            Login
          </button>
          <button
            className="w-full text-sm text-purple-500 hover:underline mb-4" // Added mb-4 for spacing
            onClick={() => navigate("/register")}
          >
            Don't have an account? Register
          </button>

          {/* Divider */}
          <div className="flex items-center mb-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-2">
            {/* Google Login Button */}
            <button
              className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Log in with Google
            </button>

            {/* Facebook Login Button */}
            <button
              className="w-full flex items-center justify-center bg-[#1877F2] text-white py-2 px-4 rounded hover:bg-[#166FE5] transition-colors"
              onClick={handleFacebookLogin}
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Log in with Facebook
            </button>
          </div>
        </div>
      </div>

      {/* Right Column - Feature Slideshow */}
      <div className="w-2/3 relative overflow-hidden">
        <FeaturesSlideshow />
      </div>
    </div>
  );
}