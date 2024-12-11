import React, { useState, useEffect } from 'react';
import '../styles/FadingIcon.css';

const FadingIcon = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFastFade, setIsFastFade] = useState(false);


  useEffect(() => {
    // Initial timeout to start fade
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    // Handle scroll event
    const handleScroll = () => {
      setIsVisible(false);
    };

    // Handle keypress event
    const handleKeyPress = (event) => {
      // Check if the pressed key is between A and Z (uppercase or lowercase)
      if ((event.keyCode >= 65 && event.keyCode <= 90) || 
          (event.keyCode >= 97 && event.keyCode <= 122)) {
        setIsVisible(false);
        setIsFastFade(true); // Trigger immediate fade for A-Z keys

      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keypress', handleKeyPress);

    // Cleanup function to remove event listeners
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, []);

  return (
    <div 
      className={`fading-icon 
        ${isVisible ? 'visible' : 'hidden'}
        ${isFastFade ? 'fast-fade' : ''}`}
    >
      <img 
        src="./question.png" 
        alt="Loading Icon" 
        className="centered-icon"
      />
    </div>
  );
};

export default FadingIcon;