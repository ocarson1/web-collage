import { useState, useCallback } from 'react';

const useDragAndResize = (updateImage) => {
  const [draggedImage, setDraggedImage] = useState(null);
  const [resizingImage, setResizingImage] = useState(null);
  const [justResized, setJustResized] = useState(false);

  const handleDragStart = useCallback((e, imageId) => {
    if (e.shiftKey) return;
    if (e.target.classList.contains('resize-handle')) return;

    const boundingRect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - boundingRect.left;
    const offsetY = e.clientY - boundingRect.top;

    setDraggedImage({
      id: imageId,
      offsetX,
      offsetY
    });
  }, []);

  const handleDrag = useCallback((e) => {
    if (draggedImage) {
      const container = document.querySelector('.image-generator-container');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newX = e.clientX - containerRect.left - draggedImage.offsetX;
      const newY = e.clientY - containerRect.top - draggedImage.offsetY;

      updateImage(draggedImage.id, {
        position: { x: newX, y: newY }
      });
    }

    if (resizingImage) {
      const newWidth = resizingImage.startWidth + (e.clientX - resizingImage.startX);
      const aspectRatio = resizingImage.originalWidth / resizingImage.originalHeight;
      const newHeight = Math.max(50, newWidth / aspectRatio);

      updateImage(resizingImage.id, {
        width: newWidth,
        height: newHeight
      });
    }
  }, [draggedImage, resizingImage, updateImage]);

  const handleDragEnd = useCallback(() => {
    setDraggedImage(null);
    setResizingImage(null);
    setTimeout(() => setJustResized(false), 200);
  }, []);

  const handleResizeStart = useCallback((e, imageId, imageData) => {
    e.stopPropagation();
    setResizingImage({
      id: imageId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: imageData.width,
      startHeight: imageData.height,
      originalWidth: imageData.originalWidth,
      originalHeight: imageData.originalHeight
    });
    setJustResized(true);
  }, []);

  return {
    draggedImage,
    resizingImage,
    justResized,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handleResizeStart
  };
};

export default useDragAndResize;
