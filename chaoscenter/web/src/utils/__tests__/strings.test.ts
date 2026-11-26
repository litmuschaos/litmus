import { replaceHyphen, replaceSpace } from '../strings';

describe('replaceHyphen', () => {
  test('replaces every hyphen, not only the first one', () => {
    expect(replaceHyphen('pod-network-latency')).toBe('pod network latency');
  });

  test('leaves strings without hyphens unchanged', () => {
    expect(replaceHyphen('pod delete')).toBe('pod delete');
  });
});

// Same matching as the fault search in ExperimentCreationChaosFaults
const matchesSearch = (faultName: string, searchTerm: string): boolean =>
  replaceHyphen(replaceSpace(faultName))
    .toLowerCase()
    .includes(replaceHyphen(replaceSpace(searchTerm)).toLowerCase());

describe('fault search matching', () => {
  test('finds a fault by the words of its name', () => {
    expect(matchesSearch('pod-network-latency', 'network latency')).toBe(true);
    expect(matchesSearch('pod-network-latency', 'Pod Network Latency')).toBe(true);
    expect(matchesSearch('node-cpu-hog', 'cpu hog')).toBe(true);
  });

  test('still finds a fault by its exact name', () => {
    expect(matchesSearch('pod-network-latency', 'pod-network-latency')).toBe(true);
  });

  test('does not match other faults', () => {
    expect(matchesSearch('pod-delete', 'network latency')).toBe(false);
  });
});
