import React, { useState, useEffect } from 'react';
import ImageGenerator from './ImageGenerator.js';
import FadingIcon from './components/FadingIcon.js';

import './App.css';

function App() {

  // State to store the pictures
  const [imageUrls, setImageUrls] = useState([]);
  const [color, setColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");

  

  const handleColorChange = (event) => {
    const selectedColor = event.target.value;
    setColor(selectedColor);
    setTextColor(getAccessibleTextColor(selectedColor))
    // Change the entire HTML background color
    document.documentElement.style.backgroundColor = selectedColor;
    document.body.style.backgroundColor = selectedColor;
  };

  const getAccessibleTextColor = (hexColor) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

    // Apply gamma correction
    const [rLin, gLin, bLin] = [r, g, b].map((c) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    // Calculate relative luminance
    const luminance = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;

    // Return white for dark backgrounds and black for light backgrounds
    return luminance > 0.179 ? "#000000" : "#ffffff";
};


  // UseEffect to handle the fetch operation
  useEffect(() => {
    fetch('https://web-collage-backend.onrender.com/fetch-trends')
      .then(response => response.json())
      .then(pictures => {
        // Update the state with the fetched pictures
        setImageUrls(pictures);
      })
      .catch(error => {
        console.error('Error fetching trends:', error);
      });
  }, []); // Empty dependency array means this runs once on component mount

  return (
    <div className="app-container" style={{ background: color, color: textColor}} >
      <div className="image-generator-container">
        <FadingIcon></FadingIcon>
        <ImageGenerator imageData={imageUrls} borderColor={textColor}/>
      </div>
      <div className="content-section">



        <hr style={{borderColor: textColor}}></hr>


        <div className="grid-container">
          <div style={{ lineHeight: "1.25" }}>
            <p><span className="bold">⁕&nbsp;&nbsp;</span>   Generate images using <span className="key-input" style={{border: `1.75px solid ${textColor}` }}>a</span> → <span className="key-input" style={{border: `1.75px solid ${textColor}` }}>z</span></p>
            <p><span className="bold">⁕&nbsp;&nbsp; </span>   Hold <span className="key-input"style={{border: `1.75px solid ${textColor}` }} >Shift</span> to view image info</p>
            <p><span className="bold">⁕&nbsp;&nbsp; </span>   Resize images by dragging the bottom right corner </p>
            <p><span className="bold">⁕&nbsp;&nbsp; </span>   Right click on images to remove them </p>
            <p><span className="bold">⁕&nbsp;&nbsp; </span>   Refreshing will clear the page </p></div>
          {/* <p><span className="bold">①</span>  Generate images using <span className="key-input">a</span> - <span className="key-input">z</span></p>
            <p><span className="bold">②</span>  Hold <span className="key-input">Shift</span> to view image info</p>
            <p><span className="bold">③</span>  Resize images by dragging the bottom right corner </p>
            <p><span className="bold">④</span>  Right click on images to remove them </p>
            <p><span className="bold">⑤</span>  Refreshing will clear the page </p></div> */}
          {/* <div><h2>⚙️ Settings</h2><p>Show Date</p>
            <p>Light/Dark Mode</p>
            <p>Images</p>
            <p>Text</p></div> */}
          <div>
            
        </div>
        <div><p>Background Color:&nbsp;    <input
              type="color"
              value={color}
              onChange={handleColorChange}
              style={{ cursor: "pointer" }}
            /></p></div>
        </div>






        {/* Your additional content goes here */}
      </div>
    </div>
  );

}

export default App;