// DD = Double Digits Label
export const zeroFiftyNineDDOptions = Array.from({ length: 60 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: `${i}`
}));
export const oneFiftyNineDDOptions = zeroFiftyNineDDOptions.slice(1);
export const oneTwelveDDOptions = Array.from({ length: 12 }, (_, i) => ({
  label: (i + 1).toString().padStart(2, '0'),
  value: `${i + 1}`
}));
export const amPmOptions = [
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' }
];
