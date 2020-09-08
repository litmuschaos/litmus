import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import * as React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { history } from '../../redux/configureStore';
import useStyles from './styles';

interface CustomBreadcrumbsProps {
  location: string;
}

const CustomBreadcrumbs: React.FC<CustomBreadcrumbsProps> = ({ location }) => {
  const path: string[] = location.split('/');

  let intermediateRoutes: string = '/';

  const classes = useStyles();

  useEffect(() => {}, [path]);

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {path.map((path: string) => {
        if (path) {
          intermediateRoutes += path;

          const link = (
            <Link
              key={path}
              to={intermediateRoutes}
              className={classes.breadCrumb}
              onClick={() => {
                history.push(`/${path}`);
              }}
            >
              {path.charAt(0).toUpperCase() + path.slice(1)}
            </Link>
          );

          intermediateRoutes += '/';

          return link;
        }

        return '';
      })}
    </Breadcrumbs>
  );
};

export default CustomBreadcrumbs;
