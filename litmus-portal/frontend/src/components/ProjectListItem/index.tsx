import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';
import CheckCircleSharpIcon from '@material-ui/icons/CheckCircleSharp';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import React, { useState } from 'react';
import useStyles from './styles';

interface ProjectListItemProps {
  project: any;
  divider: any;
}

function ProjectListItem(props: ProjectListItemProps) {
  const classes = useStyles();

  const { project, divider } = props;

  const [bgColor, setbgColor] = useState(
    project.id === localStorage.getItem('ActiveProjectId') ? '#109B67' : 'white'
  );

  const [selectedProj, setselectedProj] = useState(
    project.id === localStorage.getItem('ActiveProjectId')
  );

  const [currentState, changeState] = useState(true);

  const selectProject = () => {
    localStorage.setItem('ActiveProjectId', `${project.id}`);
    setbgColor('#109B67');
    setselectedProj(true);
    changeState(true);
    // window.location.reload(false);
  };

  const extraOptions = () => {};

  return (
    <ListItem
      divider={divider}
      onClick={selectProject}
      style={{ backgroundColor: bgColor }}
      className={classes.listItemStyle}
    >
      <ListItemAvatar>
        {currentState || selectedProj ? (
          <Avatar
            style={{
              backgroundColor: '#109B67',
              width: 32,
              height: 32,
            }}
          >
            <CheckCircleSharpIcon
              style={{ color: 'white', width: 36, height: 36 }}
            />
          </Avatar>
        ) : (
          <Avatar
            style={{
              backgroundColor: '#109B67',
              width: 36,
              height: 36,
            }}
          >
            <InsertDriveFileOutlinedIcon
              style={{
                color: 'white',
                backgroundColor: '#109B67',
              }}
            />
          </Avatar>
        )}
      </ListItemAvatar>
      <ListItemText primary={project.projectName} style={{ fontSize: 14 }} />
      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="more" onClick={extraOptions}>
          {currentState || selectedProj ? (
            <MoreHorizIcon style={{ color: 'white' }} />
          ) : (
            <MoreHorizIcon />
          )}
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}

export default ProjectListItem;
