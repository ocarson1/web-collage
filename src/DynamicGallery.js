import React, { useState, useEffect } from 'react';
import './DynamicGallery.css';

function DynamicGallery() {
  const [images, setImages] = useState([]);
  const [displayedImages, setDisplayedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [changingIndex, setChangingIndex] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);

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

  // Fetch all images from the endpoint
  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://web-collage-backend.onrender.com/images');
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const allImages = await response.json();
      
      if (!allImages || allImages.length === 0) {
        throw new Error('No images found');
      }
      
      setImages(allImages);
      
      // Initially select 12 random images for display
      selectRandomImages(allImages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Select 12 random images from the pool of all images
  const selectRandomImages = (imagePool) => {
    const shuffled = [...imagePool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 12);
    setDisplayedImages(selected);
  };

  // Replace one random image every 15 seconds
  const replaceRandomImage = () => {
    if (images.length <= 12) return; // Need more than 12 images to swap
    
    // Select a random index from the displayed images
    const indexToChange = Math.floor(Math.random() * 12);
    setChangingIndex(indexToChange);
    setFadeOut(true);
    
    // After fade out animation completes, change the image
    setTimeout(() => {
      // Find an image that is not currently displayed
      let availableImages = images.filter(img => 
        !displayedImages.some(dImg => 
          (dImg._id && img._id && dImg._id === img._id) || 
          (dImg.url && img.url && dImg.url === img.url)
        )
      );
      
      if (availableImages.length === 0) {
        // If all images are displayed, just use the full pool
        availableImages = images;
      }
      
      // Select a random new image
      const newImage = availableImages[Math.floor(Math.random() * availableImages.length)];
      
      // Replace the image at the chosen index
      const newDisplayedImages = [...displayedImages];
      newDisplayedImages[indexToChange] = newImage;
      setDisplayedImages(newDisplayedImages);
      
      // Start fade in animation
      setFadeOut(false);
      
      // Reset changing index after animation completes
      setTimeout(() => {
        setChangingIndex(null);
      }, 500);
    }, 500); // 500ms for fade out animation
  };

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      // Set up interval to replace a random image every 15 seconds
      const intervalId = setInterval(replaceRandomImage, 2500);
      
      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [images, displayedImages]);

  return (
    <div className="dynamic-gallery-container">
      {loading && <div className="loading-hidden">Loading gallery...</div>}
      
      {error && <div className="error-hidden">Error: {error}</div>}
      
      {!loading && !error && (
        <div className="gallery-layout">
          <div className="image-grid">
            {displayedImages.map((image, index) => (
              <div 
                key={`${image._id || image.url}-${index}`} 
                className={`grid-item-d ${changingIndex === index ? (fadeOut ? 'fade-out' : 'fade-in') : ''}`}
              >
                <img 
                  src={image.url || image.imageUrl} 
                  alt={image.title || `Image ${index + 1}`} 
                  className="grid-image-d"
                />
              </div>
            ))}
          </div>
          
          <div className="text-area">
            {/* <h2 style={{fontWeight: '400'}}></h2> */}
            <h2>webcollage.xyz</h2>
          </div>
        </div>
      )}
    </div>
  );
}

export default DynamicGallery;