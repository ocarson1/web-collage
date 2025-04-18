import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as ResizeIcon } from './resize.svg';

const ImageItem = ({ 
  image, 
  shiftPressed, 
  borderColor, 
  selectedImageId, 
  onDragStart, 
  onResizeStart, 
  onContextMenu,
  preventDragHandler 
}) => {
  const pathRef = useRef(null);
  const [maskBounds, setMaskBounds] = useState(null);
  
  // Calculate mask bounding box when the path changes or component mounts
  useEffect(() => {
    if (image.maskPath) {
      // Create a temporary SVG to calculate the bounds without needing selection
      const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      tempPath.setAttribute("d", image.maskPath);
      tempSvg.appendChild(tempPath);
      document.body.appendChild(tempSvg);
      
      // Get the bounding box
      const bbox = tempPath.getBBox();
      
      // Clean up
      document.body.removeChild(tempSvg);
      
      setMaskBounds({
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height
      });
    } else {
      setMaskBounds(null);
    }
  }, [image.maskPath]);

  // Handle click on link without triggering drag
  const handleLinkClick = (e) => {
    // Don't stop propagation, but prevent default to avoid interfering with the link
    e.stopPropagation();
  };

  // Check if this image is currently selected
  const isSelected = selectedImageId === image.id;

  return (
    <div
      data-image-id={image.id}
      className={`draggable-image ${isSelected ? 'selected-image' : ''}`}
      style={{
        left: `${image.position.x}px`,
        top: `${image.position.y}px`,
        width: `${image.width}px`,
        height: `${image.height}px`,
        zIndex: image.zIndex || 1,
        position: 'absolute',
        // Restore original behavior: parent has no pointer events when masked
        pointerEvents: image.maskPath ? 'none' : 'auto',
        // Prevent text selection
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
      onMouseDown={image.maskPath ? null : (e) => {
        // Only initiate drag if we're not clicking on a link
        if (e.target.tagName !== 'A') {
          onDragStart(e, image.id);
        }
      }}
      onContextMenu={image.maskPath ? null : (e) => onContextMenu(e, image.id)}
    >
      {/* This inner div will handle the mask and its pointer events */}
      <div 
        className="image-content"
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative',
          clipPath: image.maskPath ? `url(#mask-${image.id})` : 'none',
          // Restore original behavior: only this div gets pointer events when masked
          pointerEvents: image.maskPath ? 'auto' : 'none',
          // Prevent text selection
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
        onMouseDown={image.maskPath ? (e) => {
          // Only initiate drag if we're not clicking on a link
          if (e.target.tagName !== 'A') {
            onDragStart(e, image.id);
          }
        } : null}
        onContextMenu={image.maskPath ? (e) => onContextMenu(e, image.id) : null}
      >
        <div className="image-wrapper" style={{ width: '100%', height: '100%' }}>
          {shiftPressed ? (
            <div className="image-metadata" style={{
              border: `2px solid ${borderColor}`,
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              position: 'relative',
              padding: '10px',
              overflow: 'hidden',
              // Prevent text selection
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}>
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
                onClick={handleLinkClick}
                style={{ 
                  color: `${borderColor}`, 
                  textDecoration: 'underline', 
                  fontSize: '0.8em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  position: 'relative',
                  zIndex: 10,
                  pointerEvents: 'auto',
                  // Allow text selection ONLY for the link
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  MozUserSelect: 'text',
                  msUserSelect: 'text'
                }}
              >
                {image.newsItemUrl}
              </a>
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
        </div>
      </div>
      
      {/* Selection visuals - separate from the interactive elements */}
      {isSelected && (
        <>
          {/* When masked, show SVG path outline */}
          {image.maskPath && (
            <svg
              className="selection-outline exclude-from-capture"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 3,
                overflow: 'hidden'
              }}
            >
              <path
                ref={pathRef}
                d={image.maskPath}
                fill="none"
                stroke="black"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          )}
          
          {/* When not masked, show rectangle outline */}
          {!image.maskPath && (
            <div
              className="selection-outline exclude-from-capture"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '1.5px dashed black',
                boxSizing: 'border-box',
                pointerEvents: 'none',
                zIndex: 3
              }}
            />
          )}
          
          {/* Resize handle - only visible when image is selected */}
          <div 
            className="resize-handle exclude-from-capture"
            style={{
              position: 'absolute',
              bottom: maskBounds ? `${image.height - (maskBounds.y + maskBounds.height)}px` : '0',
              right: maskBounds ? `${image.width - (maskBounds.x + maskBounds.width)}px` : '0',
              width: '12px',
              height: '12px',
              cursor: 'nwse-resize',
              zIndex: 9999999,
              pointerEvents: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onMouseDown={(e) => {
              e.stopPropagation(); // Prevent propagation to parent drag handler
              onResizeStart(e, image.id);
            }}
          >
            <ResizeIcon width="15" height="15" />
          </div>
        </>
      )}
    </div>
  );
};

ImageItem.propTypes = {
  image: PropTypes.shape({
    id: PropTypes.number.isRequired,
    position: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }).isRequired,
    src: PropTypes.string.isRequired,
    parentTitle: PropTypes.string,
    newsItemUrl: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    zIndex: PropTypes.number,
    triggerKey: PropTypes.string,
    maskPath: PropTypes.string
  }).isRequired,
  shiftPressed: PropTypes.bool.isRequired,
  borderColor: PropTypes.string,
  selectedImageId: PropTypes.number,
  isDrawingMode: PropTypes.bool,
  onDragStart: PropTypes.func.isRequired,
  onResizeStart: PropTypes.func.isRequired,
  onContextMenu: PropTypes.func.isRequired,
  preventDragHandler: PropTypes.func.isRequired
};

export default ImageItem;