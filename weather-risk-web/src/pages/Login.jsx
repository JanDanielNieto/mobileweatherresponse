import React, { useState, useEffect } from "react"; // Import useEffect
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { supabase } from "../supabase";
import FeaturesSlideshow from '../components/FeaturesSlideshow'; // Import the slideshow component

export default function Login({ onLogin }) { // Added onLogin prop
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const adminEmail = "seiaweatherapp@gmail.com"; // Define admin email

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.altKey && event.key === 'a') {
        event.preventDefault();
        navigate('/devlogin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (email.toLowerCase() === adminEmail) {
      setMessage(`${adminEmail} is not allowed to be used for regular user login. Nice try.`);
      return;
    }

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

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage("");
    setMessage(""); // Clear main login message

    if (!forgotPasswordEmail) {
      setForgotPasswordMessage("Please enter your email address.");
      return;
    }

    // It's important to specify a redirectTo URL that points to a page in your app
    // where users can actually update their password after clicking the link in the email.
    // This page needs to be able to handle the reset token from the URL.
    // For now, using a placeholder. You'll need to create this page.
    const redirectTo = `${window.location.origin}/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
      redirectTo: redirectTo,
    });

    if (error) {
      setForgotPasswordMessage(`Error: ${error.message}`);
    } else {
      setForgotPasswordMessage("If an account exists for this email, a password reset link has been sent. Please check your inbox.");
      // Optionally hide the form again after a delay or keep it
      // setShowForgotPassword(false); 
      // setForgotPasswordEmail("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row"> {/* Changed to flex-col on mobile */}
      {/* Left Column - Login Form - Full width on mobile, 1/3 on md and up */}
      <div className="w-full md:w-1/3 bg-gray-100 flex items-center justify-center p-4 md:p-8 order-2 md:order-1"> {/* Added p-4 for mobile, order for mobile layout */}
        <div className="bg-white p-6 md:p-8 rounded shadow-md w-full max-w-md"> {/* Increased max-w slightly, adjusted padding */}
          {!showForgotPassword ? (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
              <form onSubmit={handleLogin} className="space-y-4 flex flex-col items-center">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:ring-blue-500 focus:border-blue-500" // Increased padding, added border
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:ring-blue-500 focus:border-blue-500" // Increased padding, added border
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 px-4 py-3 rounded hover:bg-blue-700 w-full text-white text-lg" // Increased padding and text size
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
                <p className="text-sm text-gray-600 mt-2">
                  <button
                    onClick={() => {
                      setShowForgotPassword(true);
                      setMessage(""); // Clear login messages
                      setForgotPasswordMessage(""); // Clear any previous forgot password messages
                    }}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot Password?
                  </button>
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
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Reset Password</h1>
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 flex flex-col items-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:ring-blue-500 focus:border-blue-500" // Increased padding, added border
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 px-4 py-3 rounded hover:bg-blue-700 w-full text-white text-lg" // Increased padding and text size
                >
                  Send Reset Link
                </button>
              </form>
              {forgotPasswordMessage && <p className="mt-4 text-sm text-yellow-400 text-center">{forgotPasswordMessage}</p>}
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordMessage(""); // Clear forgot password messages
                    setMessage(""); // Clear login messages
                  }}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Column - Feature Slideshow - Hidden on mobile, 2/3 on md and up */}
      <div className="w-full md:w-2/3 relative overflow-hidden hidden md:block order-1 md:order-2"> {/* Hidden on mobile, order for mobile layout */}
        <FeaturesSlideshow />
      </div>
    </div>
  );
}