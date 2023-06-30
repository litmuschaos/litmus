import { v4 as uuid } from 'uuid';

export function getHash(hashLength?: number, prefix?: string): string {
  let hashSuffix;
  if (!hashLength) hashSuffix = uuid();
  else if (hashLength <= 8) hashSuffix = (+new Date()).toString(36).slice(-hashLength);
  else hashSuffix = uuid().replace(/-/g, '').slice(0, hashLength);

  return prefix ? prefix + '-' + hashSuffix : hashSuffix;
}
