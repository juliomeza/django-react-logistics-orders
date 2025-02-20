import React from 'react';
import { TextField, MenuItem } from '@mui/material';

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  getOptionLabel,
  getOptionValue,
  ...props
}) => {
  return (
    <TextField
      select
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      fullWidth
      required={required}
      {...props}
    >
      {options.map((option) => (
        <MenuItem key={getOptionValue(option)} value={getOptionValue(option)}>
          {getOptionLabel(option)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectField;
