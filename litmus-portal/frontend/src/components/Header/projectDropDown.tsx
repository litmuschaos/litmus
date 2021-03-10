import { IconButton, Popover, Typography } from '@material-ui/core';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import React, { useState } from 'react';
import { getProjectRole } from '../../utils/getSearchParams';
import useStyles from './styles';

const ProjectDropDown: React.FC = () => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Get ProjectID from URL
  //   const projectID = getProjectID();

  // Get the projectRole from URL
  const projectRole = getProjectRole();

  // Get Project Name

  //   const projectName = useQuery<ProjectDetail>(GET_PROJECT_NAME, {
  //     variables: { projectID },
  //     onCompleted: (data) => {
  //       const projectName = data.getProject.name;
  //     },
  //     fetchPolicy: 'cache-and-network',
  //   });

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
      <Typography>projectName</Typography>
      <Typography>({projectRole})</Typography>
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
        {/* <PopoverItems /> */}
      </Popover>
    </div>
  );
};

export default ProjectDropDown;
