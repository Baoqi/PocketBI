import React from 'react';
import PropTypes from 'prop-types';
import './SelectButtons.css';

function SelectButtons(props) {
  const {
    name,
    value,
    selections = [],
    onChange
  } = props;

  const buttonItems = [];
  for (let i = 0; i < selections.length; i++) {
    const {
      display,
      value: actualValue
    } = selections[i];
    const activeClass = actualValue === value ? 'select-button-active' : '';
    buttonItems.push(
        <div className={`select-button ${activeClass}`} onClick={() => onChange(name, actualValue)} key={actualValue}>{display}</div>
    )
  }

  return (
      <div className="selectbuttons-container">
        {buttonItems}
      </div>
  );
}

SelectButtons.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  selections: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

export default SelectButtons;