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
  id = name,
  ...props
}) => {
  return (
    <TextField
      select
      id={id}
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      fullWidth
      required={required}
      slotProps={{
        input: {
          id: `${id}-input`,
        },
        htmlInput: {
          id: `${id}-input`,
        },
        select: {
          MenuProps: {
            disableScrollLock: true,
          },
        },
      }}
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