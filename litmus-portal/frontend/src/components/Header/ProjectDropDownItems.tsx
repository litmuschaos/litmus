import { useQuery } from '@apollo/client';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LIST_PROJECTS } from '../../graphql';
import { Member, Project, Projects } from '../../models/graphql/user';
import { history } from '../../redux/configureStore';
import { getUserId } from '../../utils/auth';
import { getProjectID } from '../../utils/getSearchParams';
import Loader from '../Loader';
import useStyles from './styles';

type OtherProjectsType = {
  projectDetails: Project;
  currentUserProjectRole: string;
};

interface CustomisedListItemProps {
  handleClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  label: string;
  secondaryLabel: string;
  selected: boolean;
}

const CustomisedListItem: React.FC<CustomisedListItemProps> = ({
  handleClick,
  label,
  secondaryLabel,
  selected,
}) => {
  const classes = useStyles();
  const [copying, setCopying] = useState<boolean>(false);

  function fallbackCopyTextToClipboard(text: string) {
    // eslint-disable-next-line no-alert
    window.prompt('Copy to clipboard: Ctrl+C, Enter', text);
  }

  function copyTextToClipboard(text: string) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    setCopying(true);
    navigator.clipboard
      .writeText(text)
      .catch((err) => console.error('Async: Could not copy text: ', err));

    setTimeout(() => setCopying(false), 3000);
  }

  return (
    <ListItem
      button
      selected={selected}
      onClick={handleClick}
      className={`${classes.projectListItem} ${selected ? classes.active : ''}`}
    >
      <ListItemIcon>
        {selected ? (
          <img src="./icons/selectedProject.svg" alt="Selected Project" />
        ) : (
          <img src="./icons/nonSelectedproject.svg" alt="Un-selected Project" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={label}
        secondary={`Project ID: ${secondaryLabel}`}
      />
      <ListItemSecondaryAction>
        <IconButton
          onClick={() => copyTextToClipboard(`${secondaryLabel}`)}
          edge="end"
          aria-label="copyProject"
        >
          {!copying ? (
            <img src="./icons/copyProjectID.svg" alt="Copy project ID" />
          ) : (
            <DoneIcon />
          )}
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const ProjectDropdownItems: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data, loading } = useQuery<Projects>(LIST_PROJECTS);
  const projects = data?.listProjects ?? [];

  const baseRoute = window.location.pathname
    .replace(process.env.PUBLIC_URL, '')
    .split('/')[1];

  const userID = getUserId();
  const projectID = getProjectID();

  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [otherProjects, setOtherProjects] = useState<OtherProjectsType[]>([]);

  useEffect(() => {
    const projectOwner: Project[] = [];
    const projectOther: OtherProjectsType[] = [];

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
            <ListItemText
              id="hint"
              primary={t('header.projectDropdown.myProjects')}
            />
          </ListItem>
          {myProjects.length === 0 ? (
            <ListItem data-cy="project">
              <ListItemText
                primary={t('header.projectDropdown.noMyProjects')}
              />
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
                  secondaryLabel={project.id}
                  selected={projectID === project.id}
                />
              );
            })
          )}
          <ListItem>
            <ListItemText
              id="hint"
              primary={t('header.projectDropdown.otherProjects')}
            />
          </ListItem>
          {otherProjects.length === 0 ? (
            <ListItem data-cy="project">
              <ListItemText
                primary={t('header.projectDropdown.noProjectsOther')}
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
                  secondaryLabel={project.projectDetails.id}
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
