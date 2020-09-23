import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import * as React from 'react';
import { Link } from 'react-router-dom';
import capitalize from '../../utils/capitalize';
import useStyles from './styles';

interface CustomBreadcrumbsProps {
  location: string;
}

const CustomBreadcrumbs: React.FC<CustomBreadcrumbsProps> = ({ location }) => {
  const pathname: string[] = location.split('/');
  let intermediateRoutes = '/';
  const classes = useStyles();

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {pathname.map((path) => {
        if (path) {
          intermediateRoutes += path;
          // If Template/Workflow Name is clicked [Workflow / Workflow-name / Template]
          // it would redirect to /workflows
          if (pathname[2] === 'template' && path === pathname[3]) {
            return <span>{path}</span>;
          }
          const link = (
            <Link
              key={path}
              to={intermediateRoutes}
              className={classes.breadCrumb}
            >
              {capitalize(path)}
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
