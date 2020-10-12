import { Box, IconButton } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import React, { useRef, useState } from 'react';
import { ProjectsCallBackType } from '../../models/header';
import userAvatar from '../../utils/user';
import ProfileInfoDropdownItems from './ProfileDropdownItems';
import useStyles from './styles';

interface ProfileInfoDropdownSectionProps {
  name: string;
  email: string;
  username: string;
  selectedProjectID: string;
  CallbackToSetSelectedProjectID: ProjectsCallBackType;
  userRole: string;
  selectedProjectName: string;
}

const ProfileDropdownSection: React.FC<ProfileInfoDropdownSectionProps> = ({
  name,
  email,
  username,
  selectedProjectID,
  CallbackToSetSelectedProjectID,
  selectedProjectName,
  userRole,
}) => {
  const classes = useStyles();
  const [isProfilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const profileMenuRef = useRef<HTMLButtonElement>(null);
  const initials = name ? userAvatar(name) : userAvatar(name);

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
          <Typography data-cy="full-name">
            {name}{' '}
            <IconButton
              data-cy="header-dropdown"
              edge="end"
              ref={profileMenuRef}
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
        anchorEl={profileMenuRef.current as HTMLElement}
        isOpen={isProfilePopoverOpen}
        onClose={() => setProfilePopoverOpen(false)}
        name={name}
        username={username}
        email={email}
        selectedProjectID={selectedProjectID}
        CallbackToSetSelectedProjectIDOnProfileDropdown={
          sendSelectedProjectIDToHeader
        }
      />
    </div>
  );
};

export default ProfileDropdownSection;
