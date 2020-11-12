import { Typography } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { ReactComponent as CommunityIcon } from '../../svg/community.svg';
import { ReactComponent as HomeIcon } from '../../svg/home.svg';
import { ReactComponent as SettingsIcon } from '../../svg/settings.svg';
import { ReactComponent as TargetsIcon } from '../../svg/targets.svg';
import { ReactComponent as WorkflowsIcon } from '../../svg/workflows.svg';
import { ReactComponent as MyHubIcon } from '../../svg/myhub.svg';
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
  const userRole = useSelector((state: RootState) => state.userData.userRole);
  const { t } = useTranslation();
  const pathName = useLocation().pathname.split('/')[1];

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
            history.push('/');
          }}
          label="Home"
          selected={pathName === ''}
        >
          <HomeIcon />
        </CustomisedListItem>
        <div data-cy="workflows">
          <CustomisedListItem
            key="workflow"
            handleClick={() => {
              history.push('/workflows');
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
              history.push('/myhub');
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
            history.push('/targets');
          }}
          label="Targets"
          selected={pathName === 'targets'}
        >
          <TargetsIcon />
        </CustomisedListItem>
        <CustomisedListItem
          key="community"
          handleClick={() => {
            history.push('/community');
          }}
          label="Community"
          selected={pathName === 'community'}
        >
          <CommunityIcon />
        </CustomisedListItem>
        {userRole === 'Owner' && (
          <CustomisedListItem
            key="settings"
            handleClick={() => {
              history.push('/settings');
            }}
            label="Settings"
            selected={pathName === 'settings'}
          >
            <SettingsIcon />
          </CustomisedListItem>
        )}
      </List>
      <div className={classes.versionDiv}>
        <img
          src="/icons/litmusPurple.svg"
          alt="litmus logo"
          className={classes.versionlogo}
        />
        <Typography className={classes.versionText}>
          {t('sidebar.version')}
        </Typography>
      </div>
    </Drawer>
  );
};

export default SideBar;
