import { useState, useCallback } from 'react';
import { pointsToSvgPath } from '../utils/svgUtils';

const useDrawingMode = (images, updateImage, onColorChange) => {
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [drawingPath, setDrawingPath] = useState([]);

  console.log(onColorChange)

  const handleDrawStart = useCallback((e) => {
    if (!isDrawingMode || !selectedImageId) return;
    
    e.preventDefault();
    const point = getPointFromEvent(e);
    setDrawingPath([point]);
  }, [isDrawingMode, selectedImageId]);

  const handleDrawMove = useCallback((e) => {
    if (!isDrawingMode || !selectedImageId || drawingPath.length === 0) return;
    
    e.preventDefault();
    const point = getPointFromEvent(e);
    setDrawingPath(prev => [...prev, point]);
  }, [isDrawingMode, selectedImageId, drawingPath]);

  const handleDrawEnd = useCallback(() => {
    if (!isDrawingMode || !selectedImageId || drawingPath.length < 3) {
      setDrawingPath([]);
      return;
    }

    const closedPath = [...drawingPath, drawingPath[0]];
    const svgPath = pointsToSvgPath(closedPath, images.find(img => img.id === selectedImageId));
    
    updateImage(selectedImageId, {
      maskPath: svgPath,
      originalMaskPath: svgPath
    });

    setDrawingPath([]);
    setIsDrawingMode(false);
  }, [isDrawingMode, selectedImageId, drawingPath, images, updateImage]);

  const clearMask = useCallback(() => {
    if (!selectedImageId) return;
    updateImage(selectedImageId, { maskPath: null, originalMaskPath: null });
  }, [selectedImageId, updateImage]);

  return {
    isDrawingMode,
    selectedImageId,
    drawingPath,
    setIsDrawingMode,
    setSelectedImageId,
    handleDrawStart,
    handleDrawMove,
    handleDrawEnd,
    clearMask
  };
};

const getPointFromEvent = (e) => {
  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  const clientY = e.clientY || (e.touches && e.touches[0].clientY);
  return { x: clientX, y: clientY };
};

export default useDrawingMode;
