import React from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as BucketIcon } from '../bucket.svg';
import { ReactComponent as ScissorsIcon } from '../scissors.svg';
import { ReactComponent as ResetIcon } from '../reset.svg';

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
      <div className="color-controls" >
        <label 
          
          title="Pick Background Color"
        >
          <BucketIcon style={{ width: '24px', height: '24px', color: 'black' }} />
          <input
            type="color"
            value={bgColor}
            onChange={handleColorChange}
           
          />
        </label>
      </div>

      {/* Mask controls */}
      <div className="mask-controls" >
        <button 
          onClick={() => setIsDrawingMode(true)}
          disabled={!selectedImageId || isDrawingMode}
         
          title="Draw Mask"
        >
          <span >
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
          
          title="Clear Mask"
        >
          <span >
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