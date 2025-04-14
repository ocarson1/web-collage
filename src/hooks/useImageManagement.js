import { useState, useCallback } from 'react';

const useImageManagement = () => {
  const [images, setImages] = useState([]);
  const [maxZIndex, setMaxZIndex] = useState(1);

  const createNewImage = useCallback((imageData, position) => {
    const newMaxZIndex = maxZIndex + 1;
    setMaxZIndex(newMaxZIndex);

    const newImage = {
      id: Date.now(),
      position,
      src: imageData.newsItemPicture,
      parentTitle: imageData.parentTitle,
      newsItemUrl: imageData.newsItemUrl,
      width: imageData.width || 400,
      height: imageData.height || 300,
      zIndex: newMaxZIndex,
      maskPath: null,
      originalMaskPath: null
    };

    setImages(prev => [...prev, newImage]);
  }, [maxZIndex]);

  const deleteImage = useCallback((imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  }, []);

  const updateImage = useCallback((imageId, updates) => {
    setImages(prev => prev.map(img =>
      img.id === imageId ? { ...img, ...updates } : img
    ));
  }, []);

  return {
    images,
    createNewImage,
    deleteImage,
    updateImage
  };
};

export default useImageManagement;
