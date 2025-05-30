import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { supabase } from "../supabase";
import FeaturesSlideshow from '../components/FeaturesSlideshow'; // Import the slideshow component

export default function Login({ onLogin }) { // Added onLogin prop
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Login failed: ${error.message}`);
    } else {
      setMessage("Login successful!");
      if (data.user) {
        // Use username from metadata if available, otherwise fallback to email or a generic user identifier
        const username = data.user.user_metadata?.username || data.user.email;
        onLogin(username); // Call onLogin to update App state
      }
      navigate("/dashboard"); // Navigate to dashboard
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Login Form */}
      <div className="w-1/3 bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
          <form onSubmit={handleLogin} className="space-y-4 flex flex-col items-center">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 rounded bg-gray-800 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 rounded bg-gray-800 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Login
            </button>
          </form>
          {message && <p className="mt-4 text-sm text-yellow-400 text-center">{message}</p>}

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Register
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Social Login Buttons - Placeholder */}
          <div className="space-y-2">
            <button
              className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
              onClick={() => alert("Google login - Coming Soon!")}
            >
              {/* SVG for Google can be added here */}
              Continue with Google
            </button>
            <button
              className="w-full flex items-center justify-center bg-[#1877F2] text-white py-2 px-4 rounded hover:bg-[#166FE5] transition-colors"
              onClick={() => alert("Facebook login - Coming Soon!")}
            >
              {/* SVG for Facebook can be added here */}
              Continue with Facebook
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