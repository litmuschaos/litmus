export const copyTextToClipboard = (text: string) => {
  if (!navigator.clipboard) {
    console.error('Oops Could not copy text: ');
    return;
  }
  navigator.clipboard
    .writeText(text)
    .catch((err) => console.error('Async: Could not copy text: ', err));
};
