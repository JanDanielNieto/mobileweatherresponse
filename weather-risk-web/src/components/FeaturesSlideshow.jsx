import React, { useState, useEffect } from 'react';
import { slidesData } from '../data/slidesData';

export default function FeaturesSlideshow() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    console.log("Setting up interval...");
    const intervalId = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % slidesData.length;
        console.log(`Interval fired: Changing slide index from ${prevIndex} to ${nextIndex}`);
        return nextIndex;
      });
    }, 5000);

    console.log("Initial Slide Index:", 0, "Slide Title:", slidesData[0].title);

    return () => {
      console.log("Clearing interval...");
      clearInterval(intervalId);
    };
  }, []);

  // Reset image load error when slide changes
  useEffect(() => {
    setImageLoadError(false);
  }, [currentSlideIndex]);

  const currentSlide = slidesData[currentSlideIndex];

  return (
    <div className="relative w-full h-full">
      {/* Background Image or Fallback */}
      {currentSlide.imageUrl && !imageLoadError ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${currentSlide.imageUrl})`,
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        />
      )}
      
      {/* Hidden image to detect load errors */}
      {currentSlide.imageUrl && (
        <img
          src={currentSlide.imageUrl}
          alt=""
          style={{ display: 'none' }}
          onError={() => {
            setImageLoadError(true);
          }}
          onLoad={() => {
            setImageLoadError(false);
          }}
        />
      )}
      
      {/* Semi-transparent overlay for better text readability - using rgba instead of bg-black */}
      <div 
        className="absolute inset-0" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      />
      
      {/* Content */}
      <div key={currentSlideIndex} className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center max-w-lg w-full px-8">
          <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-2xl">{currentSlide.title}</h2>
          <p className="text-xl text-gray-100 drop-shadow-xl">
            {currentSlide.description}
          </p>
        </div>
      </div>
    </div>
  );
}