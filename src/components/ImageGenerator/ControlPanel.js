import React from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as BucketIcon } from '../../components/bucket.svg';
import { ReactComponent as ScissorsIcon } from '../../components/scissors.svg';
import { ReactComponent as ResetIcon } from '../../components/reset.svg';

import './ControlsSidebar.css'

const ControlPanel = ({
  selectedImageId,
  isDrawingMode,
  onColorChange,
  bgColor,
  onClearMask,
  onStartDrawing
}) => {
  return (
    <div className="controls-sidebar exclude-from-capture" >
      <div className="color-controls">
        <label >
          <BucketIcon style={{ width: '24px', height: '24px', color: 'black' }} />
          <input
            type="color"
            value={bgColor}
            onChange={onColorChange}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '0.1px',
              height: '0.1px',
              overflow: 'hidden'
            }}
          />
        </label>
      </div>

      <div className="mask-controls" style={{ display: "flex", gap: '20px' }}>
        <button 
          onClick={onStartDrawing}
          disabled={!selectedImageId || isDrawingMode}
          
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
          onClick={onClearMask}
          disabled={!selectedImageId}
          
        >
          <span >
            <ResetIcon style={{ width: '24px', height: '24px', color: 'black' }} />
          </span>
        </button>
      </div>
    </div>
  );
};

ControlPanel.propTypes = {
  selectedImageId: PropTypes.number,
  isDrawingMode: PropTypes.bool.isRequired,
  onColorChange: PropTypes.func.isRequired,
  bgColor: PropTypes.string.isRequired,
  onClearMask: PropTypes.func.isRequired,
  onStartDrawing: PropTypes.func.isRequired
};

export default ControlPanel;
