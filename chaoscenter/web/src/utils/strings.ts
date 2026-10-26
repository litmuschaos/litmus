import { ExperimentRunFaultStatus, ExperimentRunStatus } from '@api/entities';

export function trimString(string: string, length: number): string {
  return string.length > length ? `${string.substring(0, length)}...` : string;
}

export function capitalize(str: string): string {
  return str.replace(/^\w/, c => c.toUpperCase());
}

export function replaceHyphen(str: string): string {
  return str.replace('-', ' ');
}

export function replaceSpace(str: string): string {
  return str.replace(/\s\s+/g, ' ');
}

export function normalize(str: string): string {
  const words = str.split('-');
  const firstWord = capitalize(words[0]);
  let remainingWords = '';
  for (let index = 1; index < words.length; index++) {
    remainingWords += words[index] + ' ';
  }

  return firstWord + ' ' + remainingWords;
}

export function toTitleCase({
  text,
  separator,
  noCasing
}: {
  text: string;
  separator: string;
  noCasing?: boolean;
}): string {
  const string = text.split(separator);
  const result = [];
  for (const letter of string) {
    noCasing
      ? result.push(letter.charAt(0).toLowerCase() + letter.slice(1).toLowerCase())
      : result.push(letter.charAt(0).toUpperCase() + letter.slice(1).toLowerCase());
  }
  return result.join(' ');
}

export function phaseToUI(phase: string): string {
  if (phase === 'NA') {
    return 'N/A';
  } else if (
    phase === ExperimentRunStatus.COMPLETED_WITH_PROBE_FAILURE ||
    phase === ExperimentRunStatus.COMPLETED_WITH_ERROR ||
    phase === ExperimentRunFaultStatus.COMPLETED_WITH_PROBE_FAILURE ||
    phase === ExperimentRunFaultStatus.COMPLETED_WITH_ERROR
  )
    return ExperimentRunStatus.COMPLETED.toUpperCase();
  else return phase?.replace(/_/g, ' ').toUpperCase();
}

export function toSentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
