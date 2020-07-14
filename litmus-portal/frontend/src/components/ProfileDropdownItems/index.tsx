/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react';
import { withStyles, createStyles, Theme } from '@material-ui/core/styles';
import {
  Popover,
  Typography,
  Avatar,
  Divider,
  Button,
  Badge,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import CameraAltOutlinedIcon from '@material-ui/icons/CameraAltOutlined';
import ProjectListItem from '../ProjectListItem';
import useStyles from './styles';

const SmallAvatar = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 24,
      height: 24,
      border: `3px solid ${theme.palette.background.paper}`,
    },
  })
)(Avatar);

interface ProfileInfoDropdownProps {
  anchorEl: any;
  isOpen: any;
  onClose: any;
  name: any;
  email: any;
  projects: any;
}

function ProfileInfoDropdownItems(props: ProfileInfoDropdownProps) {
  const { anchorEl, isOpen, onClose, name, email, projects } = props;

  const classes = useStyles();

  const id = isOpen ? 'profile-popover' : undefined;

  const [userName, userEmail] = [name, email];

  const [loading, doLogout] = useState(false);

  const logOut = () => {
    doLogout(true);
  };

  const editProfile = () => {};

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
      >
        <div className={classes.container}>
          <Badge
            overlap="circle"
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            className={classes.badgeStyle}
            badgeContent={
              <SmallAvatar>
                <CameraAltOutlinedIcon
                  style={{
                    backgroundColor: '#FFF',
                    color: 'grey',
                  }}
                />
              </SmallAvatar>
            }
          >
            <Avatar
              className={classes.avatar}
              alt={name}
              src="temp/RichardHill.jpg"
            />
          </Badge>

          <div className={classes.userInfo}>
            <Typography
              className={classes.userName}
              component="span"
              color="textPrimary"
            >
              {userName}
            </Typography>
            <Typography
              className={classes.userEmail}
              variant="body1"
              component="span"
              color="textSecondary"
            >
              {userEmail}
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
        <List dense className={classes.tabContainer}>
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
              />
            ))
          )}
        </List>
        <Divider className={classes.dividerBottom} />
        <div className={classes.bar}>
          <Button
            disabled={loading}
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
