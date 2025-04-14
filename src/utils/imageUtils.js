// Utility functions for image manipulation
export const getImageDimensions = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => {
      resolve({
        width: 400,
        height: 200
      });
    };
    img.src = src;
  });
};

export const calculateAspectRatio = (width, height) => {
  return width / height;
};

export const scaleToFit = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
  return {
    width: originalWidth * ratio,
    height: originalHeight * ratio
  };
};
