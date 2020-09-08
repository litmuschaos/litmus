import { TextField, OutlinedInputProps } from '@material-ui/core';
import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import AccountCircle from '@material-ui/icons/AccountCircle';
import SearchIcon from '@material-ui/icons/Search';
import { useStyles, useStylesLitmus } from './styles';

interface InputFieldProps {
  label: string;
  type?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  helperText?: string;
  validationError?: boolean;
  success?: boolean;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  dataCy?: string;
  iconType?: string | undefined;
  handleChange?:
    | ((event: React.ChangeEvent<{ value: string }>) => void)
    | ((event: React.ChangeEvent<HTMLInputElement>) => void);
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  label,
  id,
  name,
  placeholder,
  defaultValue,
  value,
  helperText,
  validationError,
  success,
  required,
  disabled,
  iconType,
  dataCy,
  handleChange,
}) => {
  const LitmusTextFieldStylesExternal = useStyles();

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const classes = useStylesLitmus(success);

  const handleClickShowPassword = () => {
    setShowPassword(true);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setShowPassword(false);
  };

  if (type === 'password' && validationError === false) {
    return (
      <TextField
        className={LitmusTextFieldStylesExternal.inputArea}
        label={label}
        helperText={helperText}
        value={value}
        type={showPassword ? 'text' : 'password'}
        required={required}
        onChange={handleChange}
        variant="filled"
        InputProps={
          {
            classes,
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
          } as Partial<OutlinedInputProps>
        }
      />
    );
  }
  if (type === 'password' && validationError === true) {
    return (
      <TextField
        className={LitmusTextFieldStylesExternal.inputArea}
        error
        label={label}
        helperText={helperText}
        value={value}
        type={showPassword ? 'text' : 'password'}
        required={required}
        onChange={handleChange}
        variant="filled"
        InputProps={
          {
            classes,
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
          } as Partial<OutlinedInputProps>
        }
      />
    );
  }

  if (iconType) {
    if (iconType === 'searchLeft') {
      return (
        <TextField
          className={LitmusTextFieldStylesExternal.inputArea}
          label={label}
          helperText={helperText}
          placeholder={placeholder}
          value={value}
          type={type}
          required={required}
          onChange={handleChange}
          variant="filled"
          InputProps={
            {
              classes,
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            } as Partial<OutlinedInputProps>
          }
        />
      );
    }
    if (iconType === 'iconLeft' && validationError === false) {
      return (
        <TextField
          className={LitmusTextFieldStylesExternal.inputArea}
          label={label}
          helperText={helperText}
          value={value}
          type={type}
          required={required}
          onChange={handleChange}
          variant="filled"
          InputProps={
            {
              classes,
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            } as Partial<OutlinedInputProps>
          }
        />
      );
    }
    if (iconType === 'iconLeft' && validationError === true) {
      return (
        <TextField
          className={LitmusTextFieldStylesExternal.inputArea}
          error
          label={label}
          helperText={helperText}
          value={value}
          type={type}
          required={required}
          onChange={handleChange}
          variant="filled"
          InputProps={
            {
              classes,
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            } as Partial<OutlinedInputProps>
          }
        />
      );
    }
    if (iconType === 'iconRight' && validationError === false) {
      return (
        <TextField
          className={LitmusTextFieldStylesExternal.inputArea}
          label={label}
          helperText={helperText}
          value={value}
          type={type}
          required={required}
          onChange={handleChange}
          variant="filled"
          InputProps={
            {
              classes,
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  <AccountCircle />
                </InputAdornment>
              ),
            } as Partial<OutlinedInputProps>
          }
        />
      );
    }
    if (
      iconType === 'iconRight' &&
      validationError === false &&
      success === true
    ) {
      return (
        <TextField
          className={LitmusTextFieldStylesExternal.inputArea}
          label={label}
          helperText={helperText}
          value={value}
          type={type}
          required={required}
          onChange={handleChange}
          variant="filled"
          InputProps={
            {
              classes,
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  <AccountCircle />
                </InputAdornment>
              ),
            } as Partial<OutlinedInputProps>
          }
        />
      );
    }
    if (iconType === 'iconRight' && validationError === true) {
      return (
        <TextField
          className={LitmusTextFieldStylesExternal.inputArea}
          error
          label={label}
          helperText={helperText}
          value={value}
          type={type}
          required={required}
          onChange={handleChange}
          variant="filled"
          InputProps={
            {
              classes,
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  <img src="/icons/closeFilled.svg" alt="Error" />
                </InputAdornment>
              ),
            } as Partial<OutlinedInputProps>
          }
        />
      );
    }
    if (iconType === 'iconLeftRight' && validationError === false) {
      return (
        <TextField
          className={LitmusTextFieldStylesExternal.inputArea}
          label={label}
          helperText={helperText}
          value={value}
          type={type}
          required={required}
          onChange={handleChange}
          variant="filled"
          InputProps={
            {
              classes,
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <AccountCircle />
                </InputAdornment>
              ),
            } as Partial<OutlinedInputProps>
          }
        />
      );
    }
    if (iconType === 'iconLeftRight' && validationError === true) {
      return (
        <TextField
          className={LitmusTextFieldStylesExternal.inputArea}
          error
          label={label}
          helperText={helperText}
          value={value}
          type={type}
          required={required}
          onChange={handleChange}
          variant="filled"
          InputProps={
            {
              classes,
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <img src="/icons/closeFilled.svg" alt="Error" />
                </InputAdornment>
              ),
            } as Partial<OutlinedInputProps>
          }
        />
      );
    }
  }

  return (
    <TextField
      className={LitmusTextFieldStylesExternal.inputArea}
      error={validationError}
      label={label}
      id={id}
      helperText={helperText}
      value={value}
      type={type}
      name={name}
      required={required}
      defaultValue={defaultValue}
      onChange={handleChange}
      disabled={disabled}
      variant="filled"
      data-cy={dataCy}
      InputProps={
        {
          classes,
          disableUnderline: true,
        } as Partial<OutlinedInputProps>
      }
    />
  );
};

export default InputField;
