import type { YamlSanityConfig } from '@components/YAMLBuilder/YAMLBuilderProps';

export const DEFAULT_SANITY_CONFIG = {
  removeEmptyString: true,
  removeEmptyArray: true,
  removeEmptyObject: true
};

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
