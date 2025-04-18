import React, { useState, useEffect } from 'react';
import './LatestImage.css'; // You'll edit this too!
import { io } from "socket.io-client";
import { parseCustomDateString, formatDayDate, formatTime } from './utils/dateUtils';

function LatestImage() {
  const [allImages, setAllImages] = useState([]);
  const [displayedImages, setDisplayedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fadeClass, setFadeClass] = useState('');

  // Same background setup as before
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
        _id: `img_${index}_${Date.now()}`
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
    const centerImage = shuffled[0];
    const leftImage = shuffled[1] || centerImage;
    const rightImage = shuffled[2] || centerImage;

    setDisplayedImages([leftImage, centerImage, rightImage]);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Rotate all images every 15 seconds with fading transition
  useEffect(() => {
    if (allImages.length <= 1) return;

    const rotateAllImages = () => {
      setFadeClass('fade-out');

      setTimeout(() => {
        updateDisplayedImages(allImages);
        setFadeClass('');
      }, 500); // matches CSS animation duration
    };

    const intervalId = setInterval(rotateAllImages, 15000);
    return () => clearInterval(intervalId);
  }, [allImages]);

  // WebSocket setup
  useEffect(() => {
    const socket = io("https://web-collage-backend.onrender.com");
    socket.on("connect", () => console.log("Connected to WebSocket"));

    return () => socket.disconnect();
  }, []);
  const renderImage = (image, index) => {
    const isMiddle = index === 1;
    const imageClass = isMiddle ? "featured-image featured-image-main" : "featured-image featured-image-side";
    const itemFadeClass = fadeClass ? `fade-out-${index}` : '';
  
    return (
      <div key={image._id} className={`image-item ${isMiddle ? 'image-main' : 'image-side'} ${itemFadeClass}`}>
        <img 
          src={image.imageUrl}
          alt={image.metadata?.title || `Image ${index + 1}`} 
          className={imageClass}
        />
        <div className="caption">
          {image.metadata?.title && (
            <>
              <h3>{formatDayDate(parseCustomDateString(image.metadata.title))}</h3>
              <h3 style={{fontWeight:'400'}}>{formatTime(parseCustomDateString(image.metadata.title))}</h3>
            </>
          )}
        </div>
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