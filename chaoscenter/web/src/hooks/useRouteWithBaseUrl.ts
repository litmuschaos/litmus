import React from 'react';
import { mapValues } from 'lodash-es';
import { type UseRouteDefinitionsProps, paths, normalizePath } from '@routes/RouteDefinitions';
import { useAppStore } from './useAppStore';

/**
 * Routes to be used for routing inside current module
 *
 * @remarks this hook requires paths to be added to {@link paths} for usage
 * @returns normalized path with all path params populated
 * @warning only to be for routing, matching using these paths will break
 *
 */

export function useRouteWithBaseUrl(): UseRouteDefinitionsProps {
  const { renderUrl } = useAppStore();

  return React.useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => mapValues(paths, route => (params?: any) => normalizePath(`${renderUrl}/${route(params)}`)),
    [renderUrl]
  );
}
