import React from 'react';
import PropTypes from 'prop-types';
import { Select as AntdSelect } from 'antd';

function Select(props) {
  const {
    name,
    value,
    options = [],
    optionValue,
    optionDisplay,
    onChange,
    preloadOneEmpty = true
  } = props;

  const optionList = [];
  if (preloadOneEmpty) {
    optionList.push({
      value: '',
      label: ''
    });
  }
    
  options.forEach((option, index) => {
    let value;
    let display;
    if (optionValue && optionDisplay) {
      // The options contain objects.
      value = option[optionValue];
      display = option[optionDisplay];
    } else {
      // The options contain string or number.
      value = option;
      display = option;
    }

    optionList.push({
      value: value,
      label: display
    });
  });

  return (
      <AntdSelect
          showSearch
          value={value}
          size={'large'}
          style={{ width: '100%' }}
          onChange={v => onChange(name, v)}
          filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options = {optionList}
      />
  );
}

Select.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  optionDisplay: PropTypes.string,
  optionValue: PropTypes.string,
  preloadOneEmpty: PropTypes.bool
};

export default Select;