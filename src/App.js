import React, { useState, useEffect, useRef } from 'react';
import ImageGenerator from './ImageGenerator.js';
import { Analytics } from "@vercel/analytics/react";
import Gallery from './Gallery.js';
import Instructions from './Instructions.js'

import './App.css';
import domtoimage from 'dom-to-image'
import { saveAs } from "file-saver";
import { isMobile } from "react-device-detect";

import downloadIcon from './components/download.svg'

import { io } from "socket.io-client"


function App() {
  const socketRef = useRef(null);

  // Initialize socket once when component mounts
  useEffect(() => {
    const serverURL = "https://web-collage-backend.onrender.com";
    socketRef.current = io(serverURL);
    
    socketRef.current.on("connect", () => {            
      console.log("Connected to server!");
    });
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const sendBang = () => {
    console.log("sending");
    if (socketRef.current) {
      socketRef.current.emit("bang");
    } else {
      console.error("Socket not connected");
    }
  }

  const [imageUrls, setImageUrls] = useState([]);
  const [color, setColor] = useState(null);
  const [textColor, setTextColor] = useState("#000000");

  // States for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  //Gallery functionality
  const [galImages, setGalImages] = useState([]);
  const [date, setDate] = useState(new Date())
  const [formData, setFormData] = useState({
    image: null,
    title: '',
    description: 'somewhere'
  })

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
      //const response = await fetch('http://localhost:3000/fetch-trends');

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
      })
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
        bgcolor: color,
        filter: (node) => {
          // Example: remove the "highlight" class from all nodes
          if (node.classList && node.classList.contains('selected-image')) {
            console.log("STYLECHECK")
            node.style.outline = 'none';
          }
        
          if (node.classList && node.classList.contains('exclude-from-capture')) {
            return false;
          }
        
          return true;
        }
      })
      .then(async (blob) => {  // Note the async here
        // Save the Blob as a file

        setFormData(prevData => ({
          ...prevData,
          image: blob,
        }))

        const formDataToSubmit = new FormData();
        formDataToSubmit.append('image', blob, 'captured-content.png');
        formDataToSubmit.append('title', formatDate1(date));
        formDataToSubmit.append('description', 'Submitted from ' + formData.description);

        console.log('form data', formData)

        try {
          // Await the fetch
          const response = await fetch('https://web-collage-backend.onrender.com/upload', {
            method: 'POST',
            body: formDataToSubmit,
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

  function formatDate1(date) {
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(/\//g, '.');
  }

  // Function to handle color updates from ImageGenerator
  const handleColorUpdate = (newColor, newTextColor) => {
    setColor(newColor);
    setTextColor(newTextColor);
    
    // Update document colors
    document.documentElement.style.backgroundColor = newColor;
    document.body.style.backgroundColor = newColor;
  };

  // UseEffect to handle the fetch operation
  useEffect(() => {
    setDate(new Date())
    fetchTrends();
    fetchGallery();
    const initialColor = `#f0f0f0`;
    setColor(initialColor);
    setTextColor("#000000"); // assuming black text for light gray background
    document.documentElement.style.backgroundColor = initialColor;
    document.body.style.backgroundColor = initialColor;
  }, []); // Empty dependency array means this runs once on component mount

  // Render loading or error states
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="image-generator-section" style={{ borderColor: textColor }}>
          <div className="loading-container" style={{ color: textColor }}>
            <p>&nbsp;&nbsp;Loading...</p>
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
              border: "none",
              padding: "10px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="interface-wrapper">
        <div className="image-generator-section" style={{ borderColor: textColor }}>
          <div className="image-generator-wrapper" ref={captureRef}>
            <ImageGenerator 
              imageData={imageUrls} 
              borderColor={textColor} 
              onSendBang={sendBang} 
              onColorChange={handleColorUpdate}
              currentColor={color}
              currentTextColor={textColor}
            />
          </div>
        </div>
        <div className="options">
          <h1>{formatDate1(date)}</h1>
          <div className="buttons">
            <button className="button-submit" onClick={handleCaptureAndSave}>Submit</button>
            <button className="button-download" onClick={handleDownload}>
              <img src={downloadIcon} alt="Download" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container" style={{ background: color, color: textColor }}>
      <Analytics />
      
      {/* Desktop-only content */}
      {!isMobile && (
        <>
          <div className="top-wrapper">
            <br></br>
            {renderContent()}
          </div>

          <div className="content-section">
            <div className="grid-container">
              <div style={{ lineHeight: "1.25" }}>
                <Instructions color={textColor} />
              </div>
              <div>
                {/* Color controls moved to ImageGenerator */}
              </div>
              <div>
              </div>
            </div>

            <hr style={{ backgroundColor: textColor }}></hr>
          </div>
        </>
      )}

      {/* Mobile-only message */}
      {isMobile && (
        <div>
          <p style={{ padding: "20px" }}>
            Submit collages on desktop to this public gallery!
          </p>
        </div>
      )}

      {/* Gallery always appears */}
      <Gallery images={galImages} />
    </div>
  );
}

export default App;