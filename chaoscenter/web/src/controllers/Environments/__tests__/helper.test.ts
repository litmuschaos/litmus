import { getEnvironmentPageSizeOptions } from '../helper';

test('orders environment page sizes numerically and keeps each size once', () => {
  expect(getEnvironmentPageSizeOptions(5)).toEqual([5, 10, 15, 30]);
  expect(getEnvironmentPageSizeOptions(20)).toEqual([5, 10, 15, 20, 30]);
});
