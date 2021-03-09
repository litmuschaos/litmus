import { Typography } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { history } from '../../redux/configureStore';
import { ReactComponent as CommunityIcon } from '../../svg/community.svg';
import { ReactComponent as HomeIcon } from '../../svg/home.svg';
import { ReactComponent as MyHubIcon } from '../../svg/myhub.svg';
import { ReactComponent as SettingsIcon } from '../../svg/settings.svg';
import { ReactComponent as TargetsIcon } from '../../svg/targets.svg';
import { ReactComponent as WorkflowsIcon } from '../../svg/workflows.svg';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import useStyles from './styles';

interface CustomisedListItemProps {
  handleClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  label: string;
  selected: boolean;
}

const CustomisedListItem: React.FC<CustomisedListItemProps> = ({
  children,
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
      className={`${classes.drawerListItem} ${selected ? classes.active : ''}`}
    >
      <ListItemIcon className={classes.listIcon}>{children}</ListItemIcon>
      <ListItemText primary={label} className={classes.listText} />
    </ListItem>
  );
};

const SideBar: React.FC = () => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const { t } = useTranslation();
  const pathName = useLocation().pathname.split('/')[1];
  const version = process.env.REACT_APP_KB_CHAOS_VERSION;
  const buildTime = moment
    .unix(Number(process.env.REACT_APP_BUILD_TIME))
    .format('DD MMM YYYY HH:MM:SS');

  return (
    <Drawer
      data-cy="sidebarComponent"
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >
      <Link to="/" className={classes.homeLink}>
        <div className={classes.litmusDiv}>
          <img
            src="/icons/litmusPurple.svg"
            alt="litmus logo"
            className={classes.logo}
          />
          <Typography className={classes.litmusHome} variant="body1">
            {t('sidebar.title')}
          </Typography>
        </div>
      </Link>

      <List className={classes.drawerList}>
        <CustomisedListItem
          key="home"
          handleClick={() => {
            history.push({
              pathname: `/home`,
              search: `?projectID=${projectID}&projectRole=${projectRole}`,
            });
          }}
          label="Home"
          selected={pathName === 'home'}
        >
          <HomeIcon />
        </CustomisedListItem>
        <div data-cy="workflows">
          <CustomisedListItem
            key="workflow"
            handleClick={() => {
              history.push({
                pathname: `/workflows`,
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
            label="Workflows"
            selected={pathName === 'workflows'}
          >
            <WorkflowsIcon />
          </CustomisedListItem>
        </div>
        <div data-cy="myHub">
          <CustomisedListItem
            key="myhub"
            handleClick={() => {
              history.push({
                pathname: `/myhub`,
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
            label="My Hub"
            selected={pathName === 'myhub'}
          >
            <MyHubIcon />
          </CustomisedListItem>
        </div>
        <CustomisedListItem
          key="targets"
          handleClick={() => {
            history.push({
              pathname: `/targets`,
              search: `?projectID=${projectID}&projectRole=${projectRole}`,
            });
          }}
          label="Targets"
          selected={pathName === 'targets'}
        >
          <TargetsIcon />
        </CustomisedListItem>
        <CustomisedListItem
          key="community"
          handleClick={() => {
            history.push({
              pathname: `/community`,
              search: `?projectID=${projectID}&projectRole=${projectRole}`,
            });
          }}
          label="Community"
          selected={pathName === 'community'}
        >
          <CommunityIcon />
        </CustomisedListItem>
        {projectRole === 'Owner' && (
          <CustomisedListItem
            key="settings"
            handleClick={() => {
              history.push({
                pathname: `/settings`,
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
            label="Settings"
            selected={pathName === 'settings'}
          >
            <SettingsIcon />
          </CustomisedListItem>
        )}
      </List>
      <Typography className={classes.versionDiv}>
        <b>Version: </b> {version} <br />
        <b>Build Time: </b> {buildTime}
      </Typography>
    </Drawer>
  );
};

export default SideBar;
