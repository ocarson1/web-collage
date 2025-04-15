import React from 'react';
import PropTypes from 'prop-types';

const ClipPathDefinitions = ({ images }) => {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        {images.map(image => 
          image.maskPath && (
            <clipPath id={`mask-${image.id}`} key={`mask-${image.id}`}>
              <path d={image.maskPath} />
            </clipPath>
          )
        )}
      </defs>
    </svg>
  );
};

ClipPathDefinitions.propTypes = {
  images: PropTypes.array.isRequired
};

export default ClipPathDefinitions;