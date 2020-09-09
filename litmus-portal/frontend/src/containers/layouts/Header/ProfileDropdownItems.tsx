/* eslint-disable react/no-array-index-key */
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
import { useSelector } from 'react-redux';
import config from '../../../config';
import { ProjectsCallBackType } from '../../../models/header';
import useActions from '../../../redux/actions';
import * as UserActions from '../../../redux/actions/user';
import { RootState } from '../../../redux/reducers';
import ProjectListItem from './ProjectListItem';
import useStyles from './styles';
import { Member, Project } from '../../../models/project';
import userAvatar from '../../../utils/user';

interface ProfileInfoDropdownItemProps {
  anchorEl: HTMLElement;
  isOpen: boolean;
  onClose: () => void;
  name: string;
  email: string;
  username: string;
  projects: Project[];
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
  projects,
  selectedProjectID,
  CallbackToSetSelectedProjectIDOnProfileDropdown,
}) => {
  const classes = useStyles();
  const user = useActions(UserActions);
  const id = isOpen ? 'profile-popover' : undefined;
  const nameSplit = name.split(' ');
  const initials = nameSplit[1]
    ? userAvatar(name, false)
    : userAvatar(name, true);
  const [switchableProjects, setSwitchableProjects] = useState<Project[]>(
    projects
  );
  const [loggedOut, doLogout] = useState(false);
  const { userData } = useSelector((state: RootState) => state);

  const logOut = () => {
    doLogout(true);
    user.userLogout();

    fetch(`${config.auth.url}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userData.token}`,
      },
    })
      .then((response) => {
        response.json();
      })

      .catch((err) => {
        console.error(err);
      });
  };

  const editProfile = () => {};

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
  }, []);

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
              className={classes.userName}
              component="span"
              color="textPrimary"
            >
              {name}
            </Typography>
            <Typography
              className={classes.userEmail}
              variant="body1"
              component="span"
              color="textSecondary"
            >
              {email}
            </Typography>

            <Button
              variant="outlined"
              size="small"
              onClick={editProfile}
              className={classes.buttonEditProfile}
            >
              Edit Profile
            </Button>

            <Button
              disabled={loggedOut}
              size="small"
              onClick={logOut}
              className={classes.buttonSignout}
            >
              Log out
            </Button>
          </div>
        </div>
        <Divider className={classes.dividerTop} />
        <List dense className={classes.tabContainerProfileDropdownItem}>
          {switchableProjects.length === 0 ? (
            <ListItem>
              <ListItemText>
                You haven&apos;t created any projects yet.
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
