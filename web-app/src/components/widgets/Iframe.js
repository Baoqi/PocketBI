import React from 'react';
import PropTypes from 'prop-types';

function Iframe(props) {
  const {
    src,
    title
  } = props;

  const style = {
    width: '100%',
    height: '100%',
    border: '0px',
    display: 'block'
  }

  return (
      <iframe src={src} title={title} style={style}></iframe>
  );
}

Iframe.propTypes = {
    src: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
};

export default Iframe;