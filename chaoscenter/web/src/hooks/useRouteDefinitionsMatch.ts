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

type RouteScope = 'account' | 'project';

export function useRouteDefinitionsMatch(scope?: RouteScope): UseRouteDefinitionsProps {
  const { matchPath } = useAppStore();

  function withProjectID(route: string): string {
    return `/project/:projectID/${route.replace(/^\//, '')}`;
  }

  return React.useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () =>
      mapValues(
        paths,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        route => (params?: any) =>
          normalizePath(`${matchPath}/${scope === 'account' ? route(params) : withProjectID(route(params))}`)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [matchPath]
  );
}
