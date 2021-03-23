/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from '@apollo/client';
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { ButtonFilled, GraphMetric, Modal } from 'litmus-ui';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BackButton from '../../components/Button/BackButton';
import Scaffold from '../../containers/layouts/Scaffold';
import {
  LIST_DASHBOARD,
  LIST_DATASOURCE,
  PROM_QUERY,
  WORKFLOW_LIST_DETAILS,
} from '../../graphql';
import { ChaosInformation } from '../../models/dashboardsData';
import {
  DashboardList,
  ListDashboardResponse,
  ListDashboardVars,
  PanelGroupResponse,
} from '../../models/graphql/dashboardsDetails';
import {
  DataSourceList,
  ListDataSourceResponse,
  ListDataSourceVars,
} from '../../models/graphql/dataSourceDetails';
import {
  PrometheusQueryInput,
  PrometheusQueryVars,
  PrometheusResponse,
} from '../../models/graphql/prometheus';
import {
  WorkflowList,
  WorkflowListDataVars,
} from '../../models/graphql/workflowListData';
import useActions from '../../redux/actions';
import * as DashboardActions from '../../redux/actions/dashboards';
import * as DataSourceActions from '../../redux/actions/dataSource';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { ReactComponent as CrossMarkIcon } from '../../svg/crossmark.svg';
import {
  chaosEventDataParserForPrometheus,
  getChaosQueryPromInputAndID,
} from '../../utils/promUtils';
import DashboardPanelGroup from '../../views/AnalyticsDashboard/MonitoringDashboardPage/DashboardPanelGroup';
import useStyles from './styles';

interface SelectedDashboardInformation {
  id: string;
  name: string;
  type: string;
  agentID: string;
  agentName: string;
  dashboardListForAgent: ListDashboardResponse[];
  metaData: ListDashboardResponse[];
  dashboardKey: string;
}

interface PrometheusQueryDataInterface {
  promInput: PrometheusQueryInput;
  chaosInput: string[];
  firstLoad: Boolean;
}

const DashboardPage: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { palette } = useTheme();
  const ACTIVE: string = 'Active';
  const dataSource = useActions(DataSourceActions);
  const dashboard = useActions(DashboardActions);
  // get ProjectID
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );

  const selectedDashboard = useSelector(
    (state: RootState) => state.selectDashboard
  );

  const selectedDataSource = useSelector(
    (state: RootState) => state.selectDataSource
  );

  const [
    selectedDashboardInformation,
    setSelectedDashboardInformation,
  ] = React.useState<SelectedDashboardInformation>({
    id: selectedDashboard.selectedDashboardID ?? '',
    name: selectedDashboard.selectedDashboardName ?? '',
    type: selectedDashboard.selectedDashboardTemplateName ?? '',
    agentID: selectedDashboard.selectedAgentID ?? '',
    agentName: selectedDashboard.selectedAgentName ?? '',
    dashboardListForAgent: [],
    metaData: [],
    dashboardKey: 'Default',
  });
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [refreshRate, setRefreshRate] = React.useState<number>(10000);
  const [dataSourceStatus, setDataSourceStatus] = React.useState<string>(
    'ACTIVE'
  );
  const open = Boolean(anchorEl);
  const [
    prometheusQueryData,
    setPrometheusQueryData,
  ] = React.useState<PrometheusQueryDataInterface>({
    promInput: {
      url: '',
      start: '',
      end: '',
      queries: [],
    },
    chaosInput: [],
    firstLoad: true,
  });
  const [chaosData, setChaosData] = React.useState<Array<GraphMetric>>([]);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Apollo query to get the dashboards data
  const { data: dashboards } = useQuery<DashboardList, ListDashboardVars>(
    LIST_DASHBOARD,
    {
      variables: { projectID: selectedProjectID },
      fetchPolicy: 'no-cache',
    }
  );

  // Apollo query to get the datasources data
  const { data: dataSources } = useQuery<DataSourceList, ListDataSourceVars>(
    LIST_DATASOURCE,
    {
      variables: { projectID: selectedProjectID },
      fetchPolicy: 'no-cache',
    }
  );

  // Apollo query to get the scheduled workflow data
  const { data: analyticsData } = useQuery<WorkflowList, WorkflowListDataVars>(
    WORKFLOW_LIST_DETAILS,
    {
      variables: { projectID: selectedProjectID, workflowIDs: [] },
      fetchPolicy: 'no-cache',
    }
  );

  // Apollo query to get the prometheus data
  useQuery<PrometheusResponse, PrometheusQueryVars>(PROM_QUERY, {
    variables: {
      prometheusInput: prometheusQueryData?.promInput ?? {
        url: '',
        start: '',
        end: '',
        queries: [],
      },
    },
    fetchPolicy: 'no-cache',
    skip:
      prometheusQueryData?.promInput.queries?.length === 0 ||
      prometheusQueryData?.promInput.url === '',
    onCompleted: (eventData) => {
      let chaos_data: Array<GraphMetric> = [];
      chaos_data = chaosEventDataParserForPrometheus(
        eventData,
        prometheusQueryData?.chaosInput,
        palette.error.main
      );
      setChaosData(chaos_data);
    },
  });

  useEffect(() => {
    if (dashboards && dashboards.ListDashboard.length) {
      if (
        selectedDashboardInformation.id !==
        selectedDashboardInformation.dashboardKey
      ) {
        const availableDashboards: ListDashboardResponse[] = dashboards.ListDashboard.filter(
          (data) => {
            return data.cluster_id === selectedDashboardInformation.agentID;
          }
        );
        const selectedDashboard: ListDashboardResponse = availableDashboards.filter(
          (data) => {
            return data.db_id === selectedDashboardInformation.id;
          }
        )[0];
        setSelectedDashboardInformation({
          ...selectedDashboardInformation,
          dashboardListForAgent: availableDashboards,
          metaData: [selectedDashboard],
          dashboardKey: selectedDashboardInformation.id,
        });
      }
    }
  }, [dashboards, selectedDashboardInformation.id]);

  useEffect(() => {
    if (dataSources && dataSources.ListDataSource.length) {
      if (selectedDataSource.selectedDataSourceID === '') {
        dashboard.selectDashboard({
          refreshRate,
        });
        if (
          selectedDashboardInformation.metaData &&
          selectedDashboardInformation.metaData[0] &&
          dataSources.ListDataSource
        ) {
          const selectedDataSource: ListDataSourceResponse = dataSources.ListDataSource.filter(
            (data) => {
              return (
                data.ds_id === selectedDashboardInformation.metaData[0].ds_id
              );
            }
          )[0];
          if (selectedDataSource) {
            dataSource.selectDataSource({
              selectedDataSourceURL: selectedDataSource.ds_url,
              selectedDataSourceID: selectedDataSource.ds_id,
              selectedDataSourceName: selectedDataSource.ds_name,
            });
          }
          if (
            selectedDataSource &&
            selectedDataSource.health_status !== ACTIVE
          ) {
            setDataSourceStatus(selectedDataSource.health_status);
          }
        }
      }
    }
  }, [selectedDashboardInformation.dashboardKey, dataSources]);

  const generateChaosQueries = () => {
    let chaosInformation: ChaosInformation = {
      promQueries: prometheusQueryData.promInput.queries,
      chaosQueryIDs: prometheusQueryData.chaosInput,
    };
    if (prometheusQueryData.firstLoad && analyticsData?.ListWorkflow) {
      chaosInformation = getChaosQueryPromInputAndID(
        analyticsData,
        selectedDashboardInformation.agentID
      );
    }
    setPrometheusQueryData({
      promInput: {
        url: selectedDataSource.selectedDataSourceURL,
        start: `${Math.round(new Date().getTime() / 1000) - 1800}`,
        end: `${Math.round(new Date().getTime() / 1000)}`,
        queries: chaosInformation.promQueries,
      },
      chaosInput: chaosInformation.chaosQueryIDs,
      firstLoad: !analyticsData?.ListWorkflow,
    });
  };

  useEffect(() => {
    setTimeout(() => {
      generateChaosQueries();
    }, selectedDashboard.refreshRate);
  }, [prometheusQueryData]);

  return (
    <Scaffold>
      <div className={classes.rootContainer}>
        <div className={classes.root}>
          <div className={classes.button}>
            <BackButton />
          </div>
          <Typography variant="h3" className={classes.weightedFont}>
            {selectedDashboardInformation.agentName} /{' '}
            <Typography
              variant="h3"
              display="inline"
              className={classes.italic}
            >
              {selectedDashboardInformation.name}
            </Typography>
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={handleClick}
              data-cy="browseDashboardListOptions"
              className={classes.iconButton}
            >
              <KeyboardArrowDownIcon className={classes.dashboardSwitchIcon} />
            </IconButton>
            <Menu
              id="long-menu"
              anchorEl={anchorEl}
              keepMounted
              open={open}
              onClose={handleClose}
            >
              {selectedDashboardInformation.dashboardListForAgent.map(
                (data: ListDashboardResponse) => {
                  return (
                    <MenuItem
                      key={`${data.db_id}-monitoringDashboard`}
                      value={data.db_id}
                      onClick={() => {
                        setSelectedDashboardInformation({
                          ...selectedDashboardInformation,
                          id: data.db_id,
                          name: data.db_name,
                          type: data.db_type,
                        });
                        dataSource.selectDataSource({
                          selectedDataSourceURL: '',
                          selectedDataSourceID: '',
                          selectedDataSourceName: '',
                        });
                        setAnchorEl(null);
                      }}
                      className={classes.menuItem}
                    >
                      <div className={classes.expDiv}>
                        <Typography
                          data-cy="switchDashboard"
                          className={classes.btnText}
                          variant="h6"
                        >
                          {data.db_name}
                        </Typography>
                      </div>
                    </MenuItem>
                  );
                }
              )}
            </Menu>
          </Typography>
          <div className={classes.headerDiv}>
            <Typography
              variant="h5"
              className={`${classes.weightedFont} ${classes.dashboardType}`}
            >
              {selectedDashboardInformation.type}
            </Typography>
          </div>
          <div
            className={classes.analyticsDiv}
            key={selectedDashboardInformation.dashboardKey}
          >
            {selectedDashboardInformation.metaData[0] &&
              selectedDashboardInformation.metaData[0].panel_groups.map(
                (panelGroup: PanelGroupResponse) => (
                  <div
                    key={`${panelGroup.panel_group_id}-dashboardPage-div`}
                    data-cy="dashboardPanelGroup"
                  >
                    <DashboardPanelGroup
                      key={`${panelGroup.panel_group_id}-dashboardPage-component`}
                      panel_group_id={panelGroup.panel_group_id}
                      panel_group_name={panelGroup.panel_group_name}
                      panels={panelGroup.panels}
                      chaos_data={chaosData}
                    />
                  </div>
                )
              )}
          </div>
        </div>
      </div>
      {dataSourceStatus !== 'ACTIVE' ? (
        <Modal open onClose={() => {}} width="60%">
          <div className={classes.modal}>
            <Typography align="center">
              <CrossMarkIcon className={classes.icon} />
            </Typography>
            <Typography
              className={classes.modalHeading}
              align="center"
              variant="h3"
            >
              Data source is {dataSourceStatus}
            </Typography>
            <Typography
              align="center"
              variant="body1"
              className={classes.modalBody}
            >
              {t('analyticsDashboard.monitoringDashboardPage.dataSourceError')}
            </Typography>
            <div className={classes.flexButtons}>
              <ButtonFilled
                variant="success"
                onClick={() => {
                  let dashboardTemplateID: number = -1;
                  if (
                    selectedDashboardInformation.type === 'Kubernetes Platform'
                  ) {
                    dashboardTemplateID = 0;
                  } else if (
                    selectedDashboardInformation.type === 'Sock Shop'
                  ) {
                    dashboardTemplateID = 1;
                  }
                  dashboard.selectDashboard({
                    selectedDashboardID: selectedDashboardInformation.id,
                    selectedDashboardName: selectedDashboardInformation.name,
                    selectedDashboardTemplateID: dashboardTemplateID,
                  });
                  history.push('/analytics/dashboard/configure');
                }}
              >
                {t(
                  'analyticsDashboard.monitoringDashboardPage.reConfigureDashboard'
                )}
              </ButtonFilled>
              <ButtonFilled
                variant="success"
                onClick={() => {
                  history.push('/analytics/datasource/configure');
                }}
              >
                {t(
                  'analyticsDashboard.monitoringDashboardPage.updateDataSource'
                )}
              </ButtonFilled>
            </div>
          </div>
        </Modal>
      ) : (
        <div />
      )}
    </Scaffold>
  );
};

export default DashboardPage;
