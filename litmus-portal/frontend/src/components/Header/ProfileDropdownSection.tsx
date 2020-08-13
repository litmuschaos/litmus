/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, IconButton } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import React, { useRef, useState } from 'react';
import { Project, ProjectsCallBackType } from '../../models/header';
import userAvatar from '../../utils/user';
import ProfileInfoDropdownItems from './ProfileDropdownItems';
import useStyles from './styles';

interface ProfileInfoDropdownSectionProps {
  name: string;
  email: string;
  username: string;
  projects: Project[];
  selectedProjectID: string;
  CallbackToSetSelectedProjectID: ProjectsCallBackType;
}

const ProfileDropdownSection: React.FC<ProfileInfoDropdownSectionProps> = ({
  name,
  email,
  username,
  projects,
  selectedProjectID,
  CallbackToSetSelectedProjectID,
}) => {
  const classes = useStyles();

  const [isProfilePopoverOpen, setProfilePopoverOpen] = useState(false);

  const profileMenuRef = useRef();
  const initials = userAvatar(name, false);
  const sendSelectedProjectIDToHeader = (selectedProjectID: any) => {
    CallbackToSetSelectedProjectID(selectedProjectID);
    setProfilePopoverOpen(false);
  };

  return (
    <div>
      <Box display="flex" flexDirection="row">
        <Box p={1}>
          {name ? (
            <Avatar
              alt={initials}
              className={classes.avatarBackground}
              style={{ alignContent: 'right' }}
            >
              {initials}
            </Avatar>
          ) : (
            <Avatar
              alt="User"
              className={classes.avatarBackground}
              style={{ alignContent: 'right' }}
            />
          )}
        </Box>

        <Box p={1}>
          <Typography>{name}</Typography>

          <Typography
            style={{
              fontSize: 12,
              color: 'grey',
            }}
          >
            {username}
          </Typography>
        </Box>

        <Box p={1}>
          <IconButton
            edge="end"
            ref={profileMenuRef as any}
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={() => setProfilePopoverOpen(true)}
            style={{ alignContent: 'left' }}
          >
            <ExpandMoreTwoToneIcon htmlColor="grey" />
          </IconButton>
        </Box>
      </Box>
      <ProfileInfoDropdownItems
        anchorEl={profileMenuRef.current as any}
        isOpen={isProfilePopoverOpen}
        onClose={() => setProfilePopoverOpen(false)}
        name={name}
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
