import React, { useState, useEffect } from 'react';
import { slidesData } from '../data/slidesData'; // Import the slide data

export default function FeaturesSlideshow() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    console.log("Setting up interval..."); // Log setup
    const intervalId = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % slidesData.length;
        console.log(`Interval fired: Changing slide index from ${prevIndex} to ${nextIndex}`); // Log interval fire
        return nextIndex;
      });
    }, 5000); // 60 seconds - consider shortening for testing (e.g., 5000 for 5s)

    // Log initial state
    console.log("Initial Slide Index:", 0, "Slide Title:", slidesData[0].title);

    return () => {
      console.log("Clearing interval..."); // Log cleanup
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array is correct here

  const currentSlide = slidesData[currentSlideIndex];

  // Log current slide data on each render
  console.log("Rendering Slide Index:", currentSlideIndex, "Slide Title:", currentSlide.title);

  return (
    <div className="text-center max-w-lg w-full">
      <div key={currentSlideIndex} className="animate-fade-in">
        {currentSlide.imageUrl && (
          <img
            src={currentSlide.imageUrl}
            alt={currentSlide.title}
            className="w-full h-48 object-cover rounded-lg mb-6 shadow-md"
          />
        )}
        <h2 className="text-3xl font-bold mb-3">{currentSlide.title}</h2>
        <p className="text-lg text-gray-300">
          {currentSlide.description}
        </p>
      </div>
    </div>
  );
}

// Optional: Add a simple fade-in animation in your index.css if you want
/*
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }
}
*/