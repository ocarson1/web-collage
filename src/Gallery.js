import React from "react"
import PropTypes from 'prop-types';
import './Gallery.css';



const Gallery = ({ images }) => {




    console.log('gallery')
    console.log(images)


    return (
        <div className="gallery-section">
                    <div className="gallery-container">
                        <p style={{ lineHeight: "1.25" }}>GALLERY</p><br></br>

        <div className="gallery-grid">
            {images.slice().reverse().map((image, index) => (
                <div className="grid-item" key={index}>
                    <img src={image.imageUrl} alt={image.metadata.title} />
                    <div className="caption">
                        <h3>{image.metadata.title}</h3>
                        <p>{image.metadata.description}</p>
                    </div>
                </div>
            ))}
        </div>
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