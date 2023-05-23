import React from 'react';
import { ColorPicker as AntdColorPicker } from 'antd';
import PropTypes from "prop-types";

function ColorPicker(props) {
  const {
    name,
    value,
    onChange
  } = props;

  const handleChange = (color, hex) => {
    const rgb = color.toRgb();
    const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
    onChange(name, rgba);
  };

  return (
      <AntdColorPicker name={name} value={value} onChange={handleChange} />
  );
}

ColorPicker.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default ColorPicker;