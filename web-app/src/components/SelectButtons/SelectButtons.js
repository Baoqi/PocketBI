import React from 'react';
import PropTypes from 'prop-types';
import { Radio } from 'antd';

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
    buttonItems.push(
        <Radio.Button value={actualValue} key={actualValue}>{display}</Radio.Button>
    );
  }


  return (
      <Radio.Group size='large' buttonStyle='solid' value={value} onChange={(e) => onChange(name, e.target.value)}>
        {buttonItems}
      </Radio.Group>
  );
}

SelectButtons.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  selections: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

export default SelectButtons;