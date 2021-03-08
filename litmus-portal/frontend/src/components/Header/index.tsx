import { useQuery } from '@apollo/client';
import { Divider } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import React from 'react';
import { GET_USER } from '../../graphql';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
  Project,
} from '../../models/graphql/user';
import { getUsername } from '../../utils/auth';
import useStyles from './styles';

interface SelectedProjectDetails {
  selectedProjectID: string;
  selectedProjectName: string;
  selectedUserRole: string;
}

interface ParamType {
  projectID: string;
}

const Header: React.FC = () => {
  const classes = useStyles();

  //Get present user's username from JWT using auth utility
  const username = getUsername();
  // Query to get user details
  const { data } = useQuery<CurrentUserDetails, CurrentUserDedtailsVars>(
    GET_USER,
    { variables: { username: username } }
  );
  const name: string = data?.getUser.name ?? '';
  const email: string = data?.getUser.email ?? '';
  const projects: Project[] = data?.getUser.projects ?? [];

  return (
    <div data-cy="headerComponent">
      <AppBar className={classes.appBar}>
        <Toolbar style={{ background: '#00000' }}>
          <div>Hello world</div>
        </Toolbar>
        <Divider />
      </AppBar>
    </div>
  );
};

export default Header;
