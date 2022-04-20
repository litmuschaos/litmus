import { useMutation } from '@apollo/client';
import { IconButton, Menu, MenuItem, Typography } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { ButtonFilled, Modal, TextButton } from 'litmus-ui';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DELETE_DASHBOARD } from '../../../../graphql/mutations';
import {
  DashboardExport,
  PanelExport,
  PanelGroupExport,
  PanelGroupMap,
  PromQueryExport,
} from '../../../../models/dashboardsData';
import {
  ApplicationMetadata,
  DeleteDashboardRequest,
  GetDashboardResponse,
  PanelOption,
  Resource,
} from '../../../../models/graphql/dashboardsDetails';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import { history } from '../../../../redux/configureStore';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import useStyles, { StyledTableCell } from './styles';

interface TableDataProps {
  data: GetDashboardResponse;
  alertStateHandler: (successState: boolean) => void;
}

const TableData: React.FC<TableDataProps> = ({ data, alertStateHandler }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dashboard = useActions(DashboardActions);
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const [mutate, setMutate] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [dashboardSelectedForDeleting, setDashboardSelectedForDeleting] =
    React.useState<DeleteDashboardRequest>({
      projectID: '',
      dbID: '',
    });
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('dddd, DD MMM YYYY, HH:mm');
    return resDate;
  };

  const [deleteDashboard] = useMutation<boolean, DeleteDashboardRequest>(
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
      selectedDashboardID: data.dbID,
      selectedAgentID: data.clusterID,
    });
    return true;
  };

  const getDashboard = () => {
    const panelGroupMap: PanelGroupMap[] = [];
    const panelGroups: PanelGroupExport[] = [];
    data.panelGroups.forEach((panelGroup) => {
      panelGroupMap.push({
        groupName: panelGroup.panelGroupName,
        panels: [],
      });
      const len: number = panelGroupMap.length;
      const selectedPanels: PanelExport[] = [];
      panelGroup.panels.forEach((panel) => {
        panelGroupMap[len - 1].panels.push(panel.panelName);
        const queries: PromQueryExport[] = [];
        panel.promQueries.forEach((query) => {
          queries.push({
            prom_query_name: query.promQueryName,
            legend: query.legend,
            resolution: query.resolution,
            minstep: query.minstep,
            line: query.line,
            close_area: query.closeArea,
          });
        });
        const options: PanelOption = {
          points: panel.panelOptions.points,
          grids: panel.panelOptions.grids,
          leftAxis: panel.panelOptions.leftAxis,
        };
        const selectedPanel: PanelExport = {
          prom_queries: queries,
          panel_options: options,
          panel_name: panel.panelName,
          y_axis_left: panel.yAxisLeft,
          y_axis_right: panel.yAxisRight,
          x_axis_down: panel.xAxisDown,
          unit: panel.unit,
        };
        selectedPanels.push(selectedPanel);
      });
      panelGroups.push({
        panel_group_name: panelGroup.panelGroupName,
        panels: selectedPanels,
      });
    });

    const applicationMetadataMap: ApplicationMetadata[] = [];

    if (data.applicationMetadataMap) {
      data.applicationMetadataMap.forEach((applicationMetadata) => {
        const applications: Resource[] = [];

        applicationMetadata.applications.forEach((application) => {
          applications.push({
            kind: application.kind,
            names: application.names,
          });
        });
        applicationMetadataMap.push({
          namespace: applicationMetadata.namespace,
          applications,
        });
      });
    }

    const exportedDashboard: DashboardExport = {
      dashboardID:
        data.dbTypeID !== 'custom' ? data.dbTypeID : 'custom-downloaded',
      name: data.dbName,
      information: data.dbInformation,
      chaosEventQueryTemplate: data.chaosEventQueryTemplate,
      chaosVerdictQueryTemplate: data.chaosVerdictQueryTemplate,
      applicationMetadataMap,
      panelGroupMap,
      panelGroups,
    };

    return exportedDashboard;
  };

  // Function to download the JSON
  const downloadJSON = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(getDashboard(), null, 2)], {
      type: 'text/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${data.dbName}.json`;
    document.body.appendChild(element);
    element.click();
  };

  useEffect(() => {
    if (mutate === true) {
      deleteDashboard({
        variables: {
          projectID: getProjectID(),
          dbID: dashboardSelectedForDeleting.dbID,
        },
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
                pathname: '/observability/monitoring-dashboard',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            });
          }}
        >
          {data.dbName}
        </Typography>
      </StyledTableCell>

      <StyledTableCell className={classes.dividerPadding}>
        <Typography
          className={classes.tableObjects}
          style={{ maxWidth: '5rem' }}
        >
          {data.clusterName}
        </Typography>
      </StyledTableCell>

      <StyledTableCell>
        <Typography
          className={classes.tableObjects}
          style={{ maxWidth: '7rem' }}
        >
          <img
            src={`./icons/${
              data.dbTypeID.includes('custom') ? 'custom' : data.dbTypeID
            }_dashboard.svg`}
            alt={data.dbTypeName}
            className={classes.inlineTypeIcon}
          />
          {data.dbTypeName}
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
          {data.dsType}
        </Typography>
      </StyledTableCell>

      <StyledTableCell>
        <Typography
          className={classes.tableObjects}
          style={{ maxWidth: '13.5rem' }}
        >
          <img src="./icons/calendarIcon.svg" alt="Calender" />
          {formatDate(data.viewedAt)}
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
                  pathname: '/observability/monitoring-dashboard',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              });
            }}
            className={classes.menuItem}
          >
            <div className={classes.flexDisplay}>
              <img
                src="./icons/viewDashboard.svg"
                alt="View"
                className={classes.btnImg}
              />
              <Typography data-cy="openDashboard" className={classes.btnText}>
                {t('monitoringDashboard.monitoringDashboardTable.view')}
              </Typography>
            </div>
          </MenuItem>

          <MenuItem
            value="Configure"
            onClick={() => {
              dashboard.selectDashboard({
                selectedDashboardID: data.dbID,
                activePanelID: '',
              });
              history.push({
                pathname: '/observability/dashboard/configure',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
            className={classes.menuItem}
          >
            <div className={classes.flexDisplay}>
              <img
                src="./icons/cogwheel.svg"
                alt="Configure"
                className={classes.btnImg}
              />
              <Typography
                data-cy="configureDashboard"
                className={classes.btnText}
              >
                {t('monitoringDashboard.monitoringDashboardTable.configure')}
              </Typography>
            </div>
          </MenuItem>

          <MenuItem
            value="Download"
            onClick={() => downloadJSON()}
            className={classes.menuItem}
          >
            <div className={classes.flexDisplay}>
              <img
                src="./icons/download-dashboard.svg"
                alt="JSON"
                className={classes.btnImg}
              />
              <Typography
                data-cy="downloadDashboard"
                className={classes.btnText}
              >
                {t('monitoringDashboard.monitoringDashboardTable.json')}
              </Typography>
            </div>
          </MenuItem>

          <MenuItem
            value="Delete"
            onClick={() => {
              setDashboardSelectedForDeleting({
                projectID: getProjectID(),
                dbID: data.dbID,
              });
              setOpenModal(true);
              handleClose();
            }}
            className={classes.menuItem}
          >
            <div className={classes.flexDisplay}>
              <img
                src="./icons/delete.svg"
                alt="Delete"
                className={classes.btnImg}
              />
              <Typography
                data-cy="deleteDashboard"
                className={`${classes.btnText} ${classes.deleteText}`}
              >
                {t('monitoringDashboard.monitoringDashboardTable.delete')}
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
        data-cy="removeDashboardModal"
      >
        <div className={classes.modal}>
          <Typography className={classes.modalHeading} align="left">
            {t(
              'monitoringDashboard.monitoringDashboardTable.modal.removeDashboard'
            )}
          </Typography>

          <Typography className={classes.modalBodyText} align="left">
            {t(
              'monitoringDashboard.monitoringDashboardTable.modal.removeDashboardConfirmation'
            )}
            <b>
              <i>{` ${data.dbName} `}</i>
            </b>
            ?
          </Typography>

          <div
            className={classes.flexButtons}
            data-cy="removeDashboardModalButtons"
          >
            <TextButton
              onClick={() => setOpenModal(false)}
              className={classes.cancelButton}
            >
              <Typography className={classes.buttonText}>
                {t('monitoringDashboard.monitoringDashboardTable.modal.cancel')}
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
                {t('monitoringDashboard.monitoringDashboardTable.modal.delete')}
              </Typography>
            </ButtonFilled>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default TableData;
