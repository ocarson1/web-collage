import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ImageGenerator.css';
import ImageItem from './ImageItem';
import ControlsSidebar from './ControlsSidebar';
import DrawingCanvas from './DrawingCanvas';
import ClipPathDefinitions from './ClipPathDefinitions';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import useImageManagement from '../../hooks/useImageManagement';
import useMaskingTool from '../../hooks/useMaskingTool';

const ImageGenerator = ({ imageData, borderColor, onSendBang, onColorChange, bgColor }) => {
  // State for drawing mode
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  
  // Get accessible text color based on background
  const getAccessibleTextColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;
  
    const [rLin, gLin, bLin] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
  
    const luminance = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  
    return luminance > 0.179 ? "#000000" : "#ffffff";
  };
  
  const handleColorChange = (event) => {
    const selectedColor = event.target.value;
    const newTextColor = getAccessibleTextColor(selectedColor);
    
    // Call the callback to update parent component
    onColorChange(selectedColor, newTextColor);
  };

  // Use custom hooks for functionality
  const { 
    images, 
    setImages,
    handleContainerClick,
    handleTouch
  } = useImageManagement({ 
    imageData, 
    onSendBang, 
    setSelectedImageId 
  });

  const { 
    shiftPressed,
    handleKeyPress 
  } = useKeyboardShortcuts({
    imageData,
    images,
    setImages,
    isDrawingMode,
    selectedImageId,
    onSendBang
  });

  const {
    canvasRef,
    handleDrawStart,
    handleDrawMove,
    handleDrawEnd,
    clearMask
  } = useMaskingTool({
    images,
    setImages,
    isDrawingMode,
    selectedImageId
  });

  // Set up container event listeners
  useEffect(() => {
    const container = document.querySelector('.image-generator-container');
    if (container) {
      container.addEventListener('touchstart', handleTouch);
      container.addEventListener('click', handleContainerClick);
    }

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouch);
        container.removeEventListener('click', handleContainerClick);
      }
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [handleKeyPress, handleTouch, handleContainerClick]);

  // Main render function
  return (
    <div className="image-generator-wrapper" style={{ display: 'flex', flexDirection: 'row' }}>
      <div className="image-generator-container" style={{ position: 'relative', flex: '1' }}>
        {/* SVG clip path definitions */}
        <ClipPathDefinitions images={images} />
        
        {/* Drawing canvas */}
        {isDrawingMode && (
          <DrawingCanvas
            canvasRef={canvasRef}
            handleDrawStart={handleDrawStart}
            handleDrawMove={handleDrawMove}
            handleDrawEnd={handleDrawEnd}
          />
        )}
        
        {/* Images */}
        {images.map(image => (
          <ImageItem
            key={image.id}
            image={image}
            shiftPressed={shiftPressed}
            borderColor={borderColor}
            selectedImageId={selectedImageId}
            setSelectedImageId={setSelectedImageId}
            isDrawingMode={isDrawingMode}
            setImages={setImages}
          />
        ))}
      </div>
      
      {/* Control sidebar */}
      <ControlsSidebar 
        bgColor={bgColor}
        handleColorChange={handleColorChange}
        isDrawingMode={isDrawingMode}
        selectedImageId={selectedImageId}
        setIsDrawingMode={setIsDrawingMode}
        clearMask={clearMask}
      />
    </div>
  );
};

// PropTypes validation
ImageGenerator.propTypes = {
  imageData: PropTypes.array.isRequired,
  borderColor: PropTypes.string,
  onSendBang: PropTypes.func,
  onColorChange: PropTypes.func.isRequired,
  bgColor: PropTypes.string.isRequired
};

export default ImageGenerator;