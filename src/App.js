import React, { useState, useEffect, useRef } from 'react';
import ImageGenerator from './ImageGenerator.js';
import FadingIcon from './components/FadingIcon.js';
import { Analytics } from "@vercel/analytics/react";
import Gallery from './Gallery.js';

import './App.css';
import domtoimage from 'dom-to-image'
import { saveAs } from "file-saver";




function App() {
  // State to store the pictures
  const [imageUrls, setImageUrls] = useState([]);
  const [color, setColor] = useState(null);
  const [textColor, setTextColor] = useState("#000000");
  // const [showTimestamp, setShowTimestamp] = useState(false);

  // New states for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);


  //Gallery functionality
  const [galImages, setGalImages] = useState([]);

  const fetchGallery = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://web-collage-backend.onrender.com/images');

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const pictures = await response.json();

      if (!pictures || pictures.length === 0) {
        throw new Error('No gallery data received');
      }

      if (Array.isArray(pictures)) {
        setGalImages(pictures);
      } else {
        console.error("Unexpected API response format:", pictures);
      }


      setGalImages(pictures);
      setIsLoading(false);

    } catch (error) {
      console.error('Error fetching trends:', error);
      setError(error.message);
      setIsLoading(false);

    }

  }



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

  const captureRef = useRef(null);

  const handleDownload = () => {
    const node = captureRef.current;

    if (!node) {
      console.error("Element to capture is not found!");
      return;
    }

    domtoimage
    .toBlob(node, {

      bgcolor: color

    }

    )
    .then(async (blob) => {  // Note the async here
      // Save the Blob as a file
      saveAs(blob, "captured-content.png");


  })
}

  const handleCaptureAndSave = () => {
    const node = captureRef.current;

    if (!node) {
      console.error("Element to capture is not found!");
      return;
    }

    domtoimage
    .toBlob(node, {

      bgcolor: color

    }

    )
    .then(async (blob) => {  // Note the async here
      // Save the Blob as a file
  
      const formData = new FormData();
      formData.append('image', blob, 'captured-content.png'); // Added filename
      formData.append('title', "Image");
      formData.append('description', "Description");
  
      try {
        // Await the fetch
        const response = await fetch('https://web-collage-backend.onrender.com/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        // Await the json parsing
        const result = await response.json();
        console.log('Upload successful:', result);
        alert('Upload successful! Refresh to see your collage in the live gallery.');
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during upload: ' + error.message);
      }
    })
    .catch((error) => {
      console.error("Oops, something went wrong!", error);
    });
  };

 
  const handleColorChange = (event) => {
    const selectedColor = event.target.value;
    setColor(selectedColor);
    setTextColor(getAccessibleTextColor(selectedColor))
    // Change the entire HTML background color
    document.documentElement.style.backgroundColor = selectedColor;
    document.body.style.backgroundColor = selectedColor;
  };

   // UseEffect to handle the fetch operation
   useEffect(() => {
    fetchTrends();
    fetchGallery();
      const initialColor = `#f0f0f0`; // e.g., '#ffffff' or 'blue'
     // Random Color
     // // `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
      setColor(initialColor);
      setTextColor(getAccessibleTextColor(initialColor));
      document.documentElement.style.backgroundColor = initialColor;
      document.body.style.backgroundColor = initialColor;


  }, []); // Empty dependency array means this runs once on component mount
  


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
        <div className="image-generator-section">
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
      <div className="image-generator-section"  ref={captureRef}>
        <FadingIcon />
        <ImageGenerator imageData={imageUrls} borderColor={textColor} />
      </div>
    );
  };

  return (

    <div className="app-container" style={{ background: color, color: textColor }} >
      <Analytics />
      {renderContent()}

      <div className="content-section" >
        <hr style={{ borderColor: textColor }}></hr>

        <div className="grid-container">
          <div style={{ lineHeight: "1.25" }}>
            <p style={{ lineHeight: "1.25" }}><span className="bold" style={{ lineHeight: "1.25" }}>⁕&nbsp;&nbsp;</span>   Generate images using keyboard input <span className="key-input" style={{ border: `1.75px solid ${textColor}` }}>a</span> → <span className="key-input" style={{ border: `1.75px solid ${textColor}` }}>z</span>.</p>
            <p style={{ lineHeight: "1.25" }}><span className="bold" style={{ lineHeight: "1.25" }}>⁕&nbsp;&nbsp; </span>   Hold <span className="key-input" style={{ border: `1.75px solid ${textColor}` }} >Shift</span> to view image details.</p>
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
            <button onClick={handleCaptureAndSave}>Submit to Live Gallery</button>
            <button onClick={handleDownload}>Download</button>

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
        <hr style={{ borderColor: textColor }}></hr>

      </div>
      <Gallery images={galImages}></Gallery>
      


    </div>

  );
}

export default App;