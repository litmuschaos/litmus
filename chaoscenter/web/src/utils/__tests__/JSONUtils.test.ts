import { sanitize } from '../JSONUtils';

describe('sanitize', () => {
  test.each([
    { spec: { unused: '' } },
    { spec: { unused: null } },
    { spec: { unused: undefined } },
    { spec: { unused: {} } },
    { spec: { unused: [] } },
    { spec: { nested: { unused: '' } } }
  ])('removes objects emptied by recursive cleaning: %j', input => {
    expect(sanitize(input)).toEqual({});
  });

  test('preserves valid false and zero values', () => {
    expect(sanitize({ spec: { enabled: false, retries: 0 } })).toEqual({ spec: { enabled: false, retries: 0 } });
  });

  test('preserves newly empty objects when configured', () => {
    expect(sanitize({ spec: { unused: '' } }, { removeEmptyObject: false })).toEqual({ spec: {} });
  });

  test('preserves empty strings when configured', () => {
    expect(sanitize({ spec: { value: '' } }, { removeEmptyString: false })).toEqual({ spec: { value: '' } });
  });

  test('preserves empty arrays when configured', () => {
    expect(sanitize({ spec: { values: [] } }, { removeEmptyArray: false })).toEqual({ spec: { values: [] } });
  });

  test('leaves the result unchanged on a second sanitization', () => {
    const first = sanitize({ spec: { unused: '' } });
    const snapshot = JSON.parse(JSON.stringify(first));
    expect(sanitize(first)).toEqual(snapshot);
  });
});
