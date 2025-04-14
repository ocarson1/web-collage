import React from 'react';
import PropTypes from 'prop-types';

const DraggableImage = ({ 
  image, 
  isSelected, 
  onDelete,
  onUpdate, 
  borderColor,
  shiftPressed 
}) => {
  return (
    <div
      className={`draggable-image ${isSelected ? 'selected-image' : ''}`}
      style={{
        left: `${image.position.x}px`,
        top: `${image.position.y}px`,
        width: `${image.width}px`,
        height: `${image.height}px`,
        zIndex: image.zIndex || 1,
        outline: isSelected ? '2px dashed black' : 'none',
        position: 'absolute'
      }}
      onMouseDown={(e) => onUpdate(image.id, { isSelected: true })}
      onContextMenu={(e) => {
        e.preventDefault();
        onDelete(image.id);
      }}
    >
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
              padding: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                fontSize: '1.5em',
                fontWeight: 'bold',
              }}>
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
                  color: borderColor, 
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
            />
          )}
        </div>
      </div>
      
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
      />
    </div>
  );
};

DraggableImage.propTypes = {
  image: PropTypes.shape({
    id: PropTypes.number.isRequired,
    position: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    }),
    src: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    zIndex: PropTypes.number,
    maskPath: PropTypes.string,
    parentTitle: PropTypes.string,
    newsItemUrl: PropTypes.string,
    triggerKey: PropTypes.string
  }).isRequired,
  isSelected: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  borderColor: PropTypes.string,
  shiftPressed: PropTypes.bool
};

export default DraggableImage;
