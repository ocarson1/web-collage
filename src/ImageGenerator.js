import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './ImageGenerator.css';


const ImageGenerator = ({ imageData, borderColor}) => {
  const [images, setImages] = useState([]);
  const [draggedImage, setDraggedImage] = useState(null);
  const [resizingImage, setResizingImage] = useState(null);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [shiftPressed, setShiftPressed] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey) {
        setShiftPressed(true);
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
  }, []);

  const getRandomPosition = (x, y) => {
    const container = document.querySelector('.image-generator-container');
    if (!container) return { x: 0, y: 0 }; // Fallback if container not found
    
    if (x !== undefined && y !== undefined) {
      const { left, top } = container.getBoundingClientRect();
      return {
        x: x - left,
        y: y - top
      };
    }
    
    const { width, height } = container.getBoundingClientRect();
    return {
      x: Math.random() * (width - 100),
      y: Math.random() * (height - 100)
    };
  };

  const createNewImage = (position) => {
    // Get a random image from imageData
    const randomIndex = Math.floor(Math.random() * imageData.length);
    const randomImage = imageData[randomIndex];

    if (randomImage) {
      const newMaxZIndex = maxZIndex + 1;
      setMaxZIndex(newMaxZIndex);

      const newImage = {
        id: Date.now(),
        position: position,
        src: randomImage.newsItemPicture,
        parentTitle: randomImage.parentTitle,
        newsItemUrl: randomImage.newsItemUrl,
        width: 200,
        height: 200,
        zIndex: newMaxZIndex,
        triggerKey: randomImage.key
      };

      setImages(prev => [...prev, newImage]);
    }
  };

  // Handle touch for creating new images
  const handleTouch = (e) => {
    if (e.target.classList.contains('draggable-image')) return;
    
    const touch = e.touches[0];
    const position = getRandomPosition(touch.clientX - 100, touch.clientY - 100);
    createNewImage(position);
  };

  // Handle key press to generate new image
  const handleKeyPress = useCallback((event) => {
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
      const position = getRandomPosition();
      const newMaxZIndex = maxZIndex + 1;
      setMaxZIndex(newMaxZIndex);

      const newImage = {
        id: Date.now(),
        position: position,
        src: imageData[index].newsItemPicture,
        parentTitle: imageData[index].parentTitle,
        newsItemUrl: imageData[index].newsItemUrl,
        width: 200,
        height: 200,
        zIndex: newMaxZIndex,
        triggerKey: key
      };

      setImages(prev => [...prev, newImage]);
    }
  }, [imageData, maxZIndex]);

  // Prevent default dragging behavior
  const preventDragHandler = (e) => {
    e.preventDefault();
  };

  // Start dragging an image
  const handleDragStart = (e, imageId) => {

    console.log(e.target.classList)

    if (e.shiftKey) return;

    if (e.target.classList.contains('draggable-image')) {
      console.log("resize handle clicked")
      return;
    }
    console.log("drag starting")

    
    const container = document.querySelector('.image-generator-container');
    const containerRect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const boundingRect = e.target.getBoundingClientRect();

    console.log('Drag Start Debugging:', {
      containerRect,
      scrollTop,
      scrollLeft,
      boundingRect,
      clientX: e.clientX,
      clientY: e.clientY
    });
    
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
      offsetX: e.clientX - boundingRect.left + scrollLeft - containerRect.left,
      offsetY: e.clientY - boundingRect.top - scrollTop - containerRect.top
    });
  };

  // Handle image dragging
  const handleDrag = useCallback((e) => {
    if (draggedImage) {
      const container = document.querySelector('.image-generator-container');
      if (!container) return;
  
      const containerRect = container.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
  
      setImages(prev =>
        prev.map(img =>
          img.id === draggedImage.id
            ? {
                ...img,
                position: {
                  x: e.clientX - containerRect.left - scrollLeft - draggedImage.offsetX,
                  y: e.clientY - draggedImage.offsetY + scrollTop
                }
              }
            : img
        )
      );
    }

    if (resizingImage) {
      setImages(prev =>
        prev.map(img => {
          if (img.id === resizingImage.id) {
            // Calculate new width and height
            const newWidth = Math.max(50, resizingImage.startWidth + (e.clientX - resizingImage.startX));
            const newHeight = Math.max(50, resizingImage.startHeight + (e.clientY - resizingImage.startY));
  
            return {
              ...img,
              width: newWidth,
              height: newHeight
            };
          }
          return img;
        })
      );
    }
  }, [draggedImage, resizingImage]);

  const handleDragEnd = useCallback(() => {
    setDraggedImage(null);
    setResizingImage(null);
  }, []);

  // Start resizing
  const handleResizeStart = (e, imageId) => {
    console.log("resize starting")
    e.preventDefault();
    e.stopPropagation();
    const image = images.find(img => img.id === imageId);
  
    setResizingImage({
      id: imageId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: image.width,
      startHeight: image.height
    });
  };

  // Remove an image on right-click
  const handleContextMenu = (e, imageId) => {
    e.preventDefault(); // Prevent default context menu
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Add event listeners
  React.useEffect(() => {
    const container = document.querySelector('.image-generator-container');
    if (container) {
      container.addEventListener('touchstart', handleTouch);
    }

    window.addEventListener('keypress', handleKeyPress);
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouch);
      }
      window.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [handleKeyPress, handleDrag, handleDragEnd]);

  return (
    <div className="image-generator-container">
      {images.map(image => (
        <div
          key={image.id}
          className="draggable-image"
          style={{
            left: `${image.position.x}px`,
            top: `${image.position.y}px`,
            width: `${image.width || 200}px`,
            height: `${image.height || 200}px`,
            zIndex: image.zIndex || 1
          }}
          onMouseDown={(e) => handleDragStart(e, image.id)}
          onContextMenu={(e) => handleContextMenu(e, image.id)}
        >
          <div className="image-wrapper">
            {shiftPressed ? (
              <div 
                className="image-metadata" style={{border: `2px solid ${borderColor}`}}>
                  <div 
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        fontSize: '1.5em',
        fontWeight: 'bold',
      }}
    >
      {image.triggerKey}
    </div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '0.9em' }}>
                &quot;{image.parentTitle}&quot;
                </h3>
                <a 
                  href={image.newsItemUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: `${borderColor}`, 
                    textDecoration: 'underline', 
                    fontSize: '0.8em',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {image.newsItemUrl}
                </a>
                <div 
          className="resize-handle"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '15px',
            height: '15px',
            background: 'rgba(255,255,255,0.5)', // More visible on transparent background
            cursor: 'nwse-resize',
            zIndex: 10
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, image.id);
          }}
        />
 
              </div>
            ) : (
              <img 
                src={image.src} 
                alt={image.parentTitle}
                title={`Source: ${image.newsItemUrl}`}
                className="generated-image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                draggable="false"
                onDragStart={preventDragHandler}
                onError={(e) => {
                  console.error('Image failed to load', e);
                }}
              />
            )}
            <div 
          className="resize-handle"
          style={{ display: 'none' }} // Hide resize handle in image view
          onMouseDown={(e) => {
            e.stopPropagation();
            handleResizeStart(e, image.id);
          }}
        />
          </div>
        </div>
      ))}
    </div>
  );
};

// Update PropTypes to match new data structure
ImageGenerator.propTypes = {
  imageData: PropTypes.arrayOf(
    PropTypes.shape({
      newsItemPicture: PropTypes.string.isRequired,
      parentTitle: PropTypes.string.isRequired,
      newsItemUrl: PropTypes.string.isRequired,
      key: PropTypes.string
    })
  ).isRequired,
  borderColor: PropTypes.string
};



export default ImageGenerator;