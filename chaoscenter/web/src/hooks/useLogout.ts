import { useHistory } from 'react-router-dom';
import { paths } from '@routes/RouteDefinitions';
import config from '@config';
import useRequest from '@api/useRequest';

interface UseLogoutReturn {
  forceLogout: () => void;
}

export const useLogout = (): UseLogoutReturn => {
  const history = useHistory();

  const forceLogout = (): void => {
      useRequest({
          baseURL: config.restEndpoints?.authUri,
          url: `/logout`,
          method: 'POST'
      });
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('projectID');
      history.push(paths.toLogin());
  };

  return { forceLogout };
};
