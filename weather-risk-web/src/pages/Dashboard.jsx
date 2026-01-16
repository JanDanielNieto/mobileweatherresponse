import React, { useState } from "react";
import FullMap from "./FullMap";
import WelcomePopup from "../components/WelcomePopup";
import Header from "../components/Header";

export default function Dashboard() {
  const [isPopupOpen, setIsPopupOpen] = useState(true);

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col overflow-hidden">
      <Header isPopupOpen={isPopupOpen} />
      <WelcomePopup isOpen={isPopupOpen} onClose={handleClosePopup} />
      <div className="flex-grow relative">
        <FullMap isPopupOpen={isPopupOpen} />
      </div>
    </div>
  );
}