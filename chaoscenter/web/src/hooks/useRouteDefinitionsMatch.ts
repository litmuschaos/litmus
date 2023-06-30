import React from 'react';
import { mapValues } from 'lodash-es';
import { type UseRouteDefinitionsProps, paths, normalizePath } from '@routes/RouteDefinitions';
import { useAppStore } from './useAppStore';

/**
 * Routes to be used for matching in react router
 *
 * @remarks this hook requires paths to be added to {@link paths} for usage
 * @returns normalized path with path params populated as query params for matching
 * @warning only to be for matching, routing using these paths will break
 *
 */

export function useRouteDefinitionsMatch(): UseRouteDefinitionsProps {
  const { matchPath } = useAppStore();

  return React.useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => mapValues(paths, route => (params?: any) => normalizePath(`${matchPath}/${route(params)}`)),
    [matchPath]
  );
}
