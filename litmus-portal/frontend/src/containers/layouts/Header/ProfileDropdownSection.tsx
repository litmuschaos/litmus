/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, IconButton } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import React, { useRef, useState } from 'react';
import { ProjectsCallBackType } from '../../../models/header';
import userAvatar from '../../../utils/user';
import ProfileInfoDropdownItems from './ProfileDropdownItems';
import useStyles from './styles';
import { Project } from '../../../models/project';

interface ProfileInfoDropdownSectionProps {
  name: string;
  email: string;
  username: string;
  projects: Project[];
  selectedProjectID: string;
  CallbackToSetSelectedProjectID: ProjectsCallBackType;
  userRole: string;
  selectedProjectName: string;
}

const ProfileDropdownSection: React.FC<ProfileInfoDropdownSectionProps> = ({
  name,
  email,
  username,
  projects,
  selectedProjectID,
  CallbackToSetSelectedProjectID,
  selectedProjectName,
  userRole,
}) => {
  const classes = useStyles();
  const [isProfilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const profileMenuRef = useRef();
  const nameSplit = name.split(' ');
  const initials = nameSplit[1]
    ? userAvatar(name, false)
    : userAvatar(name, true);

  const sendSelectedProjectIDToHeader = (selectedProjectID: string) => {
    CallbackToSetSelectedProjectID(selectedProjectID);
    setProfilePopoverOpen(false);
  };

  return (
    <div>
      <Box display="flex" flexDirection="row">
        <Box p={1}>
          {name ? (
            <Avatar alt={initials} className={classes.avatarBackground}>
              {initials}
            </Avatar>
          ) : (
            <Avatar alt="User" className={classes.avatarBackground} />
          )}
        </Box>

        <Box p={1}>
          <Typography>
            {name}{' '}
            <IconButton
              edge="end"
              ref={profileMenuRef as any}
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={() => setProfilePopoverOpen(true)}
              className={classes.buttonPositionExpand}
            >
              <ExpandMoreTwoToneIcon htmlColor="grey" />
            </IconButton>
          </Typography>

          <Typography className={classes.projectDisplay}>
            {username} . {userRole} . {selectedProjectName}
          </Typography>
        </Box>
      </Box>
      <ProfileInfoDropdownItems
        anchorEl={profileMenuRef.current as any}
        isOpen={isProfilePopoverOpen}
        onClose={() => setProfilePopoverOpen(false)}
        name={name}
        username={username}
        email={email}
        projects={projects}
        selectedProjectID={selectedProjectID}
        CallbackToSetSelectedProjectIDOnProfileDropdown={
          sendSelectedProjectIDToHeader
        }
      />
    </div>
  );
};

export default ProfileDropdownSection;
