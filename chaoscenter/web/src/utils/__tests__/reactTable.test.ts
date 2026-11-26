import { getPageSizeOptions } from '../reactTable';

describe('getPageSizeOptions', () => {
  test('sorts the sizes numerically, not as strings', () => {
    expect(getPageSizeOptions([5, 10, 15, 30], 100)).toEqual([5, 10, 15, 30, 100]);
  });

  test('adds the current size in its place', () => {
    expect(getPageSizeOptions([15, 30], 8)).toEqual([8, 15, 30]);
    expect(getPageSizeOptions([15, 30], 20)).toEqual([15, 20, 30]);
  });

  test('does not repeat a size that is already a default', () => {
    expect(getPageSizeOptions([5, 10, 15, 30], 10)).toEqual([5, 10, 15, 30]);
  });

  test('does not change the given defaults', () => {
    const defaults = [30, 15];
    getPageSizeOptions(defaults, 5);
    expect(defaults).toEqual([30, 15]);
  });
});
