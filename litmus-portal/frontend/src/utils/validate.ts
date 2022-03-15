/* eslint-disable no-useless-escape */

export const validateTextEmpty = (value: string) => {
  if (value.trim() === '') return true;
  return false;
};

export const validateStartEmptySpacing = (value: string) => {
  if (value?.charAt(0) === ' ') return true;
  return false;
};

export const validateEmail = (value: string) => {
  const emailValid =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (value?.length > 0) {
    if (value.match(emailValid)) return false;
    return true;
  }
  return false;
};

export const validateSubject = (value: string) => {
  const subjectValid = /(^[a-z0-9A-Z-._]{0,63}$)/;
  if (value?.length > 0) {
    if (value.match(subjectValid)) return false;
    return true;
  }
  return false;
};

export const validateWorkflowName = (value: string) => {
  /**
   * Workflow name is 54 chars max + generated timestamp is 10 chars
   * => Total 54 + 10 = 64 chars maximum
   * */
  const workflowValid = /(^[a-z0-9-]{0,54}$)/;
  if (value.length > 0) {
    if (value.match(workflowValid)) return false;
    return true;
  }
  return false;
};

export const validateProbeName = (allProbe: any, probeName: string) => {
  if (allProbe.length) {
    const filteredProbes = allProbe.filter(
      (probe: any) => probe.name.toLowerCase() === probeName
    );
    if (filteredProbes.length) {
      return true;
    }
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
  const regEx =
    /^(http|https):\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/gm;
  const regExLocal = /^http:\/\/localhost:([0-9]){1,4}$/g;
  const regExIpv4 =
    /^http:\/\/(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]):([0-9]){1,4}$/g;
  const regExIpv6 =
    /^http:\/\/((([0-9a-fA-F]){1,4})\\:){7}([0-9a-fA-F]){1,4}:([0-9]){1,4}$/g;
  const sshRegEx =
    /^([A-Za-z0-9]+@|http(|s)\:\/\/)([-a-zA-Z0-9@:%._\+~#=]+(:\d+)?)(?::|\/)([\d\/\w.-]+?)(\.git)?$/i;
  const gitlabRegEx =
    /gitlab-git([-a-zA-Z0-9@:%._\+~#=]+(:\d+)?)(?::|\/)([\d\/\w.-]+?)(\.git)?$/i;
  if (
    value.match(regEx) ||
    value.match(regExLocal) ||
    value.match(regExIpv4) ||
    value.match(regExIpv6) ||
    value.match(sshRegEx) ||
    value.match(gitlabRegEx)
  )
    return true;
  return false;
};

export const validateTimeInSeconds = (value: string) => {
  const timeInSecondsValid = /^[0-9]+s$/g;
  if (value.length > 1) {
    if (value.match(timeInSecondsValid)) return true;
    return false;
  }
  return false;
};

export const validateWorkflowParameter = (value: string) => {
  const workflowParameterValid = /^{[a-zA-Z0-9]+}$/g;
  if (value.length > 0) {
    if (value.match(workflowParameterValid)) return false;
    return true;
  }
  return false;
};
