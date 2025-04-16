import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

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
  
  // Calculate mask bounding box when the path or selection changes
  useEffect(() => {
    if (image.maskPath && selectedImageId === image.id && pathRef.current) {
      // Get the bounding box of the SVG path
      const bbox = pathRef.current.getBBox();
      setMaskBounds({
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height
      });
    } else if (!image.maskPath || selectedImageId !== image.id) {
      setMaskBounds(null);
    }
  }, [image.maskPath, selectedImageId, image.id]);

  return (
    <div
      data-image-id={image.id}
      className={`draggable-image ${selectedImageId === image.id ? 'selected-image' : ''}`}
      style={{
        left: `${image.position.x}px`,
        top: `${image.position.y}px`,
        width: `${image.width}px`,
        height: `${image.height}px`,
        zIndex: image.zIndex || 1,
        position: 'absolute',
        pointerEvents: image.maskPath ? 'none' : 'auto'
      }}
      onMouseDown={image.maskPath ? null : (e) => onDragStart(e, image.id)}
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
          pointerEvents: image.maskPath ? 'auto' : 'none'
        }}
        onMouseDown={image.maskPath ? (e) => onDragStart(e, image.id) : null}
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
              overflow: 'hidden'
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
                style={{ 
                  color: `${borderColor}`, 
                  textDecoration: 'underline', 
                  fontSize: '0.8em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block'
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
      {selectedImageId === image.id && (
        <>
          {/* When masked, show SVG path outline */}
          {image.maskPath && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 3
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
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '2px dashed black',
                boxSizing: 'border-box',
                pointerEvents: 'none',
                zIndex: 3
              }}
            />
          )}
        </>
      )}
      
      {/* Resize handle - positioned based on mask bounds when applicable */}
      <div 
        className="resize-handle exclude-from-capture"
        style={{
          position: 'absolute',
          bottom: maskBounds ? `${image.height - (maskBounds.y + maskBounds.height)}px` : '0',
          right: maskBounds ? `${image.width - (maskBounds.x + maskBounds.width)}px` : '0',
          width: '15px',
          height: '15px',
          background: 'rgba(255,255,255,0.5)',
          cursor: 'nwse-resize',
          zIndex: 9999999,
          pointerEvents: 'auto'
        }}
        onMouseDown={(e) => {
          e.stopPropagation(); // Prevent propagation to parent drag handler
          onResizeStart(e, image.id);
        }}
      />
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