import React, { useState, useEffect } from 'react';
import './LatestImage.css';
import { io } from "socket.io-client";
import { parseCustomDateString, formatDayDate, formatTime } from './utils/dateUtils';

function LatestImage() {
  const [latestImage, setLatestImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set the body and app-container background to black when this component mounts
  useEffect(() => {
    // Save the original background colors
    // const originalBodyBg = document.body.style.backgroundColor;
    const appContainer = document.querySelector('.app-container');
    // const originalContainerBg = appContainer ? appContainer.style.backgroundColor : null;
    // const originalContainerColor = appContainer ? appContainer.style.color : null;
    
    // Set the body background to black
    document.body.style.backgroundColor = "#000000";
    document.documentElement.style.backgroundColor = "#000000";

    
    // Also set the app-container background if it exists
    if (appContainer) {
      appContainer.style.backgroundColor = "#000000";
      appContainer.style.color = "#ffffff";
    }
    
    // Restore the original background colors when unmounting
    
  }, []);

  const fetchLatestImage = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://web-collage-backend.onrender.com/images');
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const images = await response.json();
      
      if (!images || images.length === 0) {
        setLatestImage(null);
        throw new Error('No images found');
      }
      
      // Get the last image in the array
      const lastImageIndex = images.length - 1;
      setLatestImage(images[lastImageIndex]);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching the latest image:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestImage();
    
    // Set up polling to check for new images every 30 seconds
    const intervalId = setInterval(fetchLatestImage, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Set up a WebSocket listener for real-time updates
  useEffect(() => {
    const socket = io("https://web-collage-backend.onrender.com");
    
    socket.on("connect", () => {
      console.log("Connected to WebSocket for image updates");
    });
    
    // Listen for new image notifications
    socket.on("imageAdded", () => {
      console.log("New image detected, updating...");
      fetchLatestImage();
    });
    
    // Clean up socket on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="latest-image-container dark-theme">

      {/* <h1>Latest Image</h1> */}
      
      {/* {loading && <div className="loading">Loading latest image...</div>}
      
      {error && <div className="error">Error: {error}</div>} */}
      
      {!loading && !error && latestImage && (
        <div className="image-display">
          <img 
            src={latestImage.url || latestImage.imageUrl} 
            alt={latestImage.title || "Latest image"} 
            className="featured-image"
          />
          <div className="caption">
                                  <h3>{formatDayDate(parseCustomDateString(latestImage.metadata.title))}</h3>
                                  <h3 style={{fontWeight:'400'}}>{formatTime(parseCustomDateString(latestImage.metadata.title))}</h3>
          
                                  {/* <p>{image.metadata.description}</p> */}
                              </div>
          {latestImage.title && <h2>{latestImage.title}</h2>}
          {latestImage.description && <p>{latestImage.description}</p>}
        </div>
      )}
      
      {!loading && !error && !latestImage && (
        <div style={{height: '100vw'}}></div>
        // <div className="no-images">No images available</div>
      )}
{/*       
      <button onClick={fetchLatestImage} className="refresh-button">
        Refresh
      </button> */}
              <div style={{height: '100vw'}}></div>

    </div>
  );
}

export default LatestImage;