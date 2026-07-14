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
