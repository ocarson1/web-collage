import React, { useState, useEffect } from 'react';
import ImageGenerator from './ImageGenerator.js';
import FadingIcon from './components/FadingIcon.js';
import { Analytics } from "@vercel/analytics/react"


import './App.css';

function App() {
  // State to store the pictures
  const [imageUrls, setImageUrls] = useState([]);
  const [color, setColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  // const [showTimestamp, setShowTimestamp] = useState(false);

  // New states for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchTrends = async () => {
    // Reset loading and error states
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://web-collage-backend.onrender.com/fetch-trends');
      
      // Handle non-200 responses
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const pictures = await response.json();
      
      // Validate data
      if (!pictures || pictures.length === 0) {
        throw new Error('No trends data received');
      }

      setImageUrls(pictures);
      setIsLoading(false);
      // Reset retry count on successful fetch
      setRetryCount(0);
    } catch (error) {
      console.error('Error fetching trends:', error);
      setError(error.message);
      setIsLoading(false);

      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const timeout = Math.pow(2, retryCount) * 1000; // Exponential backoff
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchTrends();
        }, timeout);
      }
    }
  };

  // UseEffect to handle the fetch operation
  useEffect(() => {
    fetchTrends();
  }, []); // Empty dependency array means this runs once on component mount

  const handleColorChange = (event) => {
    const selectedColor = event.target.value;
    setColor(selectedColor);
    setTextColor(getAccessibleTextColor(selectedColor))
    // Change the entire HTML background color
    document.documentElement.style.backgroundColor = selectedColor;
    document.body.style.backgroundColor = selectedColor;
  };

  const getAccessibleTextColor = (hexColor) => {
    // Your existing color calculation logic
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

    const [rLin, gLin, bLin] = [r, g, b].map((c) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    const luminance = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;

    return luminance > 0.179 ? "#000000" : "#ffffff";
  };

  // Render loading or error states
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="image-generator-container">
        <div className="loading-container" style={{ color: textColor }}>
          <p>&nbsp;&nbsp;Loading...</p>
          <FadingIcon />
        </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container" style={{ color: textColor }}>
          <p>Unable to fetch images. {error}</p>
          <button 
            onClick={fetchTrends} 
            style={{ 
              backgroundColor: textColor, 
              color: color, 
              border: 'none', 
              padding: '10px', 
              cursor: 'pointer' 
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="image-generator-container">
        <FadingIcon />
        <ImageGenerator imageData={imageUrls} borderColor={textColor}/>
      </div>
    );
  };

  return (
    
    <div className="app-container" style={{ background: color, color: textColor}} >
      <Analytics/>
      {renderContent()}
      
      <div className="content-section">
        <hr style={{borderColor: textColor}}></hr>

        <div className="grid-container">
          <div style={{ lineHeight: "1.25" }}>
            <p style={{ lineHeight: "1.25" }}><span className="bold" style={{ lineHeight: "1.25" }}>⁕&nbsp;&nbsp;</span>   Generate images using keyboard input <span className="key-input" style={{border: `1.75px solid ${textColor}` }}>a</span> → <span className="key-input" style={{border: `1.75px solid ${textColor}` }}>z</span>.</p>
            <p style={{ lineHeight: "1.25" }}><span className="bold" style={{ lineHeight: "1.25" }}>⁕&nbsp;&nbsp; </span>   Hold <span className="key-input"style={{border: `1.75px solid ${textColor}` }} >Shift</span> to view image details.</p>
            <p><span className="bold">⁕&nbsp;&nbsp; </span>   Expand an image by dragging its bottom-right corner.</p>
            <p><span className="bold">⁕&nbsp;&nbsp; </span>   Right-click on an image to remove it.</p>
            <p><span className="bold">⁕&nbsp;&nbsp; </span>   Refreshing the page will clear all content. </p>
          </div>
          <div></div>
          <div>
            <p>Background Color:&nbsp;    
              <input
                type="color"
                value={color}
                onChange={handleColorChange}
                style={{ cursor: "pointer" }}
              />
            </p>
            <label>
          {/* <input 
            type="checkbox" 
            checked={showTimestamp}
            onChange={(e) => setShowTimestamp(e.target.checked)}
          />
          Show Timestamp */}
        </label>
          </div>
        </div>
      </div>
      <Analytics/>
    </div>
    
  );
}

export default App;