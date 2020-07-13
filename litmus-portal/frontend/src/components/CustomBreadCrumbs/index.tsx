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
      <Link to="/" className={classes.breadCrumb} />
      {path.map((p: string) => {
        if (p) {
          intermediatRoutes += p;
          const link = (
            <Link
              to={intermediatRoutes}
              className={classes.breadCrumb}
              onClick={() => {
                history.push(`/${p}`);
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
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
