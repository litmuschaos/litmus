import type { ProbeObj } from '@api/entities';

function sameAttachment(probe: ProbeObj, target: ProbeObj): boolean {
  return probe.name === target.name && probe.mode === target.mode;
}

// Adds a probe to a fault, or replaces the mode of a probe that is already attached.
// The same probe name can be attached more than once when the modes differ.
export function updateAttachedProbes(
  probes: ProbeObj[] | undefined,
  next: ProbeObj,
  previous?: ProbeObj
): { probes: ProbeObj[]; duplicate: boolean } {
  const list = [...(probes ?? [])];
  const currentIndex = previous ? list.findIndex(probe => sameAttachment(probe, previous)) : -1;
  const duplicate = list.some((probe, index) => index !== currentIndex && sameAttachment(probe, next));

  if (duplicate) {
    return { probes: list, duplicate: true };
  }

  if (currentIndex >= 0) {
    list[currentIndex] = next;
    return { probes: list, duplicate: false };
  }

  list.push(next);
  return { probes: list, duplicate: false };
}

export function removeAttachedProbe(probes: ProbeObj[] | undefined, target: ProbeObj): ProbeObj[] {
  return (probes ?? []).filter(probe => !sameAttachment(probe, target));
}
