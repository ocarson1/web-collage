import React from 'react';
import PropTypes from 'prop-types';
import DraggableImage from './DraggableImage';
import DrawingCanvas from './DrawingCanvas';
import ControlPanel from './ControlPanel';
import useImageManagement from '../../hooks/useImageManagement';
import useDrawingMode from '../../hooks/useDrawingMode';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

const ImageGeneratorContainer = ({ 
  imageData, 
  borderColor, 
  onSendBang, 
  onColorChange, 
  bgColor 
}) => {
  const {
    images,
    createNewImage,
    deleteImage,
    updateImage
  } = useImageManagement();

  const {
    isDrawingMode,
    selectedImageId,
    handleDrawStart,
    handleDrawMove,
    handleDrawEnd,
    clearMask
  } = useDrawingMode(images, updateImage, onColorChange);

  useKeyboardShortcuts({
    onImageCreate: createNewImage,
    imageData,
    onSendBang
  });

  return (
    <div className="image-generator-wrapper">
      <DrawingCanvas
        isDrawingMode={isDrawingMode}
        onDrawStart={handleDrawStart}
        onDrawMove={handleDrawMove}
        onDrawEnd={handleDrawEnd}
      />
      
      {images.map(image => (
        <DraggableImage
          key={image.id}
          image={image}
          isSelected={selectedImageId === image.id}
          onDelete={deleteImage}
          onUpdate={updateImage}
          borderColor={borderColor}
        />
      ))}

      <ControlPanel
        selectedImageId={selectedImageId}
        isDrawingMode={isDrawingMode}
        onColorChange={onColorChange}
        bgColor={bgColor}
        onClearMask={clearMask}
      />
    </div>
  );
};

ImageGeneratorContainer.propTypes = {
  imageData: PropTypes.array.isRequired,
  borderColor: PropTypes.string,
  onSendBang: PropTypes.func,
  onColorChange: PropTypes.func.isRequired,
  bgColor: PropTypes.string.isRequired
};

export default ImageGeneratorContainer;
