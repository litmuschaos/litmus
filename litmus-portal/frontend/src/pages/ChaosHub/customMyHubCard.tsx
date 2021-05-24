import {
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { LitmusCard } from 'litmus-ui';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import Center from '../../containers/layouts/Center';
import { HubDetails } from '../../models/redux/myhub';
import { history } from '../../redux/configureStore';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import useStyles from './styles';

interface customMyHubCardProp {
  hub: HubDetails;
  keyValue: string;
  handleDelete: (hubId: string) => void;
  handleRefresh: (hubId: string) => void;
  refreshLoader: boolean;
  handleEditHub: (hubName: string) => void;
}

const CustomMyHubCard: React.FC<customMyHubCardProp> = ({
  hub,
  keyValue,
  refreshLoader,
  handleDelete,
  handleRefresh,
  handleEditHub,
}) => {
  const classes = useStyles();
  const { palette } = useTheme();
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
    <LitmusCard
      width="220px"
      height="320px"
      borderColor={palette.border.main}
      key={hub.id}
      className={classes.cardDivChart}
      data-cy="myhubCard"
    >
      {/* Card Header for Status and Menu Option */}
      <CardHeader
        className={classes.cardHeader}
        action={
          <div className={classes.mainCardDiv}>
            <div
              className={hub.IsAvailable ? classes.connected : classes.error}
            >
              <Center>
                <Typography className={classes.statusText}>
                  {hub.IsAvailable ? 'Connected' : 'Error'}
                </Typography>
              </Center>
            </div>

            {userRole !== 'Viewer' && (
              <>
                <IconButton
                  aria-label="more"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  onClick={handleClick}
                  data-cy="myHubCardOption"
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
                    data-cy="myHubRefresh"
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
                    data-cy="myHubEdit"
                    value="View"
                    onClick={() => {
                      handleEditHub(hub.HubName);
                      handleClose();
                    }}
                  >
                    <div className={classes.cardMenu}>
                      <img
                        src="./icons/Edit.svg"
                        alt="Edit"
                        className={classes.editImg}
                      />
                      <Typography data-cy="viewHub">
                        {t('myhub.edit')}
                      </Typography>
                    </div>
                  </MenuItem>

                  <MenuItem
                    data-cy="myHubDelete"
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
        }
      />
      {/* Card Content */}
      <CardContent
        onClick={() => {
          history.push({
            pathname: `/myhub/${hub.HubName}`,
            search: `?projectID=${projectID}&projectRole=${userRole}`,
          });
        }}
      >
        <div className={classes.cardContent}>
          <img
            src={`./icons/${
              hub.HubName === 'Chaos Hub'
                ? 'myhub-litmus.svg'
                : 'my-hub-charts.svg'
            }`}
            alt="add-hub"
          />
          <Typography variant="h6" align="center" className={classes.hubName}>
            <strong>{hub.HubName}</strong>/{hub.RepoBranch}
          </Typography>
          <Typography className={classes.totalExp} gutterBottom>
            {parseInt(hub.TotalExp, 10) > 0
              ? `${hub.TotalExp} experiments`
              : t('myhub.error')}
          </Typography>
        </div>
        {keyValue === hub.id && refreshLoader ? (
          <div>
            <Loader />
            <Typography className={classes.syncText}>
              {t('myhub.mainPage.sync')}
            </Typography>
          </div>
        ) : (
          <div className={classes.lastSyncDiv}>
            <Typography className={classes.lastSyncText}>
              {t('myhub.lastSync')}
            </Typography>
            <Typography className={classes.lastSyncText}>
              {formatDate(hub.LastSyncedAt)}
            </Typography>
          </div>
        )}
      </CardContent>
    </LitmusCard>
  );
};

export default CustomMyHubCard;
