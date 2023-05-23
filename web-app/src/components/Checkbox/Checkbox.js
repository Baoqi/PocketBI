import React from 'react';
import { Checkbox as AntdCheckbox } from 'antd';
import PropTypes from "prop-types";


function Checkbox(props) {
  const {
    name,
    value,
    checked,
    readOnly,
    onChange
  } = props;

  return (
      <AntdCheckbox
          name={name}
          value={value}
          checked={checked}
          disabled={readOnly}
          onChange={ e => onChange(name, e.target.checked)
      } />
  );
}

Checkbox.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
};

export default Checkbox;
