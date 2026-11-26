import { sanitize } from '../data';

describe('sanitize', () => {
  test('removes empty strings from arrays instead of leaving holes', () => {
    const result = sanitize({ args: ['-c', '', 'echo hi'] });

    expect(result.args).toEqual(['-c', 'echo hi']);
    expect(JSON.stringify(result)).toBe('{"args":["-c","echo hi"]}');
  });

  test('removes null and undefined array items without leaving holes', () => {
    expect(sanitize({ list: [null, 'a', undefined, 'b'] }).list).toEqual(['a', 'b']);
  });

  test('removes arrays and objects that only contained empty values', () => {
    expect(sanitize({ args: [''], labels: { team: '' }, name: 'demo' })).toEqual({ name: 'demo' });
  });

  test('cleans objects inside arrays', () => {
    expect(sanitize({ env: [{ name: 'A', value: '' }, { value: '' }] })).toEqual({ env: [{ name: 'A' }] });
  });

  test('keeps empty values when the config says so', () => {
    expect(
      sanitize(
        { args: ['', 'x'], labels: {}, list: [] },
        { removeEmptyString: false, removeEmptyArray: false, removeEmptyObject: false }
      )
    ).toEqual({ args: ['', 'x'], labels: {}, list: [] });
  });
});
