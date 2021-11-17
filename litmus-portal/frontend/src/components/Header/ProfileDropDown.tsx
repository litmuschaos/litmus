import {
  Avatar,
  IconButton,
  Popover,
  Typography,
  useTheme,
} from '@material-ui/core';
import { ButtonFilled, Icon, TextButton } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import config from '../../config';
import useActions from '../../redux/actions';
import * as TabActions from '../../redux/actions/tabs';
import { history } from '../../redux/configureStore';
import { getToken, getUserId, getUsername, logout } from '../../utils/auth';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import { userInitials } from '../../utils/userInitials';
import useStyles from './styles';

const ProfileDropdown: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const tabs = useActions(TabActions);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Get username from JWT
  const username = getUsername();

  const projectID = getProjectID();
  const projectRole = getProjectRole();

  const [userEmail, setuserEmail] = useState<string>('');

  React.useEffect(() => {
    fetch(`${config.auth.url}/getUser/${getUserId()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data);
        } else {
          setuserEmail(data.email);
        }
      });
  }, []);

  // Handle clicks
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'headerProfileDropdown' : undefined;

  const initials = userInitials(username);

  return (
    <div className={classes.profileDropdown} data-cy="headerProfileDropdown">
      <IconButton edge="end" onClick={handleClick}>
        <Avatar className={classes.avatarBackground}>{initials}</Avatar>
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
        <div className={classes.profileDropdownPopover}>
          <Typography>{t('header.profileDropdown.signedIn')}</Typography>
          {userEmail ? (
            <>
              <Typography className={classes.profileSet}>
                {userEmail}
              </Typography>
            </>
          ) : (
            <div
              className={`${classes.profileDropdownRow} ${classes.profileUnset}`}
            >
              <Typography className={classes.emailUnset}>
                {t('header.profileDropdown.emailUnset')}
              </Typography>
              {projectRole === 'Owner' ? (
                <Link
                  to={{
                    pathname: '/settings',
                    search: `?projectID=${projectID}&projectRole=${projectRole}`,
                  }}
                  onClick={() => tabs.changeSettingsTabs(0)}
                >
                  <Typography title="Go to settings">
                    {t('header.profileDropdown.emailSet')}
                  </Typography>
                </Link>
              ) : (
                <Typography className={classes.projectRoleHint}>
                  {t('header.profileDropdown.switchProject')}
                </Typography>
              )}
            </div>
          )}
          <div
            className={`${classes.profileDropdownRow} ${classes.profileButtons}`}
          >
            <div data-cy="logoutButton">
              <ButtonFilled
                title="Logout from the portal"
                onClick={() => logout()}
              >
                {t('header.profileDropdown.logout')}
                <Icon
                  id="logoutIcon"
                  name="logout"
                  size="lg"
                  color={theme.palette.background.paper}
                />
              </ButtonFilled>
            </div>

            <TextButton
              title="Edit your profile"
              variant="highlight"
              disabled={projectRole !== 'Owner'}
              onClick={() => {
                tabs.changeSettingsTabs(0);
                history.push({
                  pathname: '/settings',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
            >
              {t('header.profileDropdown.editProfile')}
            </TextButton>
          </div>
        </div>
      </Popover>
    </div>
  );
};

export default ProfileDropdown;
