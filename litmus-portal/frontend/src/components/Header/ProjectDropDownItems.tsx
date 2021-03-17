import { useQuery } from '@apollo/client';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LIST_PROJECTS } from '../../graphql';
import { Member, Project, Projects } from '../../models/graphql/user';
import { history } from '../../redux/configureStore';
import { getUserId } from '../../utils/auth';
import { getProjectID } from '../../utils/getSearchParams';
import Loader from '../Loader';
import useStyles from './styles';

interface otherProjectsType {
  projectDetails: Project;
  currentUserProjectRole: string;
}

interface CustomisedListItemProps {
  handleClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  label: string;
  selected: boolean;
}

const CustomisedListItem: React.FC<CustomisedListItemProps> = ({
  handleClick,
  label,
  selected,
}) => {
  const classes = useStyles();
  return (
    <ListItem
      button
      selected={selected}
      onClick={handleClick}
      className={selected ? classes.active : ''}
    >
      <ListItemIcon>
        {selected ? (
          <img src="./icons/selectedProject.svg" alt="Selected Project" />
        ) : (
          <img src="./icons/nonSelectedproject.svg" alt="Un-selected Project" />
        )}
      </ListItemIcon>
      <ListItemText primary={label} />
    </ListItem>
  );
};

const ProjectDropdownItems: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data, loading } = useQuery<Projects>(LIST_PROJECTS);
  const projects = data?.listProjects ?? [];

  const baseRoute = window.location.pathname.split('/')[1];

  const userID = getUserId();
  const projectID = getProjectID();

  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [otherProjects, setOtherProjects] = useState<otherProjectsType[]>([]);

  useEffect(() => {
    const projectOwner: Project[] = [];
    const projectOther: otherProjectsType[] = [];

    projects.map((project) => {
      return project.members.forEach((member: Member) => {
        if (member.user_id === userID && member.role === 'Owner') {
          projectOwner.push(project);
        } else if (
          member.user_id === userID &&
          member.role !== 'Owner' &&
          member.invitation === 'Accepted'
        ) {
          projectOther.push({
            projectDetails: project,
            currentUserProjectRole: member.role,
          });
        }
      });
    });
    setMyProjects(projectOwner);
    setOtherProjects(projectOther);
  }, [data]);

  return (
    <div
      className={classes.projectPopover}
      data-cy="headerProjectDropdownItems"
    >
      {loading ? (
        <Loader />
      ) : (
        <List>
          <ListItem>
            <ListItemText id="hint" primary="My Projects" />
          </ListItem>
          {myProjects.length === 0 ? (
            <ListItem data-cy="project">
              <ListItemText primary="No projects Owned" />
            </ListItem>
          ) : (
            myProjects.map((project) => {
              return (
                <CustomisedListItem
                  key="home"
                  handleClick={() => {
                    history.push({
                      pathname: `/${baseRoute}`,
                      search: `?projectID=${project.id}&projectRole=Owner`,
                    });
                  }}
                  label={project.name}
                  selected={projectID === project.id}
                />
              );
            })
          )}
          <ListItem>
            <ListItemText id="hint" primary="Other Projects" />
          </ListItem>
          {otherProjects.length === 0 ? (
            <ListItem data-cy="project">
              <ListItemText
                primary={t('header.profileDropdown.noProjectsOther')}
              />
            </ListItem>
          ) : (
            otherProjects.map((project) => {
              return (
                <CustomisedListItem
                  key="home"
                  handleClick={() => {
                    history.push({
                      pathname: `/home`,
                      search: `?projectID=${project.projectDetails.id}&projectRole=${project.currentUserProjectRole}`,
                    });
                  }}
                  label={project.projectDetails.name}
                  selected={projectID === project.projectDetails.id}
                />
              );
            })
          )}
        </List>
      )}
    </div>
  );
};

export default ProjectDropdownItems;
