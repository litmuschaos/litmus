/* eslint-disable no-useless-escape */

export const validateTextEmpty = (value: string) => {
  if (value.trim() === '') return true;
  return false;
};

export const validateStartEmptySpacing = (value: string) => {
  if (value.charAt(0) === ' ') return true;
  return false;
};

export const validateEmail = (value: string) => {
  const emailValid = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (value.length > 0) {
    if (value.match(emailValid)) return false;
    return true;
  }
  return false;
};

export const validateWorkflowName = (value: string) => {
  const workflowValid = /^[a-z0-9._-]+$/g;
  if (value.length > 0) {
    if (value.match(workflowValid)) return false;
    return true;
  }
  return false;
};

export const validatePassword = (value: string) => {
  const passValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
  if (value.length > 0) {
    if (value.match(passValid)) return false;
    return true;
  }
  return false;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
) => {
  if (password.length > 0 && confirmPassword.length > 0) {
    if (confirmPassword === password) return false;
    return true;
  }
  return false;
};

export const validateOnlyAlphabet = (value: string) => {
  const onlyAplhaValid = /^[a-zA-Z]+$/;
  if (value.match(onlyAplhaValid)) return false;
  return true;
};

export const validateLength = (value: string) => {
  if (value.length > 0) return false;
  return true;
};

export const isValidWebUrl = (value: string) => {
  const regEx = /^(http|https):\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/gm;
  if (value.match(regEx) || value === '') return true;
  return false;
};
