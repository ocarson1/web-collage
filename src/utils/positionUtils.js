/**
 * Position utility functions for the ImageGenerator component
 */

/**
 * Calculates a position within the container bounds
 * @param {number} [x] - Optional x coordinate (for click positioning)
 * @param {number} [y] - Optional y coordinate (for click positioning)
 * @param {HTMLElement} [container] - The container element
 * @returns {Object} Position coordinates {x, y}
 */
export const getRandomPosition = (x, y, container = null) => {
    // Find container if not provided
    if (!container) {
      container = document.querySelector('.image-generator-container');
    }
    
    if (!container) return { x: 0, y: 0 }; // Fallback if container not found
    
    const { left, top, width, height } = container.getBoundingClientRect();
    
    if (x !== undefined && y !== undefined) {
      // Calculate position relative to container, accounting for scroll
      return {
        x: x - left - 100,
        y: y - top - 100
      };
    }
    
    // For random positioning
    return {
      x: Math.max(-100, Math.min(-100 + Math.random() * width, width - 100)),
      y: Math.max(-100, Math.min(-100 + Math.random() * height, height - 100))
    };
  };
  
  /**
   * Constrains a position to remain visible within the container
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {number} width - The element width
   * @param {number} height - The element height
   * @param {Object} containerDimensions - The container dimensions
   * @returns {Object} Constrained coordinates {x, y}
   */
  export const constrainPosition = (x, y, width, height, containerDimensions) => {
    const { width: containerWidth, height: containerHeight } = containerDimensions;
    
    // Ensure at least part of the element is visible
    // Allow for element to overflow by at most 80% of its dimension
    const minX = -width * 0.8;
    const maxX = containerWidth - width * 0.2;
    const minY = -height * 0.8;
    const maxY = containerHeight - height * 0.2;
    
    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY)),
    };
  };
  
  /**
   * Calculates offset for drag operations
   * @param {MouseEvent|TouchEvent} event - The event object
   * @param {HTMLElement} element - The element being dragged
   * @returns {Object} Offset coordinates {x, y}
   */
  export const calculateDragOffset = (event, element) => {
    const rect = element.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };
  
  /**
   * Gets coordinates from mouse or touch event
   * @param {MouseEvent|TouchEvent} event - The event object
   * @param {HTMLElement} container - The container element
   * @returns {Object} Coordinates {x, y}
   */
  export const getEventCoordinates = (event, container) => {
    const containerRect = container.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    
    return {
      x: clientX - containerRect.left,
      y: clientY - containerRect.top
    };
  };
  
  /**
   * Determines if a point is inside a specific image
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {Object} image - The image object
   * @returns {boolean} True if point is inside the image
   */
  export const isPointInImage = (x, y, image) => {
    const { position, width, height } = image;
    
    return (
      x >= position.x &&
      x <= position.x + width &&
      y >= position.y &&
      y <= position.y + height
    );
  };
  
  /**
   * Calculates a grid-aligned position
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {number} gridSize - The grid size for snapping
   * @returns {Object} Grid-aligned coordinates {x, y}
   */
  export const snapToGrid = (x, y, gridSize = 20) => {
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  };