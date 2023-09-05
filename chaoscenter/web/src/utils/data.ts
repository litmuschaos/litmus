/**
 * @description This function removes the __typename data field from response object
 * @remarks Use this only and only when when the apollo response is used directly/stringified or put into idb
 */

import type { YamlSanityConfig } from '@components/YAMLBuilder/YAMLBuilderProps';
import { DEFAULT_SANITY_CONFIG } from './JSONUtils';

export function cleanApolloResponse(responseWithTypeName: object): object {
  return JSON.parse(
    JSON.stringify(responseWithTypeName, (name, val) => {
      if (name === '__typename') {
        delete val[name];
      } else {
        return val;
      }
    })
  );
}

export const sanitize = (obj: Record<string, any>, sanityConfig?: YamlSanityConfig): Record<string, any> => {
  const { removeEmptyString, removeEmptyArray, removeEmptyObject } = {
    ...DEFAULT_SANITY_CONFIG,
    ...sanityConfig
  };
  for (const key in obj) {
    if (obj[key] === null || obj[key] === undefined) {
      delete obj[key];
    } else if (removeEmptyString && obj[key] === '') {
      delete obj[key];
    } else if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
      if (removeEmptyObject && Object.keys(obj[key]).length === 0) {
        delete obj[key];
      } else {
        sanitize(obj[key], sanityConfig);
      }
    } else if (Array.isArray(obj[key])) {
      if (removeEmptyArray && obj[key].length == 0) {
        delete obj[key];
      } else {
        sanitize(obj[key], sanityConfig);
      }
    }
  }
  return obj;
};

export const destructure = (nestedObject: any): Record<string, string> => {
  const flattenedObject: Record<string, string> = {};
  for (const key in nestedObject) {
    const value = nestedObject[key];
    const type = typeof value;
    if (['string', 'boolean'].includes(type) || (type === 'number' && !isNaN(value))) {
      flattenedObject[key] = value;
    } else if (type === 'object') {
      Object.assign(flattenedObject, destructure(value));
    }
  }
  return flattenedObject;
};
