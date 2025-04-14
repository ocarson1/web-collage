import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [maxZIndex, setMaxZIndex] = useState(1);

  const value = {
    images,
    setImages,
    selectedImageId,
    setSelectedImageId,
    maxZIndex,
    setMaxZIndex
  };

  return (
    <ImageContext.Provider value={value}>
      {children}
    </ImageContext.Provider>
  );
};

ImageProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImageContext must be used within an ImageProvider');
  }
  return context;
};

export default ImageContext;
