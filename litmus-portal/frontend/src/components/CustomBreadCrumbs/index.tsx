import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import NavigateNextIcon from '@material-ui/icons/NavigateNextTwoTone';
import * as React from 'react';
import { Link } from 'react-router-dom';
import useStyles from './styles';

interface CustomBreadcrumbsProps {
  location: string;
}

const CustomBreadcrumbs: React.FC<CustomBreadcrumbsProps> = ({ location }) => {
  const path: string[] = location.split('/');
  let intermediatRoutes: string = '/';
  const classes = useStyles();
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
    >
      <Link to="/" className={classes.breadCrumb}>
        Home
      </Link>
      {path.map((p: string) => {
        if (p) {
          intermediatRoutes += p;
          const link = (
            <Link to={intermediatRoutes} className={classes.breadCrumb}>
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
