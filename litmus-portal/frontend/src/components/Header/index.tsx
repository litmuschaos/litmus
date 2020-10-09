import { useQuery } from '@apollo/client';
import { Box, Divider } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { GET_USER } from '../../graphql';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
  Member,
  Project,
} from '../../models/graphql/user';
import { Message, NotificationIds } from '../../models/header';
import useActions from '../../redux/actions';
import * as UserActions from '../../redux/actions/user';
import configureStore, { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import CustomBreadCrumbs from '../BreadCrumbs';
import NotificationsDropdown from './NotificationDropdown';
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

  // Fetch and Set Notifications from backend.

  const [messages, setMessages] = useState<Message[]>([]);

  const [countOfMessages, setCountOfMessages] = useState(0);

  const fetchRandomMessages = useCallback(() => {
    const messages = [];

    const notificationsList = [
      {
        id: '1',
        messageType: 'Pod Delete workflow',
        Message: 'complete',
        generatedTime: '',
      },
      {
        id: '2',
        messageType: 'Argo Chaos workflow',
        Message: 'started started',
        generatedTime: '',
      },
      {
        id: '3',
        messageType: 'New',
        Message: 'crashed',
        generatedTime: '',
      },
    ];

    const iterations = notificationsList.length;

    const oneDaySeconds = 60 * 60 * 24;

    let curUnix = Math.round(
      new Date().getTime() / 1000 - iterations * oneDaySeconds
    );

    for (let i = 0; i < iterations; i += 1) {
      const notificationItem = notificationsList[i];
      const message = {
        sequenceID: (i as unknown) as string,
        id: notificationItem.id,
        messageType: notificationItem.messageType,
        date: curUnix,
        text: `${notificationItem.messageType}- ${notificationItem.Message}`,
      };
      curUnix += oneDaySeconds;
      messages.push(message);
    }
    messages.reverse();
    setMessages(messages);
  }, [setMessages]);

  const deleteNotification = (notificationIDs: NotificationIds) => {
    for (let i = 0; i < messages.length; i += 1) {
      if (messages[i].sequenceID === notificationIDs.sequenceID) {
        if (i > -1) {
          messages.splice(i, 1);
        }
      }
    }

    // send POST request with #notificationIDs.id to update db with notification
    // id marked as disissed from active or persist it in redux or cookie.
    setMessages(messages);
    setCountOfMessages(messages.length);
  };

  useEffect(() => {
    fetchRandomMessages();
  }, [fetchRandomMessages]);

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
                <NotificationsDropdown
                  count={`${countOfMessages}`}
                  messages={messages}
                  CallbackToHeaderOnDeleteNotification={deleteNotification}
                />
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
