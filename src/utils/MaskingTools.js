/**
 * MaskingTools.js
 * Utility functions for handling SVG paths and masks
 */

/**
 * Scales an SVG path by the given scale factors
 * @param {string} pathData - The SVG path data string
 * @param {number} scaleX - The horizontal scale factor
 * @param {number} scaleY - The vertical scale factor
 * @returns {string} - The scaled SVG path data
 */
export const scaleSvgPath = (pathData, scaleX, scaleY) => {

      // If no scaling needed
  if (scaleX === 1 && scaleY === 1) return pathData;
  
    if (!pathData) return null;
    
    // Split the path data into commands and coordinates
    const pathParts = pathData.match(/([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/g) || [];
    
    // Process each command separately
    return pathParts.map(part => {
      const command = part.charAt(0);
      const params = part.substring(1).trim();
      
      // Different handling based on command type
      switch (command) {
        case 'M': // Move to
        case 'L': // Line to
        case 'C': // Cubic bezier
        case 'S': // Smooth cubic bezier
        case 'Q': // Quadratic bezier
        case 'T': // Smooth quadratic bezier
          // These commands use x,y coordinate pairs
          return command + scaleCoordinatePairs(params, scaleX, scaleY);
          
        case 'H': // Horizontal line
          // Only scale x coordinates
          return command + scaleValues(params, scaleX);
          
        case 'V': // Vertical line
          // Only scale y coordinates
          return command + scaleValues(params, scaleY);
          
        case 'A': // Arc
          // Special handling for arc parameters
          return command + scaleArcParams(params, scaleX, scaleY);
          
        case 'Z': // Close path
          // No parameters to scale
          return command;
          
        default:
          return part;
      }
    }).join('');
  };
  
  /**
   * Helper function to scale coordinate pairs (x,y x,y ...)
   * @param {string} paramsStr - String of coordinate pairs
   * @param {number} scaleX - The horizontal scale factor
   * @param {number} scaleY - The vertical scale factor
   * @returns {string} - Scaled coordinate pairs
   */
  export const scaleCoordinatePairs = (paramsStr, scaleX, scaleY) => {
    // Split by any whitespace or comma
    const pairs = paramsStr.trim().split(/[\s,]+/);
    const result = [];
    
    // Process pairs of values (x,y)
    for (let i = 0; i < pairs.length; i += 2) {
      if (i + 1 < pairs.length) {
        const x = parseFloat(pairs[i]) * scaleX;
        const y = parseFloat(pairs[i + 1]) * scaleY;
        result.push(`${x},${y}`);
      }
    }
    
    return result.join(' ');
  };
  
  /**
   * Helper function to scale a list of single values
   * @param {string} paramsStr - String of values
   * @param {number} scale - The scale factor
   * @returns {string} - Scaled values
   */
  export const scaleValues = (paramsStr, scale) => {
    const values = paramsStr.trim().split(/[\s,]+/);
    return values.map(val => parseFloat(val) * scale).join(' ');
  };
  
  /**
   * Helper function to scale arc parameters
   * @param {string} paramsStr - String of arc parameters
   * @param {number} scaleX - The horizontal scale factor
   * @param {number} scaleY - The vertical scale factor
   * @returns {string} - Scaled arc parameters
   */
  export const scaleArcParams = (paramsStr, scaleX, scaleY) => {
    // Arc format: rx ry x-axis-rotation large-arc-flag sweep-flag x y
    const params = paramsStr.trim().split(/[\s,]+/);
    const result = [];
    
    for (let i = 0; i < params.length; i += 7) {
      if (i + 6 < params.length) {
        // Scale rx, ry
        const rx = parseFloat(params[i]) * scaleX;
        const ry = parseFloat(params[i + 1]) * scaleY;
        
        // Keep rotation and flags as they are
        const xAxisRotation = params[i + 2];
        const largeArcFlag = params[i + 3];
        const sweepFlag = params[i + 4];
        
        // Scale end point coordinates
        const x = parseFloat(params[i + 5]) * scaleX;
        const y = parseFloat(params[i + 6]) * scaleY;
        
        result.push(`${rx} ${ry} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${x},${y}`);
      }
    }
    
    return result.join(' ');
  };
  
  /**
   * Converts an array of points to an SVG path string, relative to an image
   * @param {Array} points - Array of {x, y} coordinates
   * @param {Object} imagePosition - {x, y} position of the reference image
   * @returns {string} - SVG path data string
   */
  export const pointsToSvgPath = (points, imagePosition) => {
    if (points.length < 3) return '';
    
    if (!imagePosition) return '';
    
    const imageLeft = imagePosition.x;
    const imageTop = imagePosition.y;
    
    // Convert absolute canvas coordinates to coordinates relative to the image
    const relativePoints = points.map(point => ({
      x: point.x - imageLeft,
      y: point.y - imageTop
    }));
    
    let path = `M${relativePoints[0].x},${relativePoints[0].y}`;
    
    for (let i = 1; i < relativePoints.length; i++) {
      path += ` L${relativePoints[i].x},${relativePoints[i].y}`;
    }
    
    return path + ' Z'; // Close the path
  };
  
  /**
   * Calculate accessible text color based on background color
   * @param {string} hexColor - Hex color code with # prefix
   * @returns {string} - Black or white hex color code
   */
  export const getAccessibleTextColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;
  
    const [rLin, gLin, bLin] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
  
    const luminance = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  
    return luminance > 0.179 ? "#000000" : "#ffffff";
  };
  
  /**
   * Draw the current path on a canvas
   * @param {Array} points - Array of {x, y} coordinates 
   * @param {Object} canvasRef - Reference to canvas element
   */
  export const drawOnCanvas = (points, canvasRef) => {
    if (!canvasRef || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw path
    if (points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    // Style for the drawing preview
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // If we have a closed path with more than 2 points, fill it semi-transparently
    if (points.length > 2) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.fill();
    }
  };
  
  /**
   * Extract point coordinates from mouse or touch event
   * @param {Event} e - Mouse or touch event
   * @param {Object} canvasRef - Reference to canvas element
   * @returns {Object} - {x, y} coordinates
   */
  export const getPointFromEvent = (e, canvasRef) => {
    if (!canvasRef || !canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };
  
  export default {
    scaleSvgPath,
    scaleCoordinatePairs,
    scaleValues,
    scaleArcParams,
    pointsToSvgPath,
    getAccessibleTextColor,
    drawOnCanvas,
    getPointFromEvent
  };