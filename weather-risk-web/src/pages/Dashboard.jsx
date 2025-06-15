import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Weather from "./Weather";
import Location from "./Location";
import Emergency from "./Emergency";
import MiniMap from "../components/MiniMap";
import SeiaWeatherIcon from "../../public/SeiaWeather.png"; // Import the icon
import { supabase } from "../supabase"; // Corrected import path

export default function Dashboard({ isAdmin, isRegistered, setIsRegistered, loggedInUser, setLoggedInUser, setIsAdmin }) { // Added isAdmin
  const [activeComponent, setActiveComponent] = useState(null);
  const [activeComponentContext, setActiveComponentContext] = useState(null);
  const [pinnedWeatherData, setPinnedWeatherData] = useState(null);
  const [newlyPinnedEmergency, setNewlyPinnedEmergency] = useState(null); // New state for pinned emergency
  const [isFetchingLiveWeather, setIsFetchingLiveWeather] = useState(false);
  const [emergencyClearTrigger, setEmergencyClearTrigger] = useState(0); // New state to trigger emergency clear
  const [showContentViewOnMobile, setShowContentViewOnMobile] = useState(false); // ADDED: State to control mobile view
  const navigate = useNavigate();
  const justSetByViewWeatherClickRef = useRef(false);
  const prevActiveComponentRef = useRef(); // Ref to store previous activeComponent

  useEffect(() => {
    // This effect runs after activeComponent has been updated and the component has re-rendered.
    if (prevActiveComponentRef.current === 'weather' && activeComponent !== 'weather') {
      // We have navigated away from the Weather component.
      if (justSetByViewWeatherClickRef.current) {
        // If the Weather component was showing "live" weather data (ref is true),
        // it means that "live" context is now over.
        // We set the ref to false so that if the Weather component's cleanup runs,
        // it will now be allowed to clear the pinnedWeatherData.
        console.log("Dashboard.jsx: Navigated AWAY from Weather (was live). Setting justSetByViewWeatherClickRef to false.");
        justSetByViewWeatherClickRef.current = false;
      }
    }
    // Update previous active component ref for the next run.
    prevActiveComponentRef.current = activeComponent;
  }, [activeComponent]); // Dependency: only run when activeComponent changes.

  const handleLogout = () => {
    setIsRegistered(false); // Calls App's setIsRegistered
    setLoggedInUser(null);  // Calls App's setLoggedInUser, which will trigger App's useEffect
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('isAdmin'); // Ensure isAdmin is cleared from localStorage on logout
    supabase.auth.signOut(); // Ensure Supabase session is cleared
    setActiveComponent(null);
    setActiveComponentContext(null);
    setPinnedWeatherData(null);
    justSetByViewWeatherClickRef.current = false;
    setShowContentViewOnMobile(false); // Reset mobile view on logout
    console.log("Dashboard.jsx: Logout. justSetByViewWeatherClickRef set to false.");
    navigate("/login"); // Navigate to login page after logout
  };

  const showLocation = (item, context) => {
    console.log("Showing location for context:", context, "Item:", item);
    setActiveComponent("location");
    setActiveComponentContext(context);
    setShowContentViewOnMobile(true); // Show content view on mobile
    // If 'item' exists and context is 'viewEmergency', you might pass 'item' to Location component later
  };

  // Function to clear active component and context, e.g., when navigating away or closing a view
  const clearActiveComponent = () => {
    setActiveComponent(null);
    setActiveComponentContext(null);
    setShowContentViewOnMobile(false); // Hide content view on mobile when clearing
    // We don't necessarily clear pinnedWeatherData here,
    // as Weather component's unmount (if it was showing pinned data) would handle it.
    // If we want to explicitly clear it, then: setPinnedWeatherData(null);
    // justSetByViewWeatherClickRef.current = false; // Reset if clearing
  };

  const handleClearPinnedData = useCallback(() => {
    if (justSetByViewWeatherClickRef.current) {
      // If this flag is true, it means the pinnedWeatherData is "fresh" from a
      // live fetch or pin, and Weather component is likely in its Strict Mode
      // unmount/remount cycle. We want to protect the data from being cleared prematurely.
      // The flag will be set to false by other actions (e.g., navigating away from Weather,
      // starting a new live weather fetch, logging out).
      console.log("Dashboard.jsx: handleClearPinnedData - justSetByViewWeatherClickRef is true. IGNORING clear.");
      return; // Do not clear pinnedWeatherData
    }
    console.log("Dashboard.jsx: handleClearPinnedData - justSetByViewWeatherClickRef is false. Clearing pinnedWeatherData.");
    setPinnedWeatherData(null);
  }, [setPinnedWeatherData]); // setPinnedWeatherData is stable

  // Function to handle pinned emergency from Location.jsx
  const handleEmergencyPin = (emergencyDataFromLocation) => {
    console.log("Dashboard.jsx: handleEmergencyPin called with:", emergencyDataFromLocation);
    setNewlyPinnedEmergency(emergencyDataFromLocation);
    setActiveComponent("emergency"); // Switch view to the emergency list/modal
    setShowContentViewOnMobile(true); // Show content view on mobile
  };

  // Callback for Emergency.jsx to signal consumption of pinned data
  const handlePinnedEmergencyConsumed = useCallback(() => {
    console.log("Dashboard.jsx: Emergency component consumed the pinned data. Clearing newlyPinnedEmergency.");
    setNewlyPinnedEmergency(null);
  }, []);

  // Function to be called from Location.jsx to clear all emergencies
  const handleClearAllEmergenciesDashboard = () => {
    console.log("Dashboard.jsx: Clearing all emergencies trigger.");
    setEmergencyClearTrigger(prev => prev + 1); // Increment to trigger useEffect in Emergency.jsx
    // Optionally, could also clear newlyPinnedEmergency if it makes sense for the flow
    // setNewlyPinnedEmergency(null);
    // No need to change activeComponent here, Location component handles its own UI for the dev button
  };

  // Function to handle pinned weather location from Location.jsx
  const handleWeatherLocationPin = (data) => {
    // data contains { locationName, lat, lng, weatherData, addressDetails }
    let city = "Unknown City";
    if (data.addressDetails) {
      city = data.addressDetails.city || data.addressDetails.town || data.addressDetails.village || data.addressDetails.county || data.locationName.split(',')[0] || "N/A";
    } else if (data.locationName) {
      const parts = data.locationName.split(',');
      if (parts.length > 0) {
        city = parts[0].trim(); // Take the first part as a fallback for city
        if (parts.length > 1 && (parts[0].trim().toLowerCase() === "unnamed road" || parts[0].trim().match(/^\d/))) { // if first part is not a good city name
          city = parts[1].trim(); // try the second part
        }
      } else {
        city = data.locationName; // Full name if no comma
      }
    }

    try {
      const historyString = localStorage.getItem('frequentLocationsHistory');
      let history = historyString ? JSON.parse(historyString) : [];
      history.push({
        city: city,
        fullLocationName: data.locationName,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('frequentLocationsHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Error updating localStorage for frequent locations:", error);
    }

    setPinnedWeatherData(data);
    setActiveComponent("weather");
    setShowContentViewOnMobile(true); // Show content view on mobile
    // setActiveComponentContext("pinned"); // Context for how weather was activated
    if (data) {
        // This signifies that the pinnedWeatherData is fresh and should be protected
        // during Weather component's initial Strict Mode lifecycle.
        justSetByViewWeatherClickRef.current = true;
        console.log("Dashboard.jsx: Location Pinned. justSetByViewWeatherClickRef set to true.");
    }
  };

  const handleViewWeatherClick = () => {
    console.log("View Weather button clicked.");
    setActiveComponent(null); // Clear current component first
    setPinnedWeatherData(null); // Clear any existing pinned data
    setActiveComponentContext(null);
    // Reset the flag at the START of the operation. If fetching fails, it remains false.
    // If successful, it will be set to true before Weather component renders with new data.
    justSetByViewWeatherClickRef.current = false;
    console.log("Dashboard.jsx: handleViewWeatherClick start. justSetByViewWeatherClickRef set to false.");
    setIsFetchingLiveWeather(true);
    setShowContentViewOnMobile(true); // Show content view on mobile
    console.log("isFetchingLiveWeather set to true");

    if (navigator.geolocation) {
      console.log("Attempting to get geolocation...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log("Geolocation success:", position.coords);
          const { latitude, longitude } = position.coords;
          try {
            console.log(`Fetching reverse geocoding for lat: ${latitude}, lng: ${longitude}`);
            const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
            const nominatimResp = await fetch(nominatimUrl, { headers: { 'User-Agent': 'weather-risk-web/1.0' } });
            const nominatimData = await nominatimResp.json();
            console.log("Nominatim response:", nominatimData);
            const locationName = nominatimData.display_name || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
            const addressDetails = nominatimData.address;

            console.log(`Fetching weather data for ${locationName}`);
            const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;
            const meteoResp = await fetch(meteoUrl);
            const meteoData = await meteoResp.json();
            console.log("Open-Meteo response:", meteoData);

            const weatherPayload = {
              locationName,
              lat: latitude,
              lng: longitude,
              weatherData: meteoData,
              addressDetails,
            };
            console.log("Setting pinnedWeatherData with:", weatherPayload);
            setPinnedWeatherData(weatherPayload);
            console.log("Setting activeComponent to 'weather'");
            setActiveComponent("weather");
            setShowContentViewOnMobile(true); // Ensure content view is shown
            if (weatherPayload) { // Only set flag if we actually got data
                justSetByViewWeatherClickRef.current = true;
                console.log("Dashboard.jsx: Live weather fetched. justSetByViewWeatherClickRef set to true.");
            }
          } catch (err) {
            console.error("Error fetching live weather data (inside try-catch):", err);
            // justSetByViewWeatherClickRef.current remains false (set at start)
            setActiveComponent("weather"); // Still show weather component, it will handle no data
            setShowContentViewOnMobile(true); // Show content view on mobile
            console.log("Fell back to setting activeComponent to 'weather' after error.");
          }
          setIsFetchingLiveWeather(false);
          console.log("isFetchingLiveWeather set to false (after success/try-catch)");
        },
        (error) => {
          console.error("Geolocation error callback:", error.message, error);
          // justSetByViewWeatherClickRef.current remains false (set at start)
          setActiveComponent("weather"); // Still show weather component, it will handle error
          setShowContentViewOnMobile(true); // Show content view on mobile
          setIsFetchingLiveWeather(false);
          console.log("isFetchingLiveWeather set to false (after geolocation error)");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // justSetByViewWeatherClickRef.current remains false (set at start)
      setActiveComponent("weather"); // Still show weather component, it will handle no support
      setShowContentViewOnMobile(true); // Show content view on mobile
      setIsFetchingLiveWeather(false);
      console.log("isFetchingLiveWeather set to false (geolocation not supported)");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row"> {/* Changed to flex-col on mobile, md:flex-row for larger screens */}
      {/* Left Sidebar - Full width on mobile, 1/3 on md and up. Hidden on mobile if showContentViewOnMobile is true */}
      <div className={`
        ${showContentViewOnMobile && activeComponent ? 'hidden' : 'flex'} 
        md:flex flex-col justify-between 
        w-full md:w-1/3 bg-gray-100 dark:bg-gray-800 p-4 md:p-8
      `}>
        <div> {/* Container for top elements */}
          {/* New SeiaWeather Heading - Make it clickable */}
          <div className="text-center mb-4 cursor-pointer flex items-center justify-center" 
               onClick={() => { 
                 setActiveComponent(null); 
                 setPinnedWeatherData(null); 
                 setIsFetchingLiveWeather(false); 
                 justSetByViewWeatherClickRef.current = false; 
                 setShowContentViewOnMobile(false); // Hide content view, show sidebar
                 console.log("Dashboard.jsx: Header clicked. justSetByViewWeatherClickRef set to false."); 
               }}>
            <img src={SeiaWeatherIcon} alt="SeiaWeather Icon" className="h-10 w-10 mr-2" /> {/* Add icon here */}
            <h1 className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 font-serif">SeiaWeather</h1>
          </div>
          <h1 className="text-xl md:text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
            Dashboard
          </h1>
          {/* Increased padding and text size for buttons on all screens, full width by default */}
          <div className="flex flex-col items-center space-y-3 md:space-y-4"> 
            <button
              className="w-full bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 px-6 py-3 rounded text-lg md:text-base"
              onClick={handleViewWeatherClick} // This already sets showContentViewOnMobile
            >
              View Weather
            </button>
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 px-6 py-3 rounded text-lg md:text-base"
              onClick={() => {
                navigate('/map'); 
                // setShowContentViewOnMobile(true); // Not strictly needed for navigate, but good for consistency if map was inline
              }}
            >
              View Full Map
            </button>
            <button
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700 px-6 py-3 rounded text-lg md:text-base"
              onClick={() => { setActiveComponent("emergency"); setActiveComponentContext(null); setShowContentViewOnMobile(true); }}
            >
              View Emergencies
            </button>
            <button
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-cyan-600 dark:hover:bg-cyan-700 px-6 py-3 rounded text-lg md:text-base"
              onClick={() => { setActiveComponent("info"); setActiveComponentContext(null); setShowContentViewOnMobile(true); }}
            >
              Info
            </button>
            {isRegistered ? (
              <button
                className="w-full bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-700 px-6 py-3 rounded text-lg md:text-base"
                onClick={() => {
                  navigate("/account");
                  // setShowContentViewOnMobile(true); // For consistency if account was inline
                }}
              >
                Account
              </button>
            ) : (
              <button
                className="w-full bg-purple-500 hover:bg-purple-600 text-white dark:bg-purple-600 dark:hover:bg-purple-700 px-6 py-3 rounded text-lg md:text-base"
                onClick={() => {
                  navigate("/register");
                  // setShowContentViewOnMobile(true); // For consistency if register was inline
                }}
              >
                Register
              </button>
            )}
          </div>
        </div>
        <div>
          {isRegistered && (
            <button
              className="w-full bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 px-4 py-2 rounded text-base md:text-sm mt-6 md:mt-8"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Right Content Area - Full width on mobile if active, 2/3 on md and up. Hidden on mobile if showContentViewOnMobile is false and activeComponent is null */}
      <div className={`
        ${(!activeComponent || !showContentViewOnMobile) ? 'hidden' : 'block'} 
        md:block w-full md:w-2/3 bg-blue-50 dark:bg-[#242424] text-blue-900 dark:text-[rgba(255,255,255,0.87)] p-4 md:p-8 flex flex-col transition-colors duration-300 relative
      `}>
        {/* Back to Dashboard button for mobile - only shown when a component is active */}
        {activeComponent && (
          <button 
            className="md:hidden bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded mb-4 self-start"
            onClick={() => {
              setActiveComponent(null); 
              setPinnedWeatherData(null); 
              setIsFetchingLiveWeather(false); 
              justSetByViewWeatherClickRef.current = false; 
              setShowContentViewOnMobile(false); // Hide content view, show sidebar
            }}
          >
            &larr; Back to Dashboard
          </button>
        )}
        {/* Main dynamic content area - takes up available space */}
        <div className="flex-grow flex flex-col items-center justify-start pt-8 overflow-y-auto"> {/* MODIFIED: justify-start, pt-8, overflow-y-auto */}
          {isFetchingLiveWeather && <p className="text-lg px-4">Fetching your location and weather...</p>}
          {!isFetchingLiveWeather && activeComponent === null && (
            <div className="text-justify p-4 w-full"> {/* MODIFIED: Removed max-w-2xl, max-h-[60vh] and added w-full */}
              <h2 className="text-3xl font-bold mb-6 text-blue-700 dark:text-blue-300">Welcome to SeiaWeather!</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Emergencies Qualified for the system:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Floods</li>
                  <li>Earthquakes</li>
                  <li>Landslides</li>
                  <li>Fires</li>
                  
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Emergencies not listed for the system:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Vehicular Accidents</li>
                  <li>Medical Accidents</li>
                  <li>Missing Person Incidents</li>
                  <li>Criminal Incidents</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">Philippine Emergency Hotlines:</h3>
                <ul className="list-none space-y-1 text-gray-700 dark:text-gray-300">
                  <li><strong>National Emergency Hotline:</strong> 911</li>
                  <li><strong>Philippine Red Cross:</strong> 143</li>
                  <li><strong>NDRRMC (National Disaster Risk Reduction and Management Council):</strong> (02) 8911-5061 to 65, (02) 8912-2665, (02) 8912-5668</li>
                  <li><strong>BFP (Bureau of Fire Protection):</strong> (02) 8426-0219, (02) 8426-0246</li>
                  <li><strong>PAGASA (Weather Bureau):</strong> (02) 8284-0800</li>
                </ul>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">In case of immediate danger, always contact local authorities or dial 911 first.</p>
              </div>
            </div>
          )}
          {!isFetchingLiveWeather && activeComponent === "info" && (
            <div className="text-justify p-4 w-full max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-blue-700 dark:text-blue-300">App Information & Tutorial</h2>

              <div className="space-y-6">
                <section>
                  <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">1. View Weather</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    The <strong>View Weather</strong> section allows you to see the current weather conditions and a forecast for your current location by default. 
                    You can also pin a new location on the map (accessed via the Location tab that appears) to get weather details for a specific area. 
                    This is useful for checking weather in areas you plan to visit or are concerned about.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">2. View Full Map</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    The <strong>View Full Map</strong> section provides an interactive map where you can see all reported emergencies and weather pins. 
                    It gives a comprehensive geographical overview of ongoing events and weather alerts. You can pan, zoom, and click on markers for more details.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">3. View Emergencies</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    In <strong>View Emergencies</strong>, you can see a list of all currently active reported emergencies. 
                    If you are registered and logged in, you can also report a new emergency by clicking the "Add Emergency" button. This will take you to a map where you can pin the location of the emergency and provide details like type, severity, and a description.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">4. Account</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    The <strong>Account</strong> section (available if you are registered and logged in) allows you to manage your profile settings. 
                    Here, you can update your username, email, password, and manage preferences such as enabling or disabling email notifications for reported emergencies.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">General Flow:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>Check Weather:</strong> Start by checking the weather for your current location or a specific area.</li>
                    <li><strong>View Map:</strong> Use the Full Map to get a broader understanding of weather patterns and reported incidents.</li>
                    <li><strong>Report/View Emergencies:</strong> If you encounter an emergency (like floods, fires, earthquakes), report it. You can also view emergencies reported by others.</li>
                    <li><strong>Manage Account:</strong> Keep your account details up-to-date and configure your notification preferences.</li>
                  </ol>
                </section>
              </div>
            </div>
          )}
          {!isFetchingLiveWeather && activeComponent === "weather" && <Weather initialData={pinnedWeatherData} clearInitialData={handleClearPinnedData} onSelectLocation={(item, context) => showLocation(item, context)} />}
          {!isFetchingLiveWeather && activeComponent === "location" && 
            <Location 
              isRegistered={isRegistered} 
              context={activeComponentContext} 
              onWeatherLocationPin={handleWeatherLocationPin} 
              onEmergencyPin={handleEmergencyPin} 
              loggedInUser={loggedInUser} 
            />
          }
          {!isFetchingLiveWeather && activeComponent === "emergency" && 
            <Emergency 
              isAdmin={isAdmin} // <-- PASS isAdmin prop
              onSelectEmergency={(item, context) => showLocation(item, context)} 
              isRegistered={isRegistered} 
              navigate={navigate} 
              pinnedEmergency={newlyPinnedEmergency} 
              onPinnedEmergencyConsumed={handlePinnedEmergencyConsumed} 
              clearTrigger={emergencyClearTrigger} // Pass the trigger
              onDevClearAllRequest={handleClearAllEmergenciesDashboard} // Pass the dashboard's clear function
            />
          }
        </div>

        {/* MiniMap positioned in the corner, shown only when intro is visible */}
        {!isFetchingLiveWeather && activeComponent === null && (
          <div className="absolute bottom-8 right-8 w-64 h-64 shadow-xl rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
            <MiniMap />
          </div>
        )}

        {/* Welcome Message - at the bottom of this right content area */}
        {loggedInUser && (
          <div className="pt-4 text-center text-sm text-gray-700 dark:text-gray-300">
            Welcome, {loggedInUser}!
          </div>
        )}
      </div>
    </div>
  );
}