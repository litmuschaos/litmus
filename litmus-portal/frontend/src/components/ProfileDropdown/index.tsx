/* eslint-disable @typescript-eslint/no-unused-vars */
import { Grid, IconButton } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { UserData } from '../../models/user';
import { RootState } from '../../redux/reducers';
import ProfileInfoDropdownItems from '../ProfileDropdownItems';
import useStyles from './styles';

const ProfileDropdown = ({ callbackFromParent }: any) => {
  const userData: UserData = useSelector((state: RootState) => state.userData);
  const { name, email, username } = userData;

  const classes = useStyles();

  const [projects, setProjects] = useState([]);

  const fetchRandomProjects = useCallback(() => {
    const projects = [];

    const projectsList = [
      {
        projectName: 'FlashProjectCL1',
        statusActive: 'false',
        id: '0',
      },
    ];

    const iterations = projectsList.length;

    for (let i = 0; i < iterations; i += 1) {
      const projectItem = projectsList[i];
      const project = {
        id: projectItem.id,
        projectName: projectItem.projectName,
        statusActive: projectItem.statusActive,
      };
      projects.push(project);
    }
    projects.reverse();
    setProjects(projects as any);
  }, [setProjects]);

  const menuId = 'primary-search-account-menu';

  const [isProfilePopoverOpen, setProfilePopoverOpen] = useState(false);

  const profileMenuRef = useRef();

  const node = useRef();

  const handleClick = (e: any) => {
    if ((node.current as any).contains(e.target)) {
      callbackFromParent(true);
      return;
    }
    callbackFromParent(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  useEffect(() => {
    fetchRandomProjects();
  }, []);

  return (
    <div className={classes.dropDown}>
      <Grid container ref={node as any} spacing={1}>
        <Grid item xs={2} sm={2} />
        <Grid item xs={2} style={{ alignItems: 'right' }} sm={2}>
          <div>
            <Avatar
              alt={name || 'User'}
              src="temp/RichardHill.jpg"
              className={classes.profilePicture}
              style={{ alignContent: 'right' }}
            />
          </div>
        </Grid>

        <Grid item xs={3} sm={3}>
          <Grid container>
            <Grid item xs={12} sm={12}>
              <Typography>{name}</Typography>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography
                style={{
                  fontSize: 12,
                  color: 'grey',
                }}
              >
                {username}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={5} style={{ alignItems: 'left' }} sm={5}>
          <div>
            <IconButton
              edge="end"
              ref={profileMenuRef as any}
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={() => setProfilePopoverOpen(true)}
              style={{ alignContent: 'left' }}
            >
              <ExpandMoreTwoToneIcon htmlColor="grey" />
            </IconButton>
          </div>
        </Grid>
      </Grid>
      <ProfileInfoDropdownItems
        anchorEl={profileMenuRef.current}
        isOpen={isProfilePopoverOpen}
        onClose={() => setProfilePopoverOpen(false)}
        name={name}
        email={email}
        projects={projects}
      />
    </div>
  );
};

export default ProfileDropdown;
