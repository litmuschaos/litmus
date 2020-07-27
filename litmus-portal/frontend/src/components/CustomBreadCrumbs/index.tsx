import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import * as React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStyles from './styles';
import { history } from '../../redux/configureStore';

interface CustomBreadcrumbsProps {
  location: string;
}

const CustomBreadcrumbs: React.FC<CustomBreadcrumbsProps> = ({ location }) => {
  const path: string[] = location.split('/');

  let intermediatRoutes: string = '/';

  const classes = useStyles();

  useEffect(() => {}, [path]);

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {path.map((path: string) => {
        if (path) {
          intermediatRoutes += path;

          const link = (
            <Link
              to={intermediatRoutes}
              className={classes.breadCrumb}
              onClick={() => {
                history.push(`/${path}`);
              }}
            >
              {path.charAt(0).toUpperCase() + path.slice(1)}
            </Link>
          );

          intermediatRoutes += '/';

          return link;
        }

        return '';
      })}
    </Breadcrumbs>
  );
};

export default CustomBreadcrumbs;
