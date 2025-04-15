import React from 'react';
import PropTypes from 'prop-types';

const ImageItem = ({ 
  image, 
  shiftPressed, 
  borderColor, 
  selectedImageId, 
//   isDrawingMode,
  onDragStart, 
  onResizeStart, 
  onContextMenu,
  preventDragHandler 
}) => {
  return (
    <div
      className={`draggable-image ${selectedImageId === image.id ? 'selected-image' : ''}`}
      style={{
        left: `${image.position.x}px`,
        top: `${image.position.y}px`,
        width: `${image.width}px`,
        height: `${image.height}px`,
        zIndex: image.zIndex || 1,
        outline: selectedImageId === image.id ? '2px dashed black' : 'none',
        position: 'absolute'
      }}
      onMouseDown={(e) => onDragStart(e, image.id)}
      onContextMenu={(e) => onContextMenu(e, image.id)}
    >
      {/* This inner div will handle the mask */}
      <div 
        className="image-content"
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative',
          clipPath: image.maskPath ? `url(#mask-${image.id})` : 'none'
        }}
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
      
      {/* Resize handle outside of masked content */}
      <div 
        className="resize-handle exclude-from-capture"
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '15px',
          height: '15px',
          background: 'rgba(255,255,255,0.5)',
          cursor: 'nwse-resize',
          zIndex: 9999999
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
  isDrawingMode: PropTypes.bool.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onResizeStart: PropTypes.func.isRequired,
  onContextMenu: PropTypes.func.isRequired,
  preventDragHandler: PropTypes.func.isRequired
};

export default ImageItem;