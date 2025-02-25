import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

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
  ...props
}) => {
  const labelId = `${id}-label`;
  
  return (
    <FormControl fullWidth required={required} {...props}>
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
    </FormControl>
  );
};

export default SelectField;