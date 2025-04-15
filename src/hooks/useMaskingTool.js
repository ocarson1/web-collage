import { useState, useRef, useCallback } from 'react';
import { normalizeSvgPath } from '../utils/MaskingTools';

/**
 * Hook to handle mask drawing functionality
 */
const useMaskingTool = ({ 
  images, 
  setImages, 
  isDrawingMode, 
  selectedImageId 
}) => {
  const [currentPath, setCurrentPath] = useState([]);
  const canvasRef = useRef(null);

  // Convert points array to SVG path string
  const pointsToSvgPath = (points) => {
    if (points.length < 3) return '';
    
    // Find the selected image to create path relative to it
    const selectedImage = images.find(img => img.id === selectedImageId);
    if (!selectedImage) return '';
    
    const imageLeft = selectedImage.position.x;
    const imageTop = selectedImage.position.y;
    
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

  // Draw on canvas
  const drawOnCanvas = (points) => {
    if (!canvasRef.current) return;
    
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

  // Get position from mouse or touch event
  const getPointFromEvent = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Drawing handlers
  const handleDrawStart = useCallback((e) => {
    if (!isDrawingMode || !selectedImageId) return;
    
    e.preventDefault();
    const point = getPointFromEvent(e);
    setCurrentPath([point]);
    drawOnCanvas([point]);
  }, [isDrawingMode, selectedImageId]);
  
  const handleDrawMove = useCallback((e) => {
    if (!isDrawingMode || !selectedImageId || currentPath.length === 0) return;
    
    e.preventDefault();
    const point = getPointFromEvent(e);
    const newPath = [...currentPath, point];
    setCurrentPath(newPath);
    drawOnCanvas(newPath);
  }, [isDrawingMode, selectedImageId, currentPath]);
  
  const handleDrawEnd = useCallback((e) => {
    if (!isDrawingMode || !selectedImageId) return;
    
    e.preventDefault();
    if (currentPath.length < 3) {
      // Not enough points for a proper shape
      setCurrentPath([]);
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    
    // Close the path by connecting to first point
    const closedPath = [...currentPath, currentPath[0]];
    
    // Convert points to SVG path string
    const svgPath = pointsToSvgPath(closedPath);
    
    // Find the selected image
    const selectedImage = images.find(img => img.id === selectedImageId);
    if (!selectedImage) return;
    
    // Apply to selected image
    setImages(prev => prev.map(img => 
      img.id === selectedImageId 
        ? { 
          ...img,
          originalMaskPath: svgPath,
          maskPath: svgPath,
          maskOriginalWidth: img.width,
          maskOriginalHeight: img.height,
          normalizedMaskPath: normalizeSvgPath(svgPath, img.width, img.height)
        }
        : img
    ));
    
    // Clear drawing state
    setCurrentPath([]);
    
    // Clear canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [isDrawingMode, selectedImageId, currentPath, images, setImages, pointsToSvgPath]);
  
  // Clear mask from selected image
  const clearMask = useCallback(() => {
    if (!selectedImageId) return;
    
    setImages(prev => prev.map(img => 
      img.id === selectedImageId 
        ? { ...img, maskPath: null, originalMaskPath: null, normalizedMaskPath: null }
        : img
    ));
  }, [selectedImageId, setImages]);

  return {
    currentPath,
    canvasRef,
    handleDrawStart,
    handleDrawMove,
    handleDrawEnd,
    clearMask
  };
};

export default useMaskingTool;