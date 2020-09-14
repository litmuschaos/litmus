import { Typography } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { ReactComponent as CommunityIcon } from '../../svg/community.svg';
import { ReactComponent as HomeIcon } from '../../svg/home.svg';
import { ReactComponent as SettingsIcon } from '../../svg/settings.svg';
import { ReactComponent as WorkflowsIcon } from '../../svg/workflows.svg';
import useStyles from './styles';

interface CustomisedListItemProps {
  handleClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  label: string;
}

const CustomisedListItem: React.FC<CustomisedListItemProps> = ({
  children,
  handleClick,
  label,
}) => {
  const classes = useStyles();
  return (
    <ListItem button onClick={handleClick} className={classes.drawerListItem}>
      <ListItemIcon className={classes.listIcon}>{children}</ListItemIcon>
      <ListItemText primary={label} className={classes.listText} />
    </ListItem>
  );
};

const SideBar: React.FC = () => {
  const classes = useStyles();
  const userRole = useSelector((state: RootState) => state.userData.userRole);
  const { t } = useTranslation();

  return (
    <Drawer
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
        >
          <HomeIcon />
        </CustomisedListItem>
        <CustomisedListItem
          key="workflow"
          handleClick={() => {
            history.push('/workflows');
          }}
          label="Workflows"
        >
          <WorkflowsIcon />
        </CustomisedListItem>
        <CustomisedListItem
          key="community"
          handleClick={() => {
            history.push('/community');
          }}
          label="Community"
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
          >
            <SettingsIcon />
          </CustomisedListItem>
        )}
      </List>
    </Drawer>
  );
};

export default SideBar;
