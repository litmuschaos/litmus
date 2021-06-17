import { useMutation } from '@apollo/client';
import { IconButton, Menu, MenuItem, Typography } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
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
import * as TabActions from '../../../../redux/actions/tabs';
import { history } from '../../../../redux/configureStore';
import { ReactComponent as CrossMarkIcon } from '../../../../svg/crossmark.svg';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import useStyles, { StyledTableCell } from './styles';

interface TableDataProps {
  data: ListDashboardResponse;
}

const TableData: React.FC<TableDataProps> = ({ data }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dashboard = useActions(DashboardActions);
  const dataSource = useActions(DataSourceActions);
  const tabs = useActions(TabActions);
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const [mutate, setMutate] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [
    dashboardSelectedForDeleting,
    setDashboardSelectedForDeleting,
  ] = React.useState<DeleteDashboardInput>({
    dbID: '',
  });

  const [deleteDashboard] = useMutation<boolean, DeleteDashboardInput>(
    DELETE_DASHBOARD,
    {
      onCompleted: () => {
        setSuccess(true);
        setMutate(false);
        setOpenModal(true);
      },
      onError: () => {
        setMutate(false);
        setOpenModal(true);
      },
    }
  );

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
      <StyledTableCell className={classes.dashboardName}>
        <Typography
          variant="body2"
          align="center"
          className={classes.tableData}
        >
          <strong>{data.db_name}</strong>
        </Typography>
      </StyledTableCell>

      <StyledTableCell className={classes.tableHeader}>
        <Typography
          variant="body2"
          align="center"
          className={classes.tableData}
        >
          <strong>{data.cluster_name}</strong>
        </Typography>
      </StyledTableCell>

      <StyledTableCell className={classes.tableHeader}>
        <Typography variant="body2" align="center">
          <strong>{data.db_type_name}</strong>
        </Typography>
      </StyledTableCell>

      <StyledTableCell className={classes.tableHeader}>
        <Typography variant="body2" align="center">
          <strong>{data.ds_type}</strong>
        </Typography>
      </StyledTableCell>

      <StyledTableCell className={classes.tableHeader}>
        <Typography variant="body2" align="center">
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
        >
          <MenuItem
            value="Analysis"
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
                src="/icons/analytics.svg"
                alt="See Analytics"
                className={classes.btnImg}
              />
              <Typography data-cy="openDashboard" className={classes.btnText}>
                {t(
                  'analyticsDashboardViews.kubernetesDashboard.table.seeAnalytics'
                )}
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
                src="/icons/cogwheel.svg"
                alt="Configure"
                className={classes.btnImg}
              />
              <Typography
                data-cy=" configureDashboard"
                className={classes.btnText}
              >
                {t(
                  'analyticsDashboardViews.kubernetesDashboard.table.configure'
                )}
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
            }}
            className={classes.menuItem}
          >
            <div className={classes.expDiv}>
              <img
                src="/icons/delete.svg"
                alt="Delete"
                className={classes.btnImg}
              />
              <Typography data-cy="deleteDashboard" className={classes.btnText}>
                Delete
              </Typography>
            </div>
          </MenuItem>
        </Menu>
      </StyledTableCell>

      <Modal
        open={openModal}
        onClose={() => {
          setConfirm(false);
          setOpenModal(false);
        }}
        width="60%"
        modalActions={
          <ButtonOutlined
            className={classes.closeButton}
            onClick={() => {
              setConfirm(false);
              setOpenModal(false);
            }}
          >
            &#x2715;
          </ButtonOutlined>
        }
      >
        <div className={classes.modal}>
          {confirm === true ? (
            <Typography align="center">
              {success === true ? (
                <img
                  src="/icons/finish.svg"
                  alt="success"
                  className={classes.icon}
                />
              ) : (
                <CrossMarkIcon className={classes.icon} />
              )}
            </Typography>
          ) : (
            <div />
          )}

          {confirm === true ? (
            <Typography
              className={classes.modalHeading}
              align="center"
              variant="h3"
            >
              {success === true
                ? `The dashboard is successfully deleted.`
                : `There was a problem deleting your dashboard.`}
            </Typography>
          ) : (
            <div />
          )}

          {confirm === true ? (
            <Typography
              align="center"
              variant="body1"
              className={classes.modalBody}
            >
              {success === true ? (
                <div>
                  You will see the dashboard deleted in the dashboard table.
                </div>
              ) : (
                <div>
                  Error encountered while deleting the dashboard. Please try
                  again.
                </div>
              )}
            </Typography>
          ) : (
            <div />
          )}

          {success === true && confirm === true ? (
            <ButtonFilled
              variant="success"
              onClick={() => {
                setConfirm(false);
                setOpenModal(false);
                tabs.changeAnalyticsDashboardTabs(2);
                window.location.reload();
              }}
            >
              <div>Back to Kubernetes Dashboard</div>
            </ButtonFilled>
          ) : success === false && confirm === true ? (
            <div className={classes.flexButtons}>
              <ButtonOutlined
                className={classes.buttonOutlineWarning}
                onClick={() => {
                  setOpenModal(false);
                  setMutate(true);
                }}
                disabled={false}
              >
                <div>Try Again</div>
              </ButtonOutlined>

              <ButtonFilled
                variant="success"
                onClick={() => {
                  setConfirm(false);
                  setOpenModal(false);
                  tabs.changeAnalyticsDashboardTabs(2);
                  window.location.reload();
                }}
              >
                <div>Back to Kubernetes Dashboard</div>
              </ButtonFilled>
            </div>
          ) : (
            <div>
              <Typography align="center">
                <img
                  src="/icons/delete_large_icon.svg"
                  alt="delete"
                  className={classes.icon}
                />
              </Typography>

              <Typography
                className={classes.modalHeading}
                align="center"
                variant="h3"
              >
                Are you sure to remove this dashboard?
              </Typography>

              <Typography
                align="center"
                variant="body1"
                className={classes.modalBody}
              >
                The following action cannot be reverted.
              </Typography>

              <div className={classes.flexButtons}>
                <ButtonOutlined
                  onClick={() => {
                    setOpenModal(false);
                    history.push({
                      pathname: '/analytics',
                      search: `?projectID=${projectID}&projectRole=${projectRole}`,
                    });
                  }}
                  disabled={false}
                >
                  <div>No</div>
                </ButtonOutlined>

                <ButtonFilled
                  variant="error"
                  onClick={() => {
                    setConfirm(true);
                    setOpenModal(false);
                    setMutate(true);
                  }}
                >
                  <div>Yes</div>
                </ButtonFilled>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
export default TableData;
