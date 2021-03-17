import { useQuery } from '@apollo/client';
import { IconButton, Popover, Typography } from '@material-ui/core';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import React, { useState } from 'react';
import { GET_PROJECT_NAME } from '../../graphql';
import { ProjectDetail } from '../../models/graphql/user';
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

  // Get Project Name
  const { data } = useQuery<ProjectDetail>(GET_PROJECT_NAME, {
    variables: { projectID },
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
      <Typography>{data?.getProject.name}</Typography>
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
