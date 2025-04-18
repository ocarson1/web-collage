import React, { useState, useEffect } from 'react';
import './LatestImage.css';
import { io } from "socket.io-client";
import { parseCustomDateString, formatDayDate, formatTime } from './utils/dateUtils';

function LatestImage() {
  const [recentImages, setRecentImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set the body and app-container background to black when this component mounts
  useEffect(() => {
    document.body.style.backgroundColor = "#000000";
    document.documentElement.style.backgroundColor = "#000000";
    
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.style.backgroundColor = "#000000";
      appContainer.style.color = "#ffffff";
    }
  }, []);

  const fetchRecentImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://web-collage-backend.onrender.com/images');
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const images = await response.json();
      
      if (!images || images.length === 0) {
        setRecentImages([]);
        throw new Error('No images found');
      }
      
      // Get the three most recent images (or all if less than three)
      const count = Math.min(images.length, 3);
      const recent = images.slice(images.length - count).reverse();
      setRecentImages(recent);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recent images:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentImages();
    
    // Set up polling to check for new images every 30 seconds
    const intervalId = setInterval(fetchRecentImages, 30000);
    
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
      fetchRecentImages();
    });
    
    // Clean up socket on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // Render helper for each image
  const renderImage = (image, index, total) => {
    const isMiddle = (total === 3 && index === 1) || (total === 2 && index === 0) || total === 1;
    const imageClass = isMiddle ? "featured-image featured-image-main" : "featured-image featured-image-side";
    
    return (
      <div key={image._id || index} className={`image-item ${isMiddle ? 'image-main' : 'image-side'}`}>
        <img 
          src={image.url || image.imageUrl} 
          alt={image.title || `Image ${index + 1}`} 
          className={imageClass}
        />
        <div className="caption">
          <h3>{formatDayDate(parseCustomDateString(image.metadata.title))}</h3>
          <h3 style={{fontWeight:'400'}}>{formatTime(parseCustomDateString(image.metadata.title))}</h3>
        </div>
        {image.title && <h2>{image.title}</h2>}
        {image.description && <p>{image.description}</p>}
      </div>
    );
  };

  return (
    <div className="latest-image-container dark-theme">
              <div style={{height: '10vh'}}></div>

      {loading && <div className="loading-hidden">Loading images...</div>}
      
      {error && <div className="error-hidden">Error: {error}</div>}
      
      {!loading && !error && (
        <div className="images-gallery">
          {recentImages.length > 0 ? (
            recentImages.map((image, index) => renderImage(image, index, recentImages.length))
          ) : (
            <div style={{height: '100vh'}}></div>
          )}
        </div>
      )}
      
      <div style={{height: '100vh'}}></div>
    </div>
  );
}

export default LatestImage;