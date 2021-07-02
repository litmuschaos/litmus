/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery, useSubscription } from '@apollo/client';
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { BrushPostitionProps, ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BackButton from '../../components/Button/BackButton';
import Loader from '../../components/Loader';
import Scaffold from '../../containers/layouts/Scaffold';
import { LIST_DASHBOARD, VIEW_DASHBOARD } from '../../graphql';
import {
  PanelNameAndID,
  ParsedChaosEventPrometheusData,
  QueryMapForPanelGroup,
  RangeType,
  SelectedDashboardInformation,
} from '../../models/dashboardsData';
import {
  DashboardList,
  ListDashboardResponse,
  ListDashboardVars,
  PanelGroupResponse,
  PanelResponse,
} from '../../models/graphql/dashboardsDetails';
import {
  ViewDashboard,
  ViewDashboardInput,
} from '../../models/graphql/prometheus';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { getProjectID } from '../../utils/getSearchParams';
import {
  ChaosEventDataParserForPrometheus,
  generatePromQueries,
} from '../../utils/promUtils';
import ChaosAccordion from '../../views/Analytics/ApplicationDashboard/ChaosAccordion';
import DataSourceInactiveModal from '../../views/Analytics/ApplicationDashboard/DataSourceInactiveModal';
import InfoDropdown from '../../views/Analytics/ApplicationDashboard/InfoDropdown';
import DashboardPanelGroup from '../../views/Analytics/ApplicationDashboard/PanelAndGroup/PanelGroup';
import ToolBar from '../../views/Analytics/ApplicationDashboard/ToolBar';
import TopNavButtons from '../../views/Analytics/ApplicationDashboard/TopNavButtons';
import {
  ACTIVE,
  DEFAULT_REFRESH_RATE,
  DEFAULT_RELATIVE_TIME_RANGE,
  MAX_REFRESH_RATE,
  PROMETHEUS_ERROR_QUERY_RESOLUTION_LIMIT_REACHED,
} from './constants';
import useStyles from './styles';

interface PromData {
  chaosEventData: ParsedChaosEventPrometheusData;
  panelGroupQueryMap: QueryMapForPanelGroup[];
}

const DashboardPage: React.FC = () => {
  const { palette } = useTheme();
  const classes = useStyles();
  const { t } = useTranslation();
  const areaGraph: string[] = palette.graph.area;
  const projectID = getProjectID();
  const selectedDashboard = useSelector(
    (state: RootState) => state.selectDashboard
  );

  const [selectedDashboardInformation, setSelectedDashboardInformation] =
    React.useState<SelectedDashboardInformation>({
      id: selectedDashboard.selectedDashboardID,
      name: '',
      typeName: '',
      typeID: '',
      agentID: selectedDashboard.selectedAgentID,
      agentName: '',
      urlToIcon: '',
      information: '',
      chaosEventQueryTemplate: '',
      chaosVerdictQueryTemplate: '',
      applicationMetadataMap: [],
      dashboardListForAgent: [],
      metaData: undefined,
      dashboardKey: 'Default',
      panelNameAndIDList: [],
      dataSourceURL: '',
      dataSourceID: '',
      dataSourceName: '',
      promQueries: [],
      range: {
        startDate: '',
        endDate: '',
      },
      relativeTime: DEFAULT_RELATIVE_TIME_RANGE,
      refreshInterval: DEFAULT_REFRESH_RATE,
    });
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [dataSourceStatus, setDataSourceStatus] =
    React.useState<string>(ACTIVE);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const [centralBrushPosition, setCentralBrushPosition] =
    React.useState<BrushPostitionProps>();
  const [centralAllowGraphUpdate, setCentralAllowGraphUpdate] =
    React.useState(true);
  const [isInfoOpen, setIsInfoOpen] = React.useState<Boolean>(false);
  const [isLoading, setIsLoading] = React.useState<Boolean>(true);
  const [selectedPanels, setSelectedPanels] = React.useState<string[]>([]);
  const [selectedApplications, setSelectedApplications] = React.useState<
    string[]
  >([]);
  const [reFetch, setReFetch] = React.useState<Boolean>(false);
  const [promData, setPromData] = React.useState<PromData>({
    chaosEventData: {
      chaosData: [],
      chaosEventDetails: [],
    },
    panelGroupQueryMap: [],
  });

  const {
    data: dashboards,
    loading: loadingDashboards,
    error: errorFetchingDashboards,
    refetch: refetchDashboards,
  } = useQuery<DashboardList, ListDashboardVars>(LIST_DASHBOARD, {
    variables: {
      projectID,
      clusterID: selectedDashboard.selectedAgentID,
    },
    skip:
      selectedDashboard.selectedDashboardID === '' ||
      selectedDashboard.selectedAgentID === '',
    fetchPolicy: 'no-cache',
    onCompleted: () => {
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
    notifyOnNetworkStatusChange: true,
  });

  const { error: errorFetchingDashboardQueries } = useSubscription<
    ViewDashboard,
    ViewDashboardInput
  >(VIEW_DASHBOARD, {
    variables: {
      prometheusQueries: selectedDashboardInformation.promQueries,
      dataVarMap: {
        url: selectedDashboardInformation.dataSourceURL,
        start: selectedDashboardInformation.range.startDate,
        end: selectedDashboardInformation.range.endDate,
        relative_time: selectedDashboardInformation.relativeTime,
        refresh_interval: selectedDashboardInformation.refreshInterval,
      },
    },
    skip:
      loadingDashboards ||
      errorFetchingDashboards !== undefined ||
      selectedDashboardInformation.promQueries.length === 0 ||
      selectedDashboardInformation.dataSourceURL === '' ||
      (selectedDashboardInformation.range.startDate === '' &&
        selectedDashboardInformation.range.endDate === '' &&
        selectedDashboardInformation.refreshInterval === 0),
    shouldResubscribe: () => {
      if (reFetch) {
        setReFetch(false);
        return true;
      }
      return false;
    },
    fetchPolicy: 'no-cache',
    onSubscriptionData: (subscriptionUpdate) => {
      const prometheusResponse =
        subscriptionUpdate.subscriptionData.data?.viewDashboard;
      const metricDataFromPrometheus =
        prometheusResponse?.metricsResponse ?? [];
      const mappedData: QueryMapForPanelGroup[] = [];
      if (
        selectedDashboardInformation.metaData &&
        selectedDashboardInformation.metaData.panel_groups.length > 0
      ) {
        selectedDashboardInformation.metaData.panel_groups.forEach(
          (panelGroup, index) => {
            mappedData.push({
              panelGroupID: panelGroup.panel_group_id,
              metricDataForGroup: [],
            });
            panelGroup.panels.forEach((panel) => {
              const queryIDs = panel.prom_queries.map((query) => query.queryid);
              const metricDataForPanel = metricDataFromPrometheus.filter(
                (data) => queryIDs.includes(data.queryid)
              );
              mappedData[index].metricDataForGroup.push({
                panelID: panel.panel_id,
                metricDataForPanel,
              });
            });
          }
        );
      }
      setPromData({
        chaosEventData: ChaosEventDataParserForPrometheus(
          prometheusResponse?.annotationsResponse ?? [],
          areaGraph
        ),
        panelGroupQueryMap: mappedData,
      });
    },
  });

  const postEventSelectionRoutine = (selectedEvents: string[]) => {};

  useEffect(() => {
    if (
      dashboards &&
      dashboards.ListDashboard &&
      dashboards.ListDashboard.length
    ) {
      if (
        selectedDashboardInformation.id !==
        selectedDashboardInformation.dashboardKey
      ) {
        const selectedDashboard: ListDashboardResponse =
          dashboards.ListDashboard.filter((data) => {
            return data.db_id === selectedDashboardInformation.id;
          })[0];
        const selectedPanelNameAndIDList: PanelNameAndID[] = [];
        if (selectedDashboard) {
          (selectedDashboard.panel_groups ?? []).forEach(
            (panelGroup: PanelGroupResponse) => {
              (panelGroup.panels ?? []).forEach((panel: PanelResponse) => {
                selectedPanelNameAndIDList.push({
                  name: panel.panel_name,
                  id: panel.panel_id,
                });
              });
            }
          );
          setSelectedDashboardInformation({
            ...selectedDashboardInformation,
            dashboardListForAgent: selectedDashboard
              ? dashboards.ListDashboard
              : [],
            metaData: selectedDashboard,
            dashboardKey: selectedDashboardInformation.id,
            panelNameAndIDList: selectedPanelNameAndIDList,
            name: selectedDashboard.db_name,
            typeName: selectedDashboard.db_type_name,
            typeID: selectedDashboard.db_type_id,
            agentName: selectedDashboard.cluster_name,
            urlToIcon: `/icons/${selectedDashboard.db_type_id}_dashboard.svg`,
            information: selectedDashboard.db_information,
            chaosEventQueryTemplate:
              selectedDashboard.chaos_event_query_template,
            chaosVerdictQueryTemplate:
              selectedDashboard.chaos_verdict_query_template,
            applicationMetadataMap: selectedDashboard.application_metadata_map,
            dataSourceURL: selectedDashboard.ds_url,
            dataSourceID: selectedDashboard.ds_id,
            dataSourceName: selectedDashboard.ds_name,
            promQueries: generatePromQueries(
              selectedDashboardInformation.range,
              selectedDashboard.panel_groups,
              selectedDashboard.chaos_event_query_template,
              selectedDashboard.chaos_verdict_query_template
            ),
          });
          setSelectedPanels(
            selectedPanelNameAndIDList.map((panel: PanelNameAndID) => panel.id)
          );
          setSelectedApplications([]);
          if (selectedDashboard.ds_health_status !== ACTIVE) {
            setDataSourceStatus(selectedDashboard.ds_health_status);
          }
        }
        setReFetch(true);
      }
    }
  }, [dashboards, selectedDashboardInformation.id]);

  useEffect(() => {
    if (
      errorFetchingDashboardQueries &&
      errorFetchingDashboardQueries.message ===
        PROMETHEUS_ERROR_QUERY_RESOLUTION_LIMIT_REACHED
    ) {
      if (selectedDashboardInformation.refreshInterval !== MAX_REFRESH_RATE) {
        setSelectedDashboardInformation({
          ...selectedDashboardInformation,
          refreshInterval: MAX_REFRESH_RATE,
        });
      }
    }
  }, [errorFetchingDashboardQueries]);

  return (
    <Scaffold>
      {errorFetchingDashboards ||
        selectedDashboard.selectedDashboardID === '' ||
        (selectedDashboard.selectedAgentID === '' && <BackButton />)}
      <div className={classes.rootContainer}>
        {isLoading || loadingDashboards ? (
          <div className={classes.center}>
            <Loader />
            <Typography className={classes.loading}>
              {t('analyticsDashboard.monitoringDashboardPage.loadingText')}
            </Typography>
          </div>
        ) : errorFetchingDashboards ? (
          <div className={classes.center}>
            <Typography className={classes.error}>
              {t('analyticsDashboard.monitoringDashboardPage.errorText')}
            </Typography>
            <div className={classes.flexButtons}>
              <ButtonOutlined
                onClick={() => {
                  setIsLoading(true);
                  refetchDashboards();
                }}
                className={classes.flexButton}
                variant="highlight"
              >
                <Typography>
                  {t('analyticsDashboard.monitoringDashboardPage.tryAgain')}
                </Typography>
              </ButtonOutlined>
              <ButtonFilled
                onClick={() => history.goBack()}
                className={classes.flexButton}
                variant="error"
              >
                <Typography>
                  {t('analyticsDashboard.monitoringDashboardPage.goBack')}
                </Typography>
              </ButtonFilled>
            </div>
          </div>
        ) : (
          <div className={classes.root}>
            <div className={classes.button}>
              <BackButton />
            </div>

            <div className={classes.controlsDiv}>
              <Typography variant="h4" style={{ fontWeight: 500 }}>
                {selectedDashboardInformation.agentName} /{' '}
                <Typography
                  variant="h4"
                  display="inline"
                  style={{ fontStyle: 'italic' }}
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
                  <KeyboardArrowDownIcon
                    className={classes.dashboardSwitchIcon}
                  />
                </IconButton>
                <Menu
                  id="long-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={open}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  getContentAnchorEl={null}
                  classes={{ paper: classes.menuList }}
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
                            });
                            setAnchorEl(null);
                          }}
                          className={classes.menuItem}
                        >
                          <div style={{ display: 'flex' }}>
                            <Typography
                              data-cy="switchDashboard"
                              className={classes.btnText}
                              variant="h5"
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

              <TopNavButtons
                isInfoToggledState={isInfoOpen}
                switchIsInfoToggled={(toggleState: Boolean) =>
                  setIsInfoOpen(toggleState)
                }
                dashboardData={selectedDashboardInformation}
                dashboardTypeID={selectedDashboardInformation.typeID}
              />
            </div>
            {isInfoOpen && (
              <InfoDropdown
                dashboardConfigurationDetails={{
                  name: selectedDashboardInformation.name,
                  typeID: selectedDashboardInformation.typeID,
                  typeName: selectedDashboardInformation.typeName,
                  dataSourceName: selectedDashboardInformation.dataSourceName,
                  dataSourceURL: selectedDashboardInformation.dataSourceURL,
                  agentName: selectedDashboardInformation.agentName,
                }}
                metricsToBeShown={
                  selectedDashboardInformation.panelNameAndIDList
                }
                applicationsToBeShown={
                  selectedDashboardInformation.applicationMetadataMap
                }
                postPanelSelectionRoutine={(selectedPanelList: string[]) =>
                  setSelectedPanels(selectedPanelList)
                }
                postApplicationSelectionRoutine={(
                  selectedApplicationList: string[]
                ) => setSelectedApplications(selectedApplicationList)}
              />
            )}
            <ToolBar
              refreshInterval={selectedDashboardInformation.refreshInterval}
              handleRangeChange={(range: RangeType) => {
                setSelectedDashboardInformation({
                  ...selectedDashboardInformation,
                  range,
                  promQueries: generatePromQueries(
                    range,
                    selectedDashboardInformation.metaData?.panel_groups ?? [],
                    selectedDashboardInformation.chaosEventQueryTemplate,
                    selectedDashboardInformation.chaosVerdictQueryTemplate
                  ),
                });
                setReFetch(true);
              }}
              handleRefreshRateChange={(refreshRate: number) => {
                setSelectedDashboardInformation({
                  ...selectedDashboardInformation,
                  refreshInterval: refreshRate,
                });
                setReFetch(true);
              }}
              handleForceUpdate={() => setReFetch(true)}
            />
            <div
              className={classes.analyticsDiv}
              key={selectedDashboardInformation.dashboardKey}
            >
              <div className={classes.chaosTableSection}>
                <ChaosAccordion
                  dashboardKey={selectedDashboardInformation.dashboardKey}
                  chaosEventsToBeShown={
                    promData.chaosEventData.chaosEventDetails
                  }
                  postEventSelectionRoutine={postEventSelectionRoutine}
                />
              </div>
              {selectedDashboardInformation.metaData &&
                selectedDashboardInformation.metaData.panel_groups.length > 0 &&
                selectedDashboardInformation.metaData.panel_groups.map(
                  (panelGroup: PanelGroupResponse, index) => (
                    <div
                      key={`${panelGroup.panel_group_id}-dashboardPage-div`}
                      data-cy="dashboardPanelGroup"
                    >
                      <DashboardPanelGroup
                        key={`${panelGroup.panel_group_id}-dashboardPage-component`}
                        centralAllowGraphUpdate={centralAllowGraphUpdate}
                        handleCentralAllowGraphUpdate={(value: boolean) =>
                          setCentralAllowGraphUpdate(value)
                        }
                        centralBrushPosition={centralBrushPosition}
                        handleCentralBrushPosition={(
                          newBrushPosition: BrushPostitionProps
                        ) => setCentralBrushPosition(newBrushPosition)}
                        panel_group_id={panelGroup.panel_group_id}
                        panel_group_name={panelGroup.panel_group_name}
                        panels={panelGroup.panels}
                        selectedPanels={selectedPanels}
                        selectedApplications={selectedApplications}
                        metricDataForGroup={
                          promData.panelGroupQueryMap[index]
                            ? promData.panelGroupQueryMap[index]
                                .metricDataForGroup
                            : []
                        }
                        chaosData={promData.chaosEventData.chaosData}
                      />
                    </div>
                  )
                )}
            </div>
          </div>
        )}
      </div>
      {dataSourceStatus !== ACTIVE && (
        <DataSourceInactiveModal
          dataSourceStatus={dataSourceStatus}
          dashboardID={selectedDashboardInformation.id}
        />
      )}
    </Scaffold>
  );
};

export default DashboardPage;
