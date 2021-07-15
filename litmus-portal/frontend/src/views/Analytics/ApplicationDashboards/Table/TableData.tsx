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
  DeleteDashboardInput,
  ListDashboardResponse,
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
  data: ListDashboardResponse;
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
    React.useState<DeleteDashboardInput>({
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
      selectedAgentID: data.cluster_id,
    });
    return true;
  };

  const getDashboard = () => {
    const panelGroupMap: PanelGroupMap[] = [];
    const panelGroups: PanelGroupExport[] = [];
    data.panel_groups.forEach((panelGroup) => {
      panelGroupMap.push({
        groupName: panelGroup.panel_group_name,
        panels: [],
      });
      const len: number = panelGroupMap.length;
      const selectedPanels: PanelExport[] = [];
      panelGroup.panels.forEach((panel) => {
        panelGroupMap[len - 1].panels.push(panel.panel_name);
        const queries: PromQueryExport[] = [];
        panel.prom_queries.forEach((query) => {
          queries.push({
            prom_query_name: query.prom_query_name,
            legend: query.legend,
            resolution: query.resolution,
            minstep: query.minstep,
            line: query.line,
            close_area: query.close_area,
          });
        });
        const options: PanelOption = {
          points: panel.panel_options.points,
          grids: panel.panel_options.grids,
          left_axis: panel.panel_options.left_axis,
        };
        const selectedPanel: PanelExport = {
          prom_queries: queries,
          panel_options: options,
          panel_name: panel.panel_name,
          y_axis_left: panel.y_axis_left,
          y_axis_right: panel.y_axis_right,
          x_axis_down: panel.x_axis_down,
          unit: panel.unit,
        };
        selectedPanels.push(selectedPanel);
      });
      panelGroups.push({
        panel_group_name: panelGroup.panel_group_name,
        panels: selectedPanels,
      });
    });

    const applicationMetadataMap: ApplicationMetadata[] = [];

    if (data.application_metadata_map) {
      data.application_metadata_map.forEach((applicationMetadata) => {
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
      dashboardID: data.db_type_id,
      name: data.db_name,
      information: data.db_information,
      chaosEventQueryTemplate: data.chaos_event_query_template,
      chaosVerdictQueryTemplate: data.chaos_verdict_query_template,
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
    element.download = `${data.db_name}.json`;
    document.body.appendChild(element);
    element.click();
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
          style={{ maxWidth: '13.5rem' }}
        >
          <img src="./icons/calendarIcon.svg" alt="Calender" />
          {formatDate(data.viewed_at)}
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
            <div className={classes.flexDisplay}>
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
                {t('analyticsDashboard.applicationDashboardTable.configure')}
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
                {t('analyticsDashboard.applicationDashboardTable.json')}
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
