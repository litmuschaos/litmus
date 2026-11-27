import { PROBE_DURATION_REGEX } from '../validation';

describe('PROBE_DURATION_REGEX', () => {
  test('accepts an empty value', () => {
    expect(PROBE_DURATION_REGEX.test('')).toBe(true);
  });

  test.each(['10ns', '10us', '10µs', '10μs', '500ms', '10s', '5m', '1h'])('accepts a single unit: %s', value => {
    expect(PROBE_DURATION_REGEX.test(value)).toBe(true);
  });

  test.each(['1m30s', '2h45m', '1h0m0s', '1s500ms'])('accepts combined units like Go time.ParseDuration: %s', value => {
    expect(PROBE_DURATION_REGEX.test(value)).toBe(true);
  });

  test.each(['1.5h', '0.5s', '2.25m'])('accepts decimal values like Go time.ParseDuration: %s', value => {
    expect(PROBE_DURATION_REGEX.test(value)).toBe(true);
  });

  test.each(['10', 's', '10 s', '10sec', '1d', '-5s', '1.s', '1m30', 'abc'])('rejects invalid durations: %s', value => {
    expect(PROBE_DURATION_REGEX.test(value)).toBe(false);
  });
});
