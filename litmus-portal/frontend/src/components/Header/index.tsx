import { Typography } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import Breadcrumb from '../BreadCrumbs';
import ProfileDropdown from './ProfileDropDown';
import ProjectDropdown from './ProjectDropDown';
import useStyles from './styles';

const Header: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

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
            <div className={classes.litmusDiv}>
              <img
                src="./icons/litmusPurple.svg"
                alt="litmus logo"
                className={classes.logo}
              />
              <Typography className={classes.litmusHome} variant="body1">
                {t('sidebar.title')}
              </Typography>
            </div>
          </Link>
          <Breadcrumb />
          <ProjectDropdown />
          <ProfileDropdown />
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
