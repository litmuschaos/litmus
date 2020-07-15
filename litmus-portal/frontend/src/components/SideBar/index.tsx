import { Typography } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import React from 'react';
import { Link } from 'react-router-dom';
import useStyles from './styles';
import { history } from '../../redux/configureStore';

interface CustomisedListItemProps {
  handleClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  children: JSX.Element;
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

const SideBar = () => {
  const classes = useStyles();

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
            src="./icons/litmusPurple.svg"
            alt="litmus logo"
            className={classes.logo}
          />
          <Typography className={classes.litmusHome} variant="body1">
            Litmus
          </Typography>
        </div>
      </Link>

      <List className={classes.drawerList}>
        <CustomisedListItem
          key="home"
          handleClick={() => {
            history.push('/workflow');
          }}
          label="Workflows"
        >
          <img src="./icons/workflows.png" alt="homeIcon" />
        </CustomisedListItem>
        <CustomisedListItem
          key="Settings"
          handleClick={() => {
            history.push('/404');
          }}
          label="My Hub"
        >
          <img src="./icons/hub.png" alt="homeIcon" />
        </CustomisedListItem>
        <CustomisedListItem
          key="home"
          handleClick={() => {
            history.push('/404');
          }}
          label="Settings"
        >
          <img src="./icons/setting.png" alt="homeIcon" />
        </CustomisedListItem>
        <CustomisedListItem
          key="home"
          handleClick={() => {
            history.push('/community');
          }}
          label="Community"
        >
          <img src="./icons/community.png" alt="homeIcon" />
        </CustomisedListItem>
      </List>
    </Drawer>
  );
};

export default SideBar;
