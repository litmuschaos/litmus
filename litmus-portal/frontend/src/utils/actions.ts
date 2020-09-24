const requestActions = (name: string) => {
  return {
    REQUEST: name,
    SUCCESS: `${name}_SUCCESS`,
    FAIL: `${name}_FAIL`,
  };
};

export default requestActions;
