import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import React from 'react';
import Breadcrumb from '../BreadCrumbs';
import ProfileDropdown from './profileDropDown';
import ProjectDropdown from './projectDropDown';
import useStyles from './styles';

const Header: React.FC = () => {
  const classes = useStyles();

  return (
    <div data-cy="headerComponent">
      <AppBar className={classes.appBar}>
        <Toolbar disableGutters className={classes.toolBar}>
          <Breadcrumb />
          <ProjectDropdown />
          <ProfileDropdown />
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
