/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { IconButton, Grid } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import ExpandMoreTwoToneIcon from '@material-ui/icons/ExpandMoreTwoTone';
import Typography from '@material-ui/core/Typography';
import ProfileInfoDropdownItems from '../ProfileDropdownItems';
import useStyles from './styles';

const ProfileDropdown = ({ callbackFromParent }: any) => {
  const [user, setUser] = useState('Richard Hill');

  const [mail, setMail] = useState('richardrichard@gmail.com');

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
      {
        projectName: 'Eneghyproject',
        statusActive: 'true',
        id: '1',
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
              alt={user || 'User'}
              src="temp/RichardHill.jpg"
              className={classes.profilePicture}
              style={{ alignContent: 'right' }}
            />
          </div>
        </Grid>

        <Grid item xs={3} sm={3}>
          <Grid container>
            <Grid item xs={12} sm={12}>
              <Typography>Richard Hill</Typography>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography
                style={{
                  fontSize: 12,
                  color: 'grey',
                }}
              >
                User
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
        name={user}
        email={mail}
        projects={projects}
      />
    </div>
  );
};

export default ProfileDropdown;
