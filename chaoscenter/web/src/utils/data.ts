/**
 * @description This function removes the __typename data field from response object
 * @remarks Use this only and only when when the apollo response is used directly/stringified or put into idb
 */

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

export function sanitize(obj: object | undefined): object {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => {
      return value === null ? undefined : value;
    })
  );
}

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
