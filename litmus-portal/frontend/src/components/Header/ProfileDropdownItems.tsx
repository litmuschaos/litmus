/* eslint-disable react/no-array-index-key */
import { useQuery } from '@apollo/client';
import {
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import config from '../../config';
import { GET_USER } from '../../graphql';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
  Member,
  Project,
} from '../../models/graphql/user';
import { ProjectsCallBackType } from '../../models/header';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import * as UserActions from '../../redux/actions/user';
import configureStore, { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { getToken } from '../../utils/auth';
import userAvatar from '../../utils/user';
import ProjectListItem from './ProjectListItem';
import useStyles from './styles';

interface ProfileInfoDropdownItemProps {
  anchorEl: HTMLElement;
  isOpen: boolean;
  onClose: () => void;
  name: string;
  email: string;
  username: string;
  selectedProjectID: string;
  CallbackToSetSelectedProjectIDOnProfileDropdown: ProjectsCallBackType;
}

const ProfileInfoDropdownItems: React.FC<ProfileInfoDropdownItemProps> = ({
  anchorEl,
  isOpen,
  onClose,
  name,
  email,
  username,
  selectedProjectID,
  CallbackToSetSelectedProjectIDOnProfileDropdown,
}) => {
  const classes = useStyles();
  const user = useActions(UserActions);
  const tabs = useActions(TabActions);
  const id = isOpen ? 'profile-popover' : undefined;
  const initials = name ? userAvatar(name) : userAvatar(name);
  const { t } = useTranslation();

  // Query to get user details
  const { data } = useQuery<CurrentUserDetails, CurrentUserDedtailsVars>(
    GET_USER,
    { variables: { username } }
  );
  const projects = data?.getUser.projects ?? [];
  const [switchableProjects, setSwitchableProjects] = useState<Project[]>([]);
  const [loggedOut, doLogout] = useState(false);
  const userData = useSelector((state: RootState) => state.userData);
  // Use the persistor object
  const { persistor } = configureStore();

  const logOut = () => {
    tabs.changeWorkflowsTabs(0);
    tabs.changeSettingsTabs(0);
    doLogout(true);

    fetch(`${config.auth.url}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => {
        response.json();
      })

      .catch((err) => {
        console.error(err);
      });
    user.userLogout();
    // Clear data from persistor
    persistor.purge();
  };

  const CallbackFromProjectListItem = (selectedProjectIDFromList: string) => {
    CallbackToSetSelectedProjectIDOnProfileDropdown(selectedProjectIDFromList);
  };

  useEffect(() => {
    const projectsAvailableForSwitching: Project[] = [];
    projects.forEach((project) => {
      const memberList: Member[] = project.members;

      memberList.forEach((member) => {
        if (member.user_name === username && member.invitation === 'Accepted') {
          projectsAvailableForSwitching.push(project);
        }
      });
    });
    setSwitchableProjects(projectsAvailableForSwitching);
  }, [data]);

  return (
    <div>
      <Popover
        id={id}
        open={isOpen}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{
          paper: classes.popover,
        }}
        className={classes.popoverProfileAdjust}
      >
        <div className={classes.container}>
          {name ? (
            <Avatar alt={initials} className={classes.avatarBackground}>
              {initials}
            </Avatar>
          ) : (
            <Avatar alt="User" className={classes.avatarBackground} />
          )}

          <div className={classes.userInfo}>
            <Typography
              data-cy="name-header"
              className={classes.userName}
              component="span"
            >
              {name}
            </Typography>
            <Typography
              data-cy="email-header"
              className={classes.userEmail}
              variant="body1"
              component="span"
              color="textSecondary"
            >
              {email}
            </Typography>

            {userData.userRole === 'Owner' && (
              <Button
                variant="outlined"
                size="small"
                className={classes.buttonEditProfile}
                onClick={() => {
                  tabs.changeSettingsTabs(0);
                  history.push('/settings');
                }}
              >
                {t('header.profileDropdown.editProfile')}
              </Button>
            )}

            <Button
              data-cy="logout"
              disabled={loggedOut}
              size="small"
              onClick={logOut}
              className={classes.buttonSignout}
            >
              {t('header.profileDropdown.logOut')}
            </Button>
          </div>
        </div>
        <Divider className={classes.dividerTop} />
        <List dense className={classes.tabContainerProfileDropdownItem}>
          {switchableProjects.length === 0 ? (
            <ListItem data-cy="project">
              <ListItemText>
                {t('header.profileDropdown.noProjects')}
              </ListItemText>
            </ListItem>
          ) : (
            switchableProjects.map((element: Project, index: number) => (
              <ProjectListItem
                key={index}
                project={element}
                divider={index !== switchableProjects.length - 1}
                selectedProjectID={selectedProjectID}
                callbackToSetActiveProjectID={CallbackFromProjectListItem}
              />
            ))
          )}
        </List>
      </Popover>
    </div>
  );
};

export default ProfileInfoDropdownItems;
