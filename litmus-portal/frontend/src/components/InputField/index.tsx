import { TextField } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  required: boolean;
  formError: boolean;
  handleChange: (event: React.ChangeEvent<{ value: string }>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  label,
  name,
  value,
  required,
  formError,
  handleChange,
}) => {
  const classes = useStyles();
  return (
    <TextField
      label={label}
      name={name}
      value={value}
      type={type}
      required={required}
      InputProps={{ disableUnderline: true }}
      onChange={handleChange}
      className={`${classes.inputArea} ${
        formError ? classes.error : classes.success
      }`}
    />
  );
};

export default InputField;
