import { React, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import './Instructions.css';

const Instructions = ({color}) => {
  const [activeTab, setActiveTab] = useState('Desktop (Recommended)');
  var textColor = color; // You can adjust this or pass it as a prop


  useEffect(() => {
    // Function to check if device is mobile
    const checkIfMobile = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      setActiveTab(isMobile ? 'Mobile' : 'Desktop (Recommended)');
    };

    // Check initially
    checkIfMobile();

    // Add listener for screen size changes
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    mediaQuery.addListener(checkIfMobile);

    // Cleanup listener
    return () => mediaQuery.removeListener(checkIfMobile);
  }, []);

  const TabButton = ({ tab }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`tab-button ${activeTab === tab ? 'active' : ''}`}
    >
      {tab}
    </button>
  );

  Instructions.propTypes = {
    color: PropTypes.string.isRequired
  }

  TabButton.propTypes = {
    tab: PropTypes.string.isRequired
  };

  const DesktopInstructions = () => (
    <div style={{ lineHeight: "1.25" }}>
      <p style={{ lineHeight: "1.25" }}>
        <span className="bold" style={{ lineHeight: "1.25" }}>⁕&nbsp;&nbsp;</span>
        Generate trending search images using keyboard input <span className="key-input" style={{ border: `1.75px solid ${textColor}` }}>a</span> → <span className="key-input" style={{ border: `1.75px solid ${textColor}` }}>z</span>.
      </p>
      <p style={{ lineHeight: "1.25" }}>
        <span className="bold" style={{ lineHeight: "1.25" }}>⁕&nbsp;&nbsp;</span>
        Hold <span className="key-input" style={{ border: `1.75px solid ${textColor}` }}>Shift</span> to view image details.
      </p>
      <p>
        <span className="bold">⁕&nbsp;&nbsp;</span>
        Expand an image by dragging its bottom-right corner.
      </p>
      <p>
        <span className="bold">⁕&nbsp;&nbsp;</span>
        Right-click on an image to remove it.
      </p>
      <p>
        <span className="bold">⁕&nbsp;&nbsp;</span>
        Refreshing the page will clear all content.
      </p>
    </div>
  );

  const MobileInstructions = () => (
    <div style={{ lineHeight: "1.25" }}>
      <p>
        <span className="bold">⁕&nbsp;&nbsp;</span>
        Tap to generate a random trending search image.
      </p>
      {/* <p>
        <span className="bold">⁕&nbsp;&nbsp;</span>
        Long press on an image to view its details.
      </p>
      <p>
        <span className="bold">⁕&nbsp;&nbsp;</span>
        Pinch to resize images.
      </p>
      <p>
        <span className="bold">⁕&nbsp;&nbsp;</span>
        Long press on an image to remove it.
      </p> */}
      <p>
        <span className="bold">⁕&nbsp;&nbsp;</span>
        Refreshing the page will clear all content.
      </p>
    </div>
  );

  return (
    <div className="instructions-container">
      <div className="tabs-container">
        <TabButton tab="Desktop (Recommended)" /> 
        <TabButton tab="Mobile" />
      </div>
      {activeTab === "Desktop (Recommended)" ? <DesktopInstructions /> : <MobileInstructions />}
    </div>
  );
};

export default Instructions;