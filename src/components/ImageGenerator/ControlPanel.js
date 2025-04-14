import React from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as BucketIcon } from '../../components/bucket.svg';
import { ReactComponent as ScissorsIcon } from '../../components/scissors.svg';
import { ReactComponent as ResetIcon } from '../../components/reset.svg';

const ControlPanel = ({
  selectedImageId,
  isDrawingMode,
  onColorChange,
  bgColor,
  onClearMask,
  onStartDrawing
}) => {
  return (
    <div className="controls-sidebar exclude-from-capture" style={{
      position: 'absolute',
      top: 0,
      right: 0,
      zIndex: 9999,
      padding: '15px',
      display: 'flex',
      flexDirection: 'row',
      gap: '20px'
    }}>
      <div className="color-controls">
        <label style={{ 
          cursor: 'pointer',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '50%',
          padding: '6px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '40px',
          height: '40px'
        }}>
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
          style={{
            width: '40px',
            height: '40px',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: selectedImageId && !isDrawingMode ? 'pointer' : 'default',
            opacity: selectedImageId ? 1 : 0.3
          }}
        >
          <span style={{ 
            backgroundColor: isDrawingMode ? 'black' : 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            padding: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '40px',
            height: '40px'
          }}>
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
          style={{
            width: '40px',
            height: '40px',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: selectedImageId ? 'pointer' : 'default',
            opacity: selectedImageId ? 1 : 0.3
          }}
        >
          <span style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            padding: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '40px',
            height: '40px'
          }}>
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
