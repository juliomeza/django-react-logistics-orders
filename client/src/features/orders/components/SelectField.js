import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  getOptionLabel,
  getOptionValue,
  id = name,
  error = false,
  helperText = '',
  ...props
}) => {
  const labelId = `${id}-label`;

  return (
    <FormControl fullWidth required={required} error={error} {...props}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        label={label}
        MenuProps={{
          disableScrollLock: true,
        }}
      >
        {options.map((option) => (
          <MenuItem key={getOptionValue(option)} value={getOptionValue(option)}>
            {getOptionLabel(option)}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default SelectField;