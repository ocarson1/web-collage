import { useEffect, useCallback } from 'react';

const useKeyboardShortcuts = ({ onImageCreate, imageData, onSendBang }) => {
  const handleKeyPress = useCallback((event) => {
    const activeElement = document.activeElement;
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
      return;
    }
    
    const validKeys = [
      ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)), // a-z
      ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), // A-Z
      '<', '>', ';', '['
    ];

    const key = event.key;
    const index = validKeys.indexOf(key);

    if (index !== -1 && imageData[index]) {
      onSendBang?.();
      const position = getRandomPosition();
      onImageCreate(imageData[index], position);
    }
  }, [imageData, onImageCreate, onSendBang]);

  useEffect(() => {
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [handleKeyPress]);
};

const getRandomPosition = () => {
  const container = document.querySelector('.image-generator-container');
  if (!container) return { x: 0, y: 0 };
  
  const { width, height } = container.getBoundingClientRect();
  return {
    x: Math.random() * (width - 200),
    y: Math.random() * (height - 200)
  };
};

export default useKeyboardShortcuts;
