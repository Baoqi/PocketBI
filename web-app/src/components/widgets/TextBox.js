import React from 'react';
import PropTypes from 'prop-types';
import './TextBox.css';

function TextBox(props) {
  const {
    fontSize = 16,
    fontColor = '#000000',
    isLink = false,
    value,
    linkUrl
  } = props;

  const style = {
    fontSize: fontSize + 'px',
    color: fontColor
  }

  return (
      <div className="text-box" style={style}>
        { isLink ?
          (
            <a href={linkUrl}>{value}</a>
          ) : 
          (
            value
          )
        }
      </div>
  );
}

TextBox.propTypes = {
  fontSize: PropTypes.string.isRequired,
  fontColor: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
};

export default TextBox;