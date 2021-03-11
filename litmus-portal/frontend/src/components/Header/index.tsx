import { useQuery } from '@apollo/client';
import { Box, Divider } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { GET_USER } from '../../graphql';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
  Member,
  Project,
} from '../../models/graphql/user';
import useActions from '../../redux/actions';
import * as UserActions from '../../redux/actions/user';
import configureStore, { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import CustomBreadCrumbs from '../BreadCrumbs';
import ProfileDropdownSection from './ProfileDropdownSection';
import useStyles from './styles';

interface SelectedProjectDetails {
  selectedProjectID: string;
  selectedProjectName: string;
  selectedUserRole: string;
}

const Header: React.FC = () => {
  const classes = useStyles();
  const userData = useSelector((state: RootState) => state.userData);
  const user = useActions(UserActions);
  // Use the persistor object
  const { persistor } = configureStore();

  // Query to get user details
  const { data } = useQuery<CurrentUserDetails, CurrentUserDedtailsVars>(
    GET_USER,
    { variables: { username: userData.username } }
  );
  const name: string = data?.getUser.name ?? '';
  const email: string = data?.getUser.email ?? '';
  const projects: Project[] = data?.getUser.projects ?? [];

  const [selectedProjectDetails, setSelectedProjectDetails] = useState<
    SelectedProjectDetails
  >({
    selectedProjectID: userData.selectedProjectID,
    selectedProjectName: userData.selectedProjectName,
    selectedUserRole: userData.userRole,
  });

  const setSelectedProjectID = (selectedProjectID: string) => {
    projects.forEach((project) => {
      if (selectedProjectID === project.id) {
        const memberList: Member[] = project.members;

        memberList.forEach((member) => {
          if (member.role === 'Owner') {
            user.updateUserDetails({
              selectedProjectOwner: member.user_name,
            });
          }

          if (member.user_name === data?.getUser.username) {
            user.updateUserDetails({
              selectedProjectID,
              userRole: member.role,
              selectedProjectName: project.name,
            });
            // Flush data to persistor immediately
            persistor.flush();

            setSelectedProjectDetails({
              selectedProjectID,
              selectedUserRole: member.role,
              selectedProjectName: project.name,
            });

            if (member.role !== 'Owner') {
              history.push('/');
            }
          }
        });
      }
    });
  };

  useEffect(() => {
    setSelectedProjectDetails({
      selectedProjectID: userData.selectedProjectID,
      selectedProjectName: userData.selectedProjectName,
      selectedUserRole: userData.userRole,
    });
  }, [userData.selectedProjectID]);

  return (
    <div data-cy="headerComponent">
      <AppBar position="relative" className={classes.appBar} elevation={0}>
        <Toolbar>
          <div style={{ width: '100%' }}>
            <Box display="flex" p={1} className={classes.headerFlex}>
              <Box p={1} flexGrow={8} className={classes.headerFlexExtraPadded}>
                <CustomBreadCrumbs location={useLocation().pathname} />
              </Box>
              <Box p={1} className={classes.headerFlexPadded}>
                {/*              <NotificationsDropdown
                  count={`${countOfMessages}`}
                  messages={messages}
                  CallbackToHeaderOnDeleteNotification={deleteNotification}
                />
  */}
              </Box>
              <Box p={1} flexGrow={1} className={classes.headerFlexProfile}>
                <ProfileDropdownSection
                  name={name}
                  email={email}
                  username={userData.username}
                  selectedProjectID={selectedProjectDetails.selectedProjectID}
                  CallbackToSetSelectedProjectID={setSelectedProjectID}
                  selectedProjectName={
                    selectedProjectDetails.selectedProjectName
                  }
                  userRole={selectedProjectDetails.selectedUserRole}
                />
              </Box>
            </Box>
          </div>
        </Toolbar>
        <Divider />
      </AppBar>
    </div>
  );
};

export default Header;
