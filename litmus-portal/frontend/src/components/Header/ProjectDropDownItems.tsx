import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  useTheme,
} from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import { Icon } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../../config';
import { Member, Project } from '../../models/graphql/user';
import { history } from '../../redux/configureStore';
import { getToken, getUserId } from '../../utils/auth';
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
  const theme = useTheme();
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
      data-cy="projectDropDownItem"
      button
      selected={selected}
      onClick={handleClick}
      className={`${classes.projectListItem} ${selected ? classes.active : ''}`}
    >
      <ListItemIcon>
        {selected ? (
          <div className={classes.selectedWrapper}>
            <Icon name="check" size="md" color={theme.palette.success.main} />
          </div>
        ) : (
          <div className={classes.notSelectedWrapper}>
            <Icon
              name="project"
              size="md"
              color={theme.palette.background.paper}
            />
          </div>
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
            <Icon name="copy" size="lg" color={theme.palette.primary.main} />
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
  const [loading, setLoading] = useState<boolean>(true);

  const baseRoute = window.location.pathname
    .replace(process.env.PUBLIC_URL, '')
    .split('/')[1];

  const userID = getUserId();
  const projectID = getProjectID();
  const [projects, setProjects] = useState<Project[]>([]);

  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [otherProjects, setOtherProjects] = useState<OtherProjectsType[]>([]);

  useEffect(() => {
    fetch(`${config.auth.url}/list_projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data.data);
        } else {
          setProjects(data.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    const projectOwner: Project[] = [];
    const projectOther: OtherProjectsType[] = [];

    projects.map((project) => {
      return project.Members.forEach((member: Member) => {
        if (member.UserID === userID && member.Role === 'Owner') {
          projectOwner.push(project);
        } else if (
          member.UserID === userID &&
          member.Role !== 'Owner' &&
          member.Invitation === 'Accepted'
        ) {
          projectOther.push({
            projectDetails: project,
            currentUserProjectRole: member.Role,
          });
        }
      });
    });
    setMyProjects(projectOwner);
    setOtherProjects(projectOther);
  }, [projects]);

  return (
    <div className={classes.projectPopover}>
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
                      search: `?projectID=${project.ID}&projectRole=Owner`,
                    });
                  }}
                  label={project.Name}
                  secondaryLabel={project.ID}
                  selected={projectID === project.ID}
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
                      search: `?projectID=${project.projectDetails.ID}&projectRole=${project.currentUserProjectRole}`,
                    });
                  }}
                  label={project.projectDetails.Name}
                  secondaryLabel={project.projectDetails.ID}
                  selected={projectID === project.projectDetails.ID}
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
function setLoading(arg0: boolean) {
  throw new Error('Function not implemented.');
}
