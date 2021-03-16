import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import * as React from 'react';
import { Link } from 'react-router-dom';
import capitalize from '../../utils/capitalize';
import useStyles from './styles';

const Breadcrumb: React.FC = () => {
  const pathname: string[] = window.location.pathname.split('/');
  let intermediateRoutes = '/';
  const classes = useStyles();

  return (
    <Breadcrumbs className={classes.breadCrumb}>
      {pathname.map((path) => {
        if (path) {
          intermediateRoutes += path;
          // If Template/Workflow Name is clicked [Workflow / Workflow-name / Template]
          // it would redirect to /workflows
          if (pathname[2] === 'template' && path === pathname[3]) {
            return <span key="path">{path}</span>;
          }
          if (
            pathname[2] === 'schedule' &&
            (path === pathname[3] || path === pathname[4])
          ) {
            return <span key="schedule">{path}</span>;
          }
          const link = (
            <Link key={path} to={intermediateRoutes}>
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

export default Breadcrumb;
