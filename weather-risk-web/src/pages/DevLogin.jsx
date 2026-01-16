import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase"; // Assuming supabase client might be used later

export default function DevLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const username = "admin1"; // Pre-filled username
  const adminEmail = "seiaweatherapp@gmail.com"; // Admin's actual Supabase email

  const handleDevLoginSuccess = () => {
    // App state knows the user as 'admin1' for UI/logic purposes
    if (typeof setIsAdmin === 'function') {
      setIsAdmin(true);
    }
    if (typeof setLoggedInUser === 'function') {
      setLoggedInUser(username); // Set to 'admin1'
    }
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("loggedInUser", username); // Store 'admin1'
    navigate("/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (username === "admin1" && password === "EdenTreaty") {
      try {
        // Authenticate with Supabase using the actual admin email and password
        const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: password,
        });

        if (supabaseError) {
          console.error("Supabase login error during dev login:", supabaseError.message);
          setError(`Supabase login failed: ${supabaseError.message}`);
          return;
        }

        // Supabase login successful, now set app state for 'admin1'
        console.log("Dev admin Supabase login successful for", adminEmail);
        handleDevLoginSuccess();

      } catch (err) {
        console.error("Error during dev login Supabase auth:", err);
        setError("An unexpected error occurred during Supabase authentication.");
      }
    } else {
      setError("Invalid credentials for dev login.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Dev Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              readOnly
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Dev Login
          </button>
        </form>
      </div>
    </div>
  );
}
