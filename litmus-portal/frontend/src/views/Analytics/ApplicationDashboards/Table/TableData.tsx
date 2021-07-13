import { useMutation } from '@apollo/client';
import { IconButton, Menu, MenuItem, Typography } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { ButtonFilled, Modal, TextButton } from 'litmus-ui';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DELETE_DASHBOARD } from '../../../../graphql/mutations';
import {
  DeleteDashboardInput,
  ListDashboardResponse,
} from '../../../../models/graphql/dashboardsDetails';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import * as DataSourceActions from '../../../../redux/actions/dataSource';
import { history } from '../../../../redux/configureStore';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import useStyles, { StyledTableCell } from './styles';

interface TableDataProps {
  data: ListDashboardResponse;
  alertStateHandler: (successState: boolean) => void;
}

const TableData: React.FC<TableDataProps> = ({ data, alertStateHandler }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dashboard = useActions(DashboardActions);
  const dataSource = useActions(DataSourceActions);
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const [mutate, setMutate] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [dashboardSelectedForDeleting, setDashboardSelectedForDeleting] =
    React.useState<DeleteDashboardInput>({
      dbID: '',
    });

  // Function to convert UNIX time in format of dddd, DD MMM YYYY, HH:mm
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('dddd, DD MMM YYYY, HH:mm');
    return resDate;
  };
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [deleteDashboard] = useMutation<boolean, DeleteDashboardInput>(
    DELETE_DASHBOARD,
    {
      onCompleted: () => {
        setMutate(false);
        alertStateHandler(true);
      },
      onError: () => {
        setMutate(false);
        alertStateHandler(false);
      },
    }
  );

  const onDashboardLoadRoutine = async () => {
    dashboard.selectDashboard({
      selectedDashboardID: data.db_id,
      refreshRate: 0,
    });
    dataSource.selectDataSource({
      selectedDataSourceURL: '',
      selectedDataSourceID: '',
      selectedDataSourceName: '',
    });
    return true;
  };

  useEffect(() => {
    if (mutate === true) {
      deleteDashboard({
        variables: { dbID: dashboardSelectedForDeleting.dbID },
      });
    }
  }, [mutate]);

  return (
    <>
      <StyledTableCell className={classes.columnDivider}>
        <Typography
          className={`${classes.tableObjects} ${classes.dashboardNameCol} ${classes.dashboardNameColData}`}
          onClick={() => {
            onDashboardLoadRoutine().then(() => {
              history.push({
                pathname: '/analytics/application-dashboard',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            });
          }}
        >
          {data.db_name}
        </Typography>
      </StyledTableCell>

      <StyledTableCell className={classes.dividerPadding}>
        <Typography
          className={classes.tableObjects}
          style={{ maxWidth: '5rem' }}
        >
          {data.cluster_name}
        </Typography>
      </StyledTableCell>

      <StyledTableCell>
        <Typography
          className={classes.tableObjects}
          style={{ maxWidth: '7rem' }}
        >
          <img
            src={`./icons/${data.db_type_id}_dashboard.svg`}
            alt={data.db_type_name}
            className={classes.inlineTypeIcon}
          />
          {data.db_type_name}
        </Typography>
      </StyledTableCell>

      <StyledTableCell>
        <Typography
          className={classes.tableObjects}
          style={{ maxWidth: '5rem' }}
        >
          <img
            src="./icons/prometheus.svg"
            alt="Prometheus"
            className={classes.inlineIcon}
          />
          {data.ds_type}
        </Typography>
      </StyledTableCell>

      <StyledTableCell>
        <Typography
          className={classes.tableObjects}
          style={{ maxWidth: '12.5rem' }}
        >
          <img src="./icons/calendarIcon.svg" alt="Calender" />
          {formatDate(data.updated_at)}
        </Typography>
      </StyledTableCell>

      <StyledTableCell>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
          data-cy="browseDashboardOptions"
        >
          <MoreVertIcon className={classes.headerIcon} />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          getContentAnchorEl={null}
          classes={{ paper: classes.menuList }}
        >
          <MenuItem
            value="View"
            onClick={() => {
              onDashboardLoadRoutine().then(() => {
                history.push({
                  pathname: '/analytics/application-dashboard',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              });
            }}
            className={classes.menuItem}
          >
            <div className={classes.expDiv}>
              <img
                src="./icons/viewAnalytics.svg"
                alt="View"
                className={classes.btnImg}
              />
              <Typography data-cy="openDashboard" className={classes.btnText}>
                {t('analyticsDashboard.applicationDashboardTable.view')}
              </Typography>
            </div>
          </MenuItem>

          <MenuItem
            value="Configure"
            onClick={() => {
              dashboard.selectDashboard({
                selectedDashboardID: data.db_id,
                activePanelID: '',
              });
              history.push({
                pathname: '/analytics/dashboard/configure',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
            className={classes.menuItem}
          >
            <div className={classes.expDiv}>
              <img
                src="./icons/cogwheel.svg"
                alt="Configure"
                className={classes.btnImg}
              />
              <Typography
                data-cy=" configureDashboard"
                className={classes.btnText}
              >
                {t('analyticsDashboard.applicationDashboardTable.configure')}
              </Typography>
            </div>
          </MenuItem>

          <MenuItem
            value="Delete"
            onClick={() => {
              setDashboardSelectedForDeleting({
                dbID: data.db_id,
              });
              setOpenModal(true);
              handleClose();
            }}
            className={classes.menuItem}
          >
            <div className={classes.expDiv}>
              <img
                src="./icons/delete.svg"
                alt="Delete"
                className={classes.btnImg}
              />
              <Typography
                data-cy="deleteDashboard"
                className={`${classes.btnText} ${classes.deleteText}`}
              >
                {t('analyticsDashboard.applicationDashboardTable.delete')}
              </Typography>
            </div>
          </MenuItem>
        </Menu>
      </StyledTableCell>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        width="45%"
        height="fit-content"
      >
        <div className={classes.modal}>
          <Typography className={classes.modalHeading} align="left">
            {t(
              'analyticsDashboard.applicationDashboardTable.modal.removeDashboard'
            )}
          </Typography>

          <Typography className={classes.modalBodyText} align="left">
            {t(
              'analyticsDashboard.applicationDashboardTable.modal.removeDashboardConfirmation'
            )}
            <b>
              <i>{` ${data.db_name} `}</i>
            </b>
            ?
          </Typography>

          <div className={classes.flexButtons}>
            <TextButton
              onClick={() => setOpenModal(false)}
              className={classes.cancelButton}
            >
              <Typography className={classes.buttonText}>
                {t('analyticsDashboard.applicationDashboardTable.modal.cancel')}
              </Typography>
            </TextButton>
            <ButtonFilled
              onClick={() => {
                setMutate(true);
                setOpenModal(false);
              }}
              variant="error"
            >
              <Typography
                className={`${classes.buttonText} ${classes.confirmButtonText}`}
              >
                {t('analyticsDashboard.applicationDashboardTable.modal.delete')}
              </Typography>
            </ButtonFilled>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default TableData;
