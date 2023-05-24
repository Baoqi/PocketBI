import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

function Card(props) {
  const {
    value,
    fontSize = 16,
    fontColor = '#000000'
  } = props;

  const valueStyle = {
    fontSize: fontSize + 'px',
    color: fontColor
  }

  return (
      <div className="card-container">
        <div className="card-value" style={valueStyle}>
          {value}
        </div>
      </div>
  );
}

Card.propTypes = {
  value: PropTypes.string,
  fontSize: PropTypes.number,
  fontColor: PropTypes.string
};

export default Card;