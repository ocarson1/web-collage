import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './ImageGenerator.css';
import ImageItem from './components/ImageItem';
import ControlsSidebar from './components/ControlsSidebar';
import { scaleSvgPath } from './utils/MaskingTools';
import { formatDayDate, formatTime } from './utils/dateUtils';


// ImageMenuItem remains mostly the same
const ImageMenuItem = ({ image, onDragStart }) => {

  
  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      src: image.newsItemPicture,
      parentTitle: image.parentTitle,
      newsItemUrl: image.newsItemUrl,
      triggerKey: image.key
    }));

    const ghostImage = new Image();
    ghostImage.src = image.newsItemPicture;
    ghostImage.style.width = '100px';
    ghostImage.style.height = 'auto';
    ghostImage.style.opacity = '0.7';
    document.body.appendChild(ghostImage);
    e.dataTransfer.setDragImage(ghostImage, 50, 50);

    setTimeout(() => {
      document.body.removeChild(ghostImage);
    }, 0);

    if (onDragStart) onDragStart(image);
  };

  return (
    <div 
  className="image-menu-item"
  draggable
  onDragStart={handleDragStart}
  style={{
    width: '50px',
    height: 'auto',
    aspectRatio: '1 / 1', // ensures square box (optional)
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
  }}
>
  <img 
    src={image.newsItemPicture} 
    alt={image.parentTitle || 'Draggable image'} 
    style={{
      opacity: '0.5',
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      display: 'block',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',

    }}
  />
</div>
  );
};

ImageMenuItem.propTypes = {
  image: PropTypes.shape({
    newsItemPicture: PropTypes.string.isRequired,
    parentTitle: PropTypes.string,
    newsItemUrl: PropTypes.string,
    key: PropTypes.string
  }).isRequired,
  onDragStart: PropTypes.func
};


// Updated container: Grid instead of scrollable menu
const ResponsiveImageGrid = ({ imageData, onDragStart }) => {

  const [date, setDate] = useState(new Date())


  useEffect(() => {
      setDate(new Date())
    }, []); // Empty dependency array means this runs once on component mount
  
  return (
    <div>
    <h3>{formatDayDate(date)}</h3>
    <h3 style={{fontWeight:'400'}}>{formatTime(date)}</h3>
    <br></br>
    <div 
      className="responsive-image-grid"
      style={{
        width: '212px', // 3 columns * 100px + 2 gaps * 12px
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px',
        justifyContent: 'flex-start'
      }}
    >

      {imageData.map((image, index) => (
        <ImageMenuItem 
          key={index} 
          image={image} 
          onDragStart={onDragStart}
        />
      ))}
    </div>
    </div>
  );
};

ResponsiveImageGrid.propTypes = {
  imageData: PropTypes.arrayOf(
    PropTypes.shape({
      newsItemPicture: PropTypes.string.isRequired,
      parentTitle: PropTypes.string,
      newsItemUrl: PropTypes.string,
      key: PropTypes.string
    })
  ).isRequired,
  onDragStart: PropTypes.func
};

const ImageGenerator = ({ imageData, borderColor, onSendBang, onColorChange, bgColor}) => {
  // State declarations
  const [images, setImages] = useState([]);
  const [draggedImage, setDraggedImage] = useState(null);
  const [resizingImage, setResizingImage] = useState(null);
  const [justResized, setJustResized] = useState(false);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [shiftPressed, setShiftPressed] = useState(false);
  
  // Masking related states
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const canvasRef = useRef(null);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey) {
        setShiftPressed(true);
      }
      
      // Toggle drawing mode with 'M' key
      if (e.key === 'm' && selectedImageId) {
        setIsDrawingMode(prev => !prev);
        if (isDrawingMode) {
          setCurrentPath([]);
        }
      }
      
      // ESC key to exit drawing mode
      if (e.key === 'Escape' && isDrawingMode) {
        setIsDrawingMode(false);
        setCurrentPath([]);
      }
    };

    const handleKeyUp = (e) => {
      if (!e.shiftKey) {
        setShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDrawingMode, selectedImageId]);

  // Set up canvas once drawing mode is activated
  useEffect(() => {
    if (isDrawingMode && canvasRef.current) {
      const canvas = canvasRef.current;
      const container = document.querySelector('.image-generator-container');
      if (container) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
      }
    }
  }, [isDrawingMode]);

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

  // Position calculation utility
  const getRandomPosition = (x, y) => {
    const container = document.querySelector('.image-generator-container');
    if (!container) return { x: 0, y: 0 }; // Fallback if container not found
    
    const { left, top, width, height } = container.getBoundingClientRect();
    
    if (x !== undefined && y !== undefined) {
      // Calculate position relative to container, accounting for scroll
      return {
        x: x - left - 100,
        y: y - top - 100
      };
    }
    
    // For random positioning
    return {
      x: Math.max(-100, Math.min(-100 + Math.random() * width, width - 100)),
      y: Math.max(-100, Math.min(-100 + Math.random() * height, height - 100))
    };
  };
  
  // Function to get image natural dimensions
  const getImageDimensions = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.onerror = () => {
        // Fallback dimensions if image fails to load
        resolve({
          width: 400,
          height: 200
        });
      };
      img.src = src;
    });
  };
  
  const normalizeSvgPath = (pathData, width, height) => {
    // Scale the path so that it fits in a 1×1 coordinate space
    return scaleSvgPath(pathData, 1/width, 1/height);
  };

  // New handler for dropping images from the menu
  const handleDrop = async (e) => {
    e.preventDefault();
    if (isDrawingMode) return;
    
    try {
      // Get the JSON data from the drag event
      const jsonData = e.dataTransfer.getData('application/json');
      
      if (!jsonData) return;
      
      const imageInfo = JSON.parse(jsonData);
      
      // Get the position where the image was dropped
      const container = document.querySelector('.image-generator-container');
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left - 100,  // Offset for better positioning
        y: e.clientY - rect.top - 100
      };
      
      // Get dimensions of the image
      const dimensions = await getImageDimensions(imageInfo.src);
      
      // Create a new image object
      const newMaxZIndex = maxZIndex + 1;
      setMaxZIndex(newMaxZIndex);
      
      const newImage = {
        id: Date.now(),
        position: position,
        src: imageInfo.src,
        parentTitle: imageInfo.parentTitle,
        newsItemUrl: imageInfo.newsItemUrl,
        width: dimensions.width,
        height: dimensions.height,
        originalWidth: dimensions.width,
        originalHeight: dimensions.height,
        zIndex: newMaxZIndex,
        triggerKey: imageInfo.triggerKey,
        maskPath: null,
        originalMaskPath: null
      };
      
      // Add the new image to the canvas
      setImages(prev => [...prev, newImage]);
      
      // Trigger any additional actions (e.g., sound effect)
      if (onSendBang) onSendBang();
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };
  
  // Allow the container to accept drops
  const handleDragOver = (e) => {
    e.preventDefault(); // This is necessary to allow dropping
    if (!isDrawingMode) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };
  
  // Modified handleContainerClick to prevent adding images on click
  const handleContainerClick = (e) => {
    if (isDrawingMode) return;
    
    if (justResized) {
      return;
    }
    
    // Only handle selection of existing images, no new image creation
    if (e.target.classList.contains('image-generator-container')) {
      setSelectedImageId(null);
    }
  };
  

  // Keyboard event handler for image generation
  const handleKeyPress = useCallback((event) => {
    if (isDrawingMode) return; // Ignore keyboard shortcuts in drawing mode
    
    const activeElement = document.activeElement;
    const isInput = activeElement.tagName === 'INPUT' || 
                    activeElement.tagName === 'TEXTAREA';

    if (isInput) {
        return;
    }
    
    // Define the keys that can trigger image generation
    const validKeys = [
      ...Array.from({length: 26}, (_, i) => String.fromCharCode(97 + i)), // a-z
      ...Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i)), // A-Z
      '<', '>', ';', '['
    ];

    // Check if the pressed key is in our valid keys
    const key = event.key;
    const index = validKeys.indexOf(key);

    // Check if we have an image for this key
    if (index !== -1 && imageData[index]) {
      onSendBang();

      const position = getRandomPosition();
      const newMaxZIndex = maxZIndex + 1;
      setMaxZIndex(newMaxZIndex);

      // Get the image source
      const imageSrc = imageData[index].newsItemPicture;
      
      // Create a temporary image to get natural dimensions
      const img = new Image();
      img.onload = () => {
        const newImage = {
          id: Date.now(),
          position: position,
          src: imageSrc,
          parentTitle: imageData[index].parentTitle,
          newsItemUrl: imageData[index].newsItemUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          originalWidth: img.naturalWidth, // Store original dimensions for mask scaling
          originalHeight: img.naturalHeight,
          zIndex: newMaxZIndex,
          triggerKey: key,
          maskPath: null, // Initialize with no mask
          originalMaskPath: null // Store original mask path
        };

        setImages(prev => [...prev, newImage]);
      };
      
      img.onerror = () => {
        // Fallback if image fails to load
        const newImage = {
          id: Date.now(),
          position: position,
          src: imageSrc,
          parentTitle: imageData[index].parentTitle,
          newsItemUrl: imageData[index].newsItemUrl,
          width: 400, // Fallback width
          height: 200, // Fallback height
          originalWidth: 400,
          originalHeight: 200,
          zIndex: newMaxZIndex,
          triggerKey: key,
          maskPath: null,
          originalMaskPath: null
        };

        setImages(prev => [...prev, newImage]);
      };
      
      img.src = imageSrc;
    }
  }, [imageData, maxZIndex, onSendBang, isDrawingMode]);

  // Drag and drop handlers
  const preventDragHandler = (e) => {
    e.preventDefault();
  };

  const handleDragStart = (e, imageId) => {
    if (isDrawingMode) return; // Disable dragging in drawing mode
    
    if (e.shiftKey) return;
    if (e.target.classList.contains('resize-handle')) {
      return;
    }
  
    // const container = document.querySelector('.image-generator-container');
    // const containerRect = container.getBoundingClientRect();
    const boundingRect = e.target.getBoundingClientRect();
    
    // Calculate the initial offset from the mouse to the top-left corner of the image
    const offsetX = e.clientX - boundingRect.left;
    const offsetY = e.clientY - boundingRect.top;
    
    const newMaxZIndex = maxZIndex + 1;
    setMaxZIndex(newMaxZIndex);
    
    setImages(prev => 
      prev.map(img => 
        img.id === imageId 
          ? { ...img, zIndex: newMaxZIndex } 
          : img
      )
    );
    
    setDraggedImage({
      id: imageId,
      offsetX,
      offsetY
    });
    
    // Select the image for potential masking
    setSelectedImageId(imageId);
  };
  
  const handleDrag = useCallback((e) => {
    if (isDrawingMode) return; // Disable dragging in drawing mode
    
    // Handle image dragging
    if (draggedImage) {
      const container = document.querySelector('.image-generator-container');
      if (!container) return;
  
      const containerRect = container.getBoundingClientRect();
      
      // Calculate new position relative to container without boundaries
      const newX = e.clientX - containerRect.left - draggedImage.offsetX;
      const newY = e.clientY - containerRect.top - draggedImage.offsetY;
  
      setImages(prev =>
        prev.map(img =>
          img.id === draggedImage.id
            ? {
                ...img,
                position: { x: newX, y: newY }
              }
            : img
        )
      );
    }
  
  // Handle image resizing
  if (resizingImage) {
    setImages(prev =>
      prev.map(img => {
        if (img.id === resizingImage.id) {
          // Calculate new width based on mouse movement
          const deltaX = e.clientX - resizingImage.startX;
          const newWidth = Math.max(50, resizingImage.startWidth + deltaX);
          
          // Calculate new height while preserving aspect ratio
          const aspectRatio = img.originalWidth / img.originalHeight;
          const newHeight = Math.max(50, newWidth / aspectRatio);
          
          // Scale mask if exists
          let scaledMaskPath = null;
          if (img.normalizedMaskPath) {
            // Use the normalized path and scale it to the current dimensions
            scaledMaskPath = scaleSvgPath(img.normalizedMaskPath, newWidth, newHeight);
          } else if (img.originalMaskPath) {
            // If normalized path doesn't exist (for backward compatibility)
            // Create a normalized path on-the-fly
            const normalizedPath = normalizeSvgPath(
              img.originalMaskPath, 
              img.maskOriginalWidth || img.originalWidth, 
              img.maskOriginalHeight || img.originalHeight
            );
            
            // Then scale to current dimensions
            scaledMaskPath = scaleSvgPath(normalizedPath, newWidth, newHeight);
          }
  
          return {
            ...img,
            width: newWidth,
            height: newHeight,
            maskPath: scaledMaskPath
          };
        }
        return img;
      })
    );
  }
}, [draggedImage, resizingImage, isDrawingMode]);
// In handleResizeEnd, make sure we're not storing any intermediate scaled paths
const handleResizeEnd = useCallback(() => {
  if (resizingImage) {
    // Get the current image that was being resized
    const resizedImage = images.find(img => img.id === resizingImage.id);
    
    if (resizedImage) {
      console.log("Resize completed:", {
        imageId: resizedImage.id,
        finalWidth: resizedImage.width,
        finalHeight: resizedImage.height,
        scaleFromOriginal: resizedImage.width / resizedImage.originalWidth
      });
      
      // No need to store cachedScaledMaskPath, just dimensions
      setImages(prev => 
        prev.map(img => {
          if (img.id === resizingImage.id) {
            return {
              ...img,
              lastResizedWidth: img.width,
              lastResizedHeight: img.height
            };
          }
          return img;
        })
      );
    }
    
    setResizingImage(null);
    
    setTimeout(() => {
      setJustResized(false);
    }, 200);
  }
}, [resizingImage, images]);
const handleDragEnd = useCallback(() => {
  setDraggedImage(null);
  
  if (resizingImage) {
    handleResizeEnd();
  }
}, [resizingImage, handleResizeEnd]);
// Improved handleResizeStart to capture the exact latest dimensions
const handleResizeStart = (e, imageId) => {
  if (isDrawingMode) return;
  
  // Get direct reference to the DOM element for immediate measurements
  const imgElement = document.querySelector(`[data-image-id="${imageId}"]`);
  const image = images.find(img => img.id === imageId);
  
  if (!image) return;
  
  // Get the most accurate current dimensions
  // Use DOM element dimensions if available, otherwise fall back to state
  const currentWidth = imgElement ? imgElement.offsetWidth : image.width;
  const currentHeight = imgElement ? imgElement.offsetHeight : image.height;
  
  console.log("Starting resize with dimensions:", {
    fromState: { width: image.width, height: image.height },
    fromDOM: { width: currentWidth, height: currentHeight }
  });
  
  const newResizingState = {
    id: imageId,
    startX: e.clientX,
    startY: e.clientY,
    startWidth: currentWidth,  // Use the most current width
    startHeight: currentHeight // Use the most current height
  };

  setResizingImage(newResizingState);
  setJustResized(true);
};
  // Context menu handler (right-click)
  const handleContextMenu = (e, imageId) => {
    e.preventDefault(); // Prevent default context menu
    setImages(prev => prev.filter(img => img.id !== imageId));
    
    if (selectedImageId === imageId) {
      setSelectedImageId(null);
      setIsDrawingMode(false);
    }
  };
  


  // Drawing handlers for mask creation
  const getPointFromEvent = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };
  
  const drawOnCanvas = (points) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw path
    if (points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    // Style for the drawing preview
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // If we have a closed path with more than 2 points, fill it semi-transparently
    if (points.length > 2) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.fill();
    }
  };
  
  const pointsToSvgPath = (points) => {
    if (points.length < 3) return '';
    
    // Find the selected image to create path relative to it
    const selectedImage = images.find(img => img.id === selectedImageId);
    if (!selectedImage) return '';
    
    const imageLeft = selectedImage.position.x;
    const imageTop = selectedImage.position.y;
    
    // Convert absolute canvas coordinates to coordinates relative to the image
    const relativePoints = points.map(point => ({
      x: point.x - imageLeft,
      y: point.y - imageTop
    }));
    
    let path = `M${relativePoints[0].x},${relativePoints[0].y}`;
    
    for (let i = 1; i < relativePoints.length; i++) {
      path += ` L${relativePoints[i].x},${relativePoints[i].y}`;
    }
    
    return path + ' Z'; // Close the path
  };
  
  const handleDrawStart = (e) => {
    if (!isDrawingMode || !selectedImageId) return;
    
    e.preventDefault();
    const point = getPointFromEvent(e);
    setCurrentPath([point]);
    drawOnCanvas([point]);
  };
  
  const handleDrawMove = (e) => {

    
    if (!isDrawingMode || !selectedImageId || currentPath.length === 0) return;
    
    e.preventDefault();
    const point = getPointFromEvent(e);
    const newPath = [...currentPath, point];
    setCurrentPath(newPath);
    drawOnCanvas(newPath);
  };
  
  const handleDrawEnd = (e) => {
    if (!isDrawingMode || !selectedImageId) return;
    
    e.preventDefault();
    if (currentPath.length < 3) {
      // Not enough points for a proper shape
      setCurrentPath([]);
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    
    // Close the path by connecting to first point
    const closedPath = [...currentPath, currentPath[0]];
    
    // Convert points to SVG path string
    const svgPath = pointsToSvgPath(closedPath);

    // Helper function to normalize SVG path to a 1×1 coordinate space

    
    // Apply to selected image
    setImages(prev => prev.map(img => 
      img.id === selectedImageId 
        ? { 
          ...img,
          originalMaskPath: svgPath,                // Original unscaled mask path
          maskPath: svgPath,                        // Current displayed mask path
          maskOriginalWidth: img.width,              // Width when mask was applied
          maskOriginalHeight: img.height,            // Height when mask was applied
          // Store normalized mask path (relative to 1×1 coordinate space)
          normalizedMaskPath: normalizeSvgPath(svgPath, img.width, img.height)
          }
        : img
    ));

    
    
    // Clear drawing state
    setCurrentPath([]);
    setIsDrawingMode(false);
    
    // Clear canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
  
  // Remove mask from selected image
  const clearMask = () => {
    if (!selectedImageId) return;
    
    setImages(prev => prev.map(img => 
      img.id === selectedImageId 
        ? { ...img, maskPath: null, originalMaskPath: null }
        : img
    ));
  };

  // Global event listeners (modified to include drop handlers)
  useEffect(() => {
    const container = document.querySelector('.image-generator-container');
    if (container) {
      container.addEventListener('click', handleContainerClick);
      container.addEventListener('dragover', handleDragOver);
      container.addEventListener('drop', handleDrop);
    }

    window.addEventListener('keypress', handleKeyPress);
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);

    return () => {
      if (container) {
        container.removeEventListener('click', handleContainerClick);
        container.removeEventListener('dragover', handleDragOver);
        container.removeEventListener('drop', handleDrop);
      }
      window.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [handleKeyPress, handleDrag, handleDragEnd, handleDrop]);

  // Render function (modified to include the image menu)
  return (
    <div className="app-sub-container">
      {/* Left side: ControlsSidebar */}
      <div className="controls-container">
        <ResponsiveImageGrid 
          imageData={imageData} 
          onDragStart={() => onSendBang && onSendBang()}
        />
      </div>
      
      {/* Middle: Bounded canvas area */}
      <div className="canvas-container">
        <div 
          className="image-generator-container" 
          style={{ backgroundColor: bgColor }}
        >
          {/* SVG definitions for clip paths */}
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
              {images.map(image => 
                image.maskPath && (
                  <clipPath id={`mask-${image.id}`} key={`mask-${image.id}`}>
                    <path d={image.maskPath} />
                  </clipPath>
                )
              )}
            </defs>
          </svg>
          
          {/* Drawing canvas overlay */}
          {isDrawingMode && (
            <canvas 
              ref={canvasRef}
              className="drawing-canvas"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 9999,
                cursor: 'crosshair'
              }}
              onMouseDown={handleDrawStart}
              onMouseMove={handleDrawMove}
              onMouseUp={handleDrawEnd}
              onTouchStart={handleDrawStart}
              onTouchMove={handleDrawMove}
              onTouchEnd={handleDrawEnd}
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
              isDrawingMode={isDrawingMode}
              onDragStart={handleDragStart}
              onResizeStart={handleResizeStart}
              onContextMenu={handleContextMenu}
              preventDragHandler={preventDragHandler}
            />
          ))}
        </div>
      </div>
      
      {/* Right side: ScrollableImageMenu */}
      
      <div className="controls-container">
        <ControlsSidebar 
          bgColor={bgColor}
          handleColorChange={handleColorChange}
          isDrawingMode={isDrawingMode}
          selectedImageId={selectedImageId}
          setIsDrawingMode={setIsDrawingMode}
          clearMask={clearMask}
        />
      </div>
    </div>
  );
};

// PropTypes validation
ImageGenerator.propTypes = {
  imageData: PropTypes.arrayOf(
    PropTypes.shape({
      newsItemPicture: PropTypes.string.isRequired,
      parentTitle: PropTypes.string,
      newsItemUrl: PropTypes.string,
      key: PropTypes.string
    })
  ).isRequired,
  borderColor: PropTypes.string,
  onSendBang: PropTypes.func,
  onColorChange: PropTypes.func.isRequired,
  bgColor: PropTypes.string.isRequired,
  currentTextColor: PropTypes.string
};

export default ImageGenerator;