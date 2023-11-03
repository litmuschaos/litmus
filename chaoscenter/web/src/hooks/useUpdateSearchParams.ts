import qs from 'qs';
import { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useSearchParams } from 'hooks/useSearchParams';

export function useUpdateSearchParams(): (params: { [key: string]: string }) => void {
  const history = useHistory();
  const { pathname } = useLocation();
  const searchParams = useSearchParams();

  return useCallback(
    (params: { [key: string]: string }): void => {
      const oldSearchParams: { [key: string]: string } = {};
      searchParams.forEach((val, key) => (oldSearchParams[key] = val));
      const path = `${pathname}?${qs.stringify({ ...oldSearchParams, ...params })}`;
      history.replace(path);
    },
    [history, pathname, searchParams]
  );
}
