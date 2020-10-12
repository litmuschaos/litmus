const sortAlphaAsc = (a: string, b: string): number =>
  a === b ? 0 : a < b ? -1 : 1;

const sortAlphaDesc = (a: string, b: string): number =>
  a === b ? 0 : a > b ? -1 : 1;

const sortNumAsc = (a: number, b: number): number =>
  a === b ? 0 : a < b ? -1 : 1;

const sortNumDesc = (a: number, b: number): number =>
  a === b ? 0 : a > b ? -1 : 1;

export { sortAlphaAsc, sortAlphaDesc, sortNumAsc, sortNumDesc };
