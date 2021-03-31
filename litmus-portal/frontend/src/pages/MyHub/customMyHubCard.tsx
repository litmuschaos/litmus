import {
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ButtonFilled from '../../components/Button/ButtonFilled';
import Loader from '../../components/Loader';
import { HubDetails } from '../../models/redux/myhub';
import { history } from '../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import useStyles from './styles';

interface customMyHubCardProp {
  hub: HubDetails;
  keyValue: string;
  handleSync: (hubId: string) => void;
  handleDelete: (hubId: string) => void;
  handleRefresh: (hubId: string) => void;
  loader: boolean;
  refreshLoader: boolean;
}

const CustomMyHubCard: React.FC<customMyHubCardProp> = ({
  hub,
  keyValue,
  handleSync,
  handleDelete,
  handleRefresh,
  loader,
  refreshLoader,
}) => {
  const classes = useStyles();

  // States for PopOver to display Experiment Weights
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { t } = useTranslation();
  const projectID = getProjectID();
  const userRole = getProjectRole();

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('DD MMM YYYY hh:mm A');
    if (date) return resDate;
    return 'Date not available';
  };

  return (
    <Paper key={hub.id} elevation={3} className={classes.cardDivChart}>
      <CardContent className={classes.cardContent}>
        <div className={classes.mainCardDiv}>
          <Typography
            className={hub.IsAvailable ? classes.connected : classes.error}
          >
            {hub.IsAvailable ? 'Connected' : 'Error'}
          </Typography>
          {userRole !== 'Viewer' && (
            <>
              <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={handleClick}
                data-cy="browseScheduleOptions"
                className={classes.iconButton}
              >
                <MoreVertIcon className={classes.cardOption} />
              </IconButton>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                onClose={handleClose}
              >
                <MenuItem
                  value="Refresh"
                  onClick={() => {
                    handleRefresh(hub.id);
                  }}
                >
                  <div className={classes.cardMenu}>
                    <img
                      src="./icons/refresh.svg"
                      alt="Refresh"
                      className={classes.refreshImg}
                    />
                    <Typography data-cy="viewHub">
                      {t('myhub.refresh')}
                    </Typography>
                  </div>
                </MenuItem>
                <MenuItem
                  value="View"
                  onClick={() => {
                    history.push({
                      pathname: `/myhub/edit/${hub.HubName}`,
                      search: `?projectID=${projectID}&projectRole=${userRole}`,
                    });
                  }}
                >
                  <div className={classes.cardMenu}>
                    <img
                      src="./icons/Edit.svg"
                      alt="Edit"
                      className={classes.editImg}
                    />
                    <Typography data-cy="viewHub">{t('myhub.edit')}</Typography>
                  </div>
                </MenuItem>

                <MenuItem
                  value="Delete"
                  onClick={() => {
                    handleDelete(hub.id);
                  }}
                >
                  <div className={classes.cardMenu}>
                    <img
                      src="./icons/bin-red.svg"
                      alt="disconnect"
                      className={classes.disconnectImg}
                    />
                    <Typography
                      className={classes.disconnectText}
                      data-cy="viewHub"
                    >
                      {t('myhub.disconnect')}
                    </Typography>
                  </div>
                </MenuItem>
              </Menu>
            </>
          )}
        </div>
        <img
          src={`./icons/${
            hub.HubName === 'Chaos Hub'
              ? 'myhub-litmus.svg'
              : 'my-hub-charts.svg'
          }`}
          className={classes.hubImage}
          alt="add-hub"
        />
        <Typography variant="h6" align="center" className={classes.hubName}>
          {hub.HubName}
        </Typography>
        {keyValue === hub.id && refreshLoader ? (
          <>
            <Loader />
            <Typography>Refreshing Hub</Typography>
          </>
        ) : (
          <>
            <Typography>Last synced at:</Typography>

            <Typography>{formatDate(hub.LastSyncedAt)}</Typography>
            <Typography className={classes.totalExp}>
              {parseInt(hub.TotalExp, 10) > 0
                ? `${hub.TotalExp} experiments`
                : t('myhub.error')}
            </Typography>
            <hr className={classes.horizontalLine} />
            {hub.IsAvailable ? (
              <ButtonFilled
                styles={{
                  width: '100%',
                }}
                handleClick={() => {
                  history.push({
                    pathname: `/myhub/${hub.HubName}`,
                    search: `?projectID=${projectID}&projectRole=${userRole}`,
                  });
                }}
                isPrimary
              >
                {t('myhub.view')}
              </ButtonFilled>
            ) : (
              <ButtonFilled
                styles={{
                  width: '100%',
                }}
                isWarning
                isPrimary={false}
                isDisabled={keyValue === hub.id && loader}
                handleClick={() => {
                  handleSync(hub.id);
                }}
              >
                {keyValue === hub.id && loader
                  ? t('myhub.mainPage.sync')
                  : t('myhub.mainPage.retry')}
              </ButtonFilled>
            )}
          </>
        )}
      </CardContent>
    </Paper>
  );
};

export default CustomMyHubCard;
