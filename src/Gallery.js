import {React, useState} from "react"
import PropTypes from 'prop-types';
import './Gallery.css';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseCustomDateString, formatDayDate, formatTime } from './utils/dateUtils';


const Gallery = ({ images }) => {



const [selectedIndex, setSelectedIndex] = useState(null);


const reversedImages = [...images].reverse();

  const handleImageClick = (index) => {
    // Convert the reversed index to the actual index
    const actualIndex = reversedImages.length - 1 - index;
    setSelectedIndex(actualIndex);
  };

  const handleClose = () => {
    setSelectedIndex(null);
  };

  const handlePrevious = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));

  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));

  };

    console.log('gallery')
    console.log(images)


    return (
        <div className="gallery-section">
                    <div className="gallery-container">
                    {/* <h2 style={{ maxWidth: '1080px', margin: 'auto', lineHeight: "1.25", fontWeight: "bold", marginBottom: "2em" }}>GALLERY</h2><br></br> */}

        <div className="gallery-grid">

        {reversedImages.map((image, index) => (
            
                <div className="grid-item" key={index} onClick={() => handleImageClick(index)}>
                    <div className="gal-image-wrapper">
                    <img src={image.imageUrl} alt={image.metadata.title} />
                    </div>
                    <div className="caption">
                        <h3>{formatDayDate(parseCustomDateString(image.metadata.title))}</h3>
                        <h3 style={{fontWeight:'400'}}>{formatTime(parseCustomDateString(image.metadata.title))}</h3>

                        {/* <p>{image.metadata.description}</p> */}
                    </div>
                </div>
            ))}
        </div>
        {selectedIndex !== null && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content">
            {/* Close button */}
            <button className="close-button" onClick={handleClose}>
              <X size={24} />
            </button>

            {/* Navigation buttons */}
            <button className="nav-button nav-button-left" onClick={handlePrevious}>
              <ChevronLeft size={40} />
            </button>
            <button className="nav-button nav-button-right" onClick={handleNext}>
              <ChevronRight size={40} />
            </button>

            {/* Main image */}
            {console.log("modal", images[selectedIndex])}
            <img
              src={images[selectedIndex].imageUrl}
              alt={images[selectedIndex].alt}
              className="modal-image"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
        <br>
        </br>
        <br></br>
        </div>
        </div>
      
    )
};


Gallery.propTypes = {
    images: PropTypes.arrayOf(
        PropTypes.shape({
            src: PropTypes.string.isRequired,
            alt: PropTypes.string.isRequired,
            imageUrl: PropTypes.string.isRequired,
            metadata: PropTypes.shape({
                title: PropTypes.string.isRequired,
                description: PropTypes.string.isRequired,
                uploadDate: PropTypes.string.isRequired,
            }).isRequired,
        })
    ).isRequired,
};

export default Gallery;