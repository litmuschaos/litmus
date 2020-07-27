import { TextField } from '@material-ui/core';
import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import useStyles from './styles';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  password?: boolean;
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
  password,
  required,
  formError,
  handleChange,
}) => {
  const classes = useStyles();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const handleClickShowPassword = () => {
    setShowPassword(true);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setShowPassword(false);
  };

  if (password) {
    return (
      <div className={classes.passwordDiv}>
        <TextField
          label={label}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          InputProps={{
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          className={`${classes.inputArea} ${
            formError ? classes.error : classes.success
          }`}
        />
      </div>
    );
  }
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
