export const promptCopy = (text: string) => {
  // eslint-disable-next-line no-alert
  window.prompt('Copy to clipboard: Ctrl+C, Enter', text);
};
