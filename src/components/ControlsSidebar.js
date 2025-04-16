import React from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as BucketIcon } from './bucket.svg';
import { ReactComponent as ScissorsIcon } from './scissors.svg';
import { ReactComponent as ResetIcon } from './reset.svg';

import './ControlsSidebar.css';

const ControlsSidebar = ({
  bgColor,
  handleColorChange,
  selectedImageId,
  isDrawingMode,
  setIsDrawingMode,
  clearMask
}) => {
  return (
    <div className="controls-sidebar exclude-from-capture" >
      {/* Color control using hidden input */}
      <div className="color-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label 
          style={{ 
            cursor: 'pointer',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            padding: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '40px',
            height: '40px',
            boxSizing: 'border-box'
          }} 
          title="Pick Background Color"
        >
          <BucketIcon style={{ width: '24px', height: '24px', color: 'black' }} />
          <input
            type="color"
            value={bgColor}
            onChange={handleColorChange}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '0.1px',
              height: '0.1px',
              overflow: 'hidden',
              pointerEvents: 'none'
            }}
          />
        </label>
      </div>

      {/* Mask controls */}
      <div className="mask-controls" style={{ display: "flex", flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        <button 
          onClick={() => setIsDrawingMode(prev => !prev)}
          style={{
            width: '40px',
            height: '40px',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: selectedImageId && !isDrawingMode ? 'pointer' : 'default',
            opacity: selectedImageId ? 1 : 0.3,
          }}
          title="Draw Mask"
        >
          <span style={{ 
            backgroundColor: isDrawingMode ? 'black' : 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            padding: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '40px',
            height: '40px',
            boxSizing: 'border-box'
          }}>
            <ScissorsIcon style={{ 
              width: '24px', 
              height: '24px', 
              color: isDrawingMode ? 'white' : 'black' 
            }} />
          </span>
        </button>

        <button 
          onClick={clearMask}
          disabled={!selectedImageId}
          style={{
            width: '40px',
            height: '40px',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: selectedImageId ? 'pointer' : 'default',
            opacity: selectedImageId ? 1 : 0.3
          }}
          title="Clear Mask"
        >
          <span style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            padding: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '40px',
            height: '40px',
            boxSizing: 'border-box'
          }}>
            <ResetIcon style={{ width: '24px', height: '24px', color: 'black' }} />
          </span>
        </button>
      </div>
    </div>
  );
};

ControlsSidebar.propTypes = {
  bgColor: PropTypes.string.isRequired,
  handleColorChange: PropTypes.func.isRequired,
  selectedImageId: PropTypes.number,
  isDrawingMode: PropTypes.bool.isRequired,
  setIsDrawingMode: PropTypes.func.isRequired,
  clearMask: PropTypes.func.isRequired
};

export default ControlsSidebar;