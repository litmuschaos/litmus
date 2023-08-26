import { useHistory } from 'react-router-dom';
import { paths } from '@routes/RouteDefinitions';
import { useLogoutMutation } from '@api/auth';

interface UseLogoutReturn {
  forceLogout: () => void;
}

export const useLogout = (): UseLogoutReturn => {
  const history = useHistory();
  const { mutate: handleLogout } = useLogoutMutation(
    {},
    {
      onSettled: _ => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('projectRole');
        localStorage.removeItem('projectID');
        history.push(paths.toLogin());
      },
      retry: false
    }
  );
  const forceLogout = (): void => {
    handleLogout({ body: {} });
  };
  return { forceLogout };
};
