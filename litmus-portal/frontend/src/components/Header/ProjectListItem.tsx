import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@material-ui/core';
import CheckCircleSharpIcon from '@material-ui/icons/CheckCircleSharp';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import React, { useState } from 'react';
import { Project } from '../../models/graphql/user';
import { ProjectsCallBackType } from '../../models/header';
import useStyles from './styles';

interface ProjectListItemProps {
  project: Project;
  divider: boolean;
  selectedProjectID: string;
  callbackToSetActiveProjectID: ProjectsCallBackType;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({
  project,
  divider,
  selectedProjectID,
  callbackToSetActiveProjectID,
}) => {
  const classes = useStyles();
  const [projSelected, setProjSelected] = useState(
    project.id === selectedProjectID
  );

  const selectProject = () => {
    callbackToSetActiveProjectID(`${project.id}`);
    setProjSelected(true);
  };

  return (
    <ListItem
      data-cy="project"
      divider={divider}
      onClick={selectProject}
      style={{ backgroundColor: projSelected ? '#109B67' : 'white' }}
      className={classes.listItemStyle}
    >
      <ListItemAvatar>
        {projSelected ? (
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
      <ListItemText primary={project.name} style={{ fontSize: 14 }} />
      {/* <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="more" onClick={extraOptions}>
          {projSelected ? (
            <MoreHorizIcon style={{ color: 'white' }} />
          ) : (
            <MoreHorizIcon />
          )}
        </IconButton>
      </ListItemSecondaryAction>
          */}
    </ListItem>
  );
};

export default ProjectListItem;
