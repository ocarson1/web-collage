import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const DrawingCanvas = ({ 
  isDrawingMode, 
  onDrawStart, 
  onDrawMove, 
  onDrawEnd 
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isDrawingMode && canvasRef.current) {
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }
  }, [isDrawingMode]);

  return isDrawingMode ? (
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
      onMouseDown={onDrawStart}
      onMouseMove={onDrawMove}
      onMouseUp={onDrawEnd}
      onTouchStart={onDrawStart}
      onTouchMove={onDrawMove}
      onTouchEnd={onDrawEnd}
    />
  ) : null;
};

DrawingCanvas.propTypes = {
  isDrawingMode: PropTypes.bool.isRequired,
  onDrawStart: PropTypes.func.isRequired,
  onDrawMove: PropTypes.func.isRequired,
  onDrawEnd: PropTypes.func.isRequired
};

export default DrawingCanvas;
