import { IconButton, Popover, Typography } from '@material-ui/core';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import React, { useState } from 'react';
import config from '../../config';
import { getToken } from '../../utils/auth';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import ProjectDropdownItems from './ProjectDropDownItems';
import useStyles from './styles';

const ProjectDropdown: React.FC = () => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Get ProjectID from URL
  const projectID = getProjectID();

  // Get the projectRole from URL
  const projectRole = getProjectRole();
  const [projectName, setProjectName] = useState<string>('');

  // Get Project Name
  // const { data } = useQuery<ProjectDetail>(GET_PROJECT_NAME, {
  //   variables: { projectID },
  // });
  fetch(`${config.auth.url}/get_project/${projectID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if ('error' in data) {
        console.error(data);
      } else {
        setProjectName(data.Name);
      }
    })
    .catch((err) => {
      console.error(err);
    });
  // Handle clicks
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'headerProjectDropdown' : undefined;

  return (
    <div className={classes.projectDropdown} data-cy="headerProjectDropdown">
      <Typography>{projectName}</Typography>
      <Typography> ({projectRole})</Typography>
      <IconButton edge="end" onClick={handleClick}>
        <ExpandMoreRoundedIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <ProjectDropdownItems />
      </Popover>
    </div>
  );
};

export default ProjectDropdown;
