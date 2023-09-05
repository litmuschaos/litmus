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
