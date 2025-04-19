import React, { useState, useEffect } from 'react';
import './LatestImage.css';
import { io } from "socket.io-client";

function LatestImage() {
  const [allImages, setAllImages] = useState([]);
  const [displayedImages, setDisplayedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFading, setIsFading] = useState(false);

  // Background setup
  useEffect(() => {
    document.body.style.backgroundColor = "#000000";
    document.documentElement.style.backgroundColor = "#000000";
    
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.style.backgroundColor = "#000000";
      appContainer.style.color = "#ffffff";
    }
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://web-collage-backend.onrender.com/images');
      
      if (!response.ok) throw new Error('Failed to fetch images');
      
      const images = await response.json();
      if (!images || images.length === 0) throw new Error('No images found');

      const imagesWithIds = images.map((img, index) => ({
        ...img,
        _id: img._id || `img_${index}_${Date.now()}`
      }));
      
      setAllImages(imagesWithIds);
      updateDisplayedImages(imagesWithIds);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const updateDisplayedImages = (images) => {
    if (images.length === 0) return;
    
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setDisplayedImages(selected);
  };

  // Initialize images when component mounts
  useEffect(() => {
    fetchImages();
    
    // WebSocket setup
    const socket = io("https://web-collage-backend.onrender.com");
    socket.on("connect", () => console.log("Connected to WebSocket"));
    
    return () => socket.disconnect();
  }, []);

  // Rotate all images every 30 seconds
  useEffect(() => {
    if (allImages.length < 3) return;
    
    const rotateImages = () => {
      // Start fade out
      setIsFading(true);
      
      // After fade out completes, update images and fade back in
      setTimeout(() => {
        updateDisplayedImages(allImages);
        setIsFading(false);
      }, 600); // matches CSS transition duration
    };
    
    // Initial rotation after 30 seconds
    const timeoutId = setTimeout(rotateImages, 30000);
    
    // Then set interval for subsequent rotations
    const intervalId = setInterval(rotateImages, 30000);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [allImages]);

  const renderImage = (image, index) => {
    const isMiddle = index === 1;
    const imageClass = isMiddle ? "featured-image featured-image-main" : "featured-image featured-image-side";
  
    return (
      <div 
        key={image._id} 
        className={`image-item ${isMiddle ? 'image-main' : 'image-side'} ${isFading ? 'fade-out' : ''}`}
      >
        <img 
          src={image.imageUrl}
          alt={`Image ${index + 1}`} 
          className={imageClass}
        />
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
          {displayedImages.length > 0 ? (
            displayedImages.map((image, index) => renderImage(image, index))
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