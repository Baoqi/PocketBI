import React from 'react';
import PropTypes from 'prop-types';
import './ImageBox.css';

function ImageBox(props) {
  const {
    isFull = false,
    src
  } = props;

  const imageClass = isFull ? 'image-full' : 'image-original-scale';

  return (
      <img 
          className={imageClass}
          src={src}
          alt="not available"
      />
  );
}

ImageBox.propTypes = {
  src: PropTypes.string.isRequired,
  isFull: PropTypes.bool
};

export default ImageBox;