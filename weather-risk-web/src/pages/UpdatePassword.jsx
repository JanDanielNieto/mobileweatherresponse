import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import FeaturesSlideshow from '../components/FeaturesSlideshow'; // Import the slideshow component

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase client handles the session from the URL fragment automatically.
    // We listen for the SIGNED_IN event that occurs when the user follows the password recovery link.
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        // Check if this SIGNED_IN event is due to password recovery
        // Supabase automatically handles the token from the URL hash.
        // If a session is established, it means the token was valid.
        if (session && session.user) {
            // A common way to check if it's a recovery flow is if the session was initiated
            // and there's no specific 'type' in the URL that indicates otherwise,
            // or if you have a specific marker. For password recovery, Supabase handles this.
            // The key is that a session is established.
            console.log("User signed in via recovery link, session established.");
            setSessionReady(true);
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        // This event specifically indicates the password recovery flow has started
        // and the user is authenticated for changing their password.
        console.log("Password recovery event triggered, session should be ready.");
        setSessionReady(true);
      }
    });

    // Check initial session state as well, in case the event fired before listener was attached
    // or if the user refreshes the page.
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
            // If there's an active session on this page, assume it's from the recovery link
            console.log("Active session found on page load.");
            setSessionReady(true);
        } else {
            // No active session, could mean invalid/expired token or direct navigation
            // setError("Invalid or expired password reset link. Please request a new one.");
            // Consider not setting error immediately, wait for auth events or user action.
            console.log("No active session on page load.");
        }
    };
    checkSession();

    return () => {
      if (authListener && typeof authListener.unsubscribe === 'function') {
        authListener.unsubscribe();
      } else if (authListener && authListener.subscription && typeof authListener.subscription.unsubscribe === 'function') {
        // Handle the newer Supabase V2 subscription object
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!sessionReady) {
        setError("Password recovery session not active. Please use the link from your email.");
        return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: password });
    setLoading(false);

    if (updateError) {
      setError(`Failed to update password: ${updateError.message}`);
    } else {
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row"> {/* Changed to flex-col on mobile */}
      {/* Form Container - Full width on mobile, 1/3 on md and up */}
      <div className="w-full md:w-1/3 bg-gray-100 flex items-center justify-center p-4 md:p-8 order-2 md:order-1"> {/* Added p-4 for mobile, order for mobile layout */}
        <div className="bg-white p-6 md:p-8 rounded shadow-md w-full max-w-md"> {/* Increased max-w slightly, adjusted padding */}
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Update Password</h2>
          {!sessionReady && !error && (
              <p className="text-center text-yellow-500 mb-4">Verifying reset link...</p>
          )}
          {sessionReady && (
              <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
              <div>
                  <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                  >
                  New Password
                  </label>
                  <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" // Increased padding
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  />
              </div>
              <div>
                  <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                  >
                  Confirm New Password
                  </label>
                  <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 block w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" // Increased padding
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  />
              </div>
              {error && <p className="text-red-600 text-sm text-center">{error}</p>}
              {message && <p className="text-green-600 text-sm text-center">{message}</p>}
              <div>
                  <button
                  type="submit"
                  disabled={loading || !sessionReady}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50" // Increased padding and text size
                  >
                  {loading ? 'Updating...' : 'Update Password'}
                  </button>
              </div>
              </form>
          )}
          {error && !sessionReady && ( 
               <p className="text-red-600 text-sm text-center mt-4">{error}</p> /* Adjusted error text color */
          )}
          {!sessionReady && !error && (
              <div className="text-center mt-4">
                   <p className="text-sm text-gray-600">If you didn't receive an email or the link is invalid, please try resetting your password again.</p>
                   <button onClick={() => navigate('/login')} className="font-medium text-indigo-600 hover:text-indigo-500 mt-2">
                      Back to Login
                  </button>
              </div>
          )}
          {/* Link to login if session is ready but user wants to go back (optional) */}
          {sessionReady && (
            <div className="text-center mt-4">
                <button onClick={() => navigate('/login')} className="font-medium text-indigo-600 hover:text-indigo-500">
                    Back to Login
                </button>
            </div>
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
