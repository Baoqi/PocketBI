import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';
const { Search } = Input;

function SearchInput(props) {
  const {
    name,
    value,
    inputWidth,
    onChange
  } = props;

  let inputStyle = {};
  if (inputWidth) {
    inputStyle.width = inputWidth + 'px';
  }

  return (
      <Search placeholder="" value={value} onChange={e => onChange(name, e.target.value)} style={inputStyle} enterButton allowClear />
  )
}

SearchInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  inputWidth: PropTypes.number
};

export default SearchInput;