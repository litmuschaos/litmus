import { Typography } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import React from 'react';
import { Link } from 'react-router-dom';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import ProfileDropdown from './ProfileDropDown';
import ProjectDropdown from './ProjectDropDown';
import useStyles from './styles';

const Header: React.FC = () => {
  const classes = useStyles();

  // Get selected projectID from the URL
  const projectID = getProjectID();
  // Set projectRole
  const projectRole = getProjectRole();

  return (
    <div data-cy="headerComponent">
      <AppBar className={classes.appBar}>
        <Toolbar disableGutters className={classes.toolBar}>
          {/* Litmus Logo */}
          <Link
            to={{
              pathname: '/home',
              search: `?projectID=${projectID}&projectRole=${projectRole}`,
            }}
            className={classes.homeLink}
          >
            <Typography className={classes.chaosText} variant="body1">
              Chaos Center
            </Typography>
          </Link>
          <div className={classes.details}>
            <ProjectDropdown />
            <ProfileDropdown />
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
