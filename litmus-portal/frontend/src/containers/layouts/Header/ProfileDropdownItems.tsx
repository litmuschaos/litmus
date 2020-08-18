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
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import config from '../../../config';
import { Project, ProjectsCallBackType } from '../../../models/header';
import useActions from '../../../redux/actions';
import * as UserActions from '../../../redux/actions/user';
import { RootState } from '../../../redux/reducers';
import ProjectListItem from './ProjectListItem';
import useStyles from './styles';

interface ProfileInfoDropdownItemProps {
  anchorEl: HTMLElement;
  isOpen: boolean;
  onClose: () => void;
  name: string;
  email: string;
  projects: Project[];
  selectedProjectID: string;
  CallbackToSetSelectedProjectIDOnProfileDropdown: ProjectsCallBackType;
}

function ProfileInfoDropdownItems(props: ProfileInfoDropdownItemProps) {
  const user = useActions(UserActions);
  const {
    anchorEl,
    isOpen,
    onClose,
    name,
    email,
    projects,
    selectedProjectID,
    CallbackToSetSelectedProjectIDOnProfileDropdown,
  } = props;

  const classes = useStyles();

  const id = isOpen ? 'profile-popover' : undefined;

  let initials = ' ';

  if (name) {
    const nameArray = name.split(' ');

    initials =
      nameArray[0][0].toUpperCase() +
      nameArray[nameArray.length - 1][0].toUpperCase();
  }

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

  const CallbackFromProjectListItem = (selectedProjectIDFromList: any) => {
    CallbackToSetSelectedProjectIDOnProfileDropdown(selectedProjectIDFromList);
  };

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
        style={{ marginTop: 17 }}
      >
        <div className={classes.container}>
          {name ? (
            <Avatar
              alt={initials}
              className={classes.avatarBackground}
              style={{ alignContent: 'right', marginBottom: 8 }}
            >
              {initials}
            </Avatar>
          ) : (
            <Avatar
              alt="User"
              className={classes.avatarBackground}
              style={{ alignContent: 'right', marginBottom: 8 }}
            />
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
              classes={{ root: classes.buttonEditProfile }}
            >
              Edit Profile
            </Button>
          </div>
        </div>
        <Divider className={classes.dividerTop} />
        <List dense className={classes.tabContainerProfileDropdownItem}>
          {projects.length === 0 ? (
            <ListItem>
              <ListItemText>
                You haven&apos;t created any projects yet.
              </ListItemText>
            </ListItem>
          ) : (
            projects.map((element: any, index: any) => (
              <ProjectListItem
                key={index}
                project={element}
                divider={index !== projects.length - 1}
                selectedProjectID={selectedProjectID}
                callbackToSetActiveProjectID={CallbackFromProjectListItem}
              />
            ))
          )}
        </List>
        <Divider className={classes.dividerBottom} />
        <div className={classes.bar}>
          <Button
            disabled={loggedOut}
            variant="outlined"
            size="small"
            onClick={logOut}
            classes={{ root: classes.buttonSignout }}
          >
            Log out
          </Button>
        </div>
      </Popover>
    </div>
  );
}

export default ProfileInfoDropdownItems;
