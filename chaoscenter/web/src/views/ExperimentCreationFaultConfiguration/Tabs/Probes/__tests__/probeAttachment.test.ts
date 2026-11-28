import { Mode, type ProbeObj } from '@api/entities';
import { removeAttachedProbe, updateAttachedProbes } from '../probeAttachment';

const httpSot: ProbeObj = { name: 'http-check', mode: Mode.SoT };
const httpEot: ProbeObj = { name: 'http-check', mode: Mode.EoT };
const cmdSot: ProbeObj = { name: 'cmd-check', mode: Mode.SoT };

describe('updateAttachedProbes', () => {
  test('adds a probe when the fault has none', () => {
    expect(updateAttachedProbes(undefined, httpSot)).toEqual({ probes: [httpSot], duplicate: false });
  });

  test('allows the same probe name in a different mode', () => {
    expect(updateAttachedProbes([httpSot], httpEot)).toEqual({
      probes: [httpSot, httpEot],
      duplicate: false
    });
  });

  test('rejects a probe that is already attached in that mode', () => {
    expect(updateAttachedProbes([httpSot, cmdSot], httpSot)).toEqual({
      probes: [httpSot, cmdSot],
      duplicate: true
    });
  });

  test('changes the mode of one attached probe and leaves the others in place', () => {
    expect(updateAttachedProbes([httpSot, cmdSot], httpEot, httpSot)).toEqual({
      probes: [httpEot, cmdSot],
      duplicate: false
    });
  });

  test('does not treat the probe being edited as a duplicate of its new mode', () => {
    expect(updateAttachedProbes([httpSot], { ...httpSot }, httpSot).duplicate).toBe(false);
  });

  test('rejects a mode that another copy of the same probe already uses', () => {
    expect(updateAttachedProbes([httpSot, httpEot], httpEot, httpSot)).toEqual({
      probes: [httpSot, httpEot],
      duplicate: true
    });
  });
});

describe('removeAttachedProbe', () => {
  test('removes only the probe with the matching name and mode', () => {
    expect(removeAttachedProbe([httpSot, httpEot, cmdSot], httpSot)).toEqual([httpEot, cmdSot]);
  });
});
