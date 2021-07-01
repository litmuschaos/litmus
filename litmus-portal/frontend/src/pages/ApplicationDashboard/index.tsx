/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from '@apollo/client';
import { IconButton, Menu, MenuItem, Typography } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BackButton from '../../components/Button/BackButton';
import Loader from '../../components/Loader';
import Scaffold from '../../containers/layouts/Scaffold';
import { LIST_DASHBOARD } from '../../graphql';
import {
  PanelNameAndID,
  SelectedDashboardInformation,
} from '../../models/dashboardsData';
import {
  DashboardList,
  ListDashboardResponse,
  ListDashboardVars,
  PanelGroupResponse,
  PanelResponse,
} from '../../models/graphql/dashboardsDetails';
import useActions from '../../redux/actions';
import * as DashboardActions from '../../redux/actions/dashboards';
import * as DataSourceActions from '../../redux/actions/dataSource';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { getProjectID } from '../../utils/getSearchParams';
import ChaosAccordion from '../../views/Analytics/ApplicationDashboard/ChaosAccordion';
import DataSourceInactiveModal from '../../views/Analytics/ApplicationDashboard/DataSourceInactiveModal';
import InfoDropdown from '../../views/Analytics/ApplicationDashboard/InfoDropdown';
import DashboardPanelGroup from '../../views/Analytics/ApplicationDashboard/PanelAndGroup/PanelGroup';
import ToolBar from '../../views/Analytics/ApplicationDashboard/ToolBar';
import TopNavButtons from '../../views/Analytics/ApplicationDashboard/TopNavButtons';
import { ACTIVE } from './constants';
import useStyles from './styles';

const DashboardPage: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dataSource = useActions(DataSourceActions);
  const dashboard = useActions(DashboardActions);
  // get ProjectID
  const projectID = getProjectID();
  const selectedDashboard = useSelector(
    (state: RootState) => state.selectDashboard
  );
  const selectedDataSource = useSelector(
    (state: RootState) => state.selectDataSource
  );

  const [selectedDashboardInformation, setSelectedDashboardInformation] =
    React.useState<SelectedDashboardInformation>({
      id: selectedDashboard.selectedDashboardID ?? '',
      name: '',
      typeName: '',
      typeID: '',
      agentID: selectedDashboard.selectedAgentID ?? '',
      agentName: '',
      urlToIcon: '',
      information: '',
      chaosEventQueryTemplate: '',
      chaosVerdictQueryTemplate: '',
      applicationMetadataMap: [],
      dashboardListForAgent: [],
      metaData: [],
      dashboardKey: 'Default',
      panelNameAndIDList: [],
    });
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [dataSourceStatus, setDataSourceStatus] =
    React.useState<string>('ACTIVE');
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const [isInfoOpen, setIsInfoOpen] = React.useState<Boolean>(false);
  const [isLoading, setIsLoading] = React.useState<Boolean>(true);
  const [selectedPanels, setSelectedPanels] = React.useState<string[]>([]);
  const [selectedApplications, setSelectedApplications] = React.useState<
    string[]
  >([]);

  // Apollo query to get the dashboards data
  const {
    data: dashboards,
    loading: loadingDashboards,
    error: errorFetchingDashboards,
    refetch: refetchDashboards,
  } = useQuery<DashboardList, ListDashboardVars>(LIST_DASHBOARD, {
    variables: {
      projectID,
      clusterID: selectedDashboard.selectedAgentID ?? '',
    },
    fetchPolicy: 'no-cache',
    onCompleted: () => {
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
    notifyOnNetworkStatusChange: true,
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
            metaData: [selectedDashboard],
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
          });
          setSelectedPanels(
            selectedPanelNameAndIDList.map((panel: PanelNameAndID) => panel.id)
          );
          setSelectedApplications([]);
          dashboard.selectDashboard({
            refreshRate: 0,
          });
          dataSource.selectDataSource({
            selectedDataSourceURL: selectedDashboard.ds_url,
            selectedDataSourceID: selectedDashboard.ds_id,
            selectedDataSourceName: selectedDashboard.ds_name,
          });
          if (selectedDashboard.ds_health_status !== ACTIVE) {
            setDataSourceStatus(selectedDashboard.ds_health_status);
          }
        }
      }
    }
  }, [dashboards, selectedDashboardInformation.id]);

  return (
    <Scaffold>
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
              <Typography variant="h4" className={classes.weightedFont}>
                {selectedDashboardInformation.agentName} /{' '}
                <Typography
                  variant="h4"
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
                              typeName: data.db_type_name,
                              typeID: data.db_type_id,
                              urlToIcon: `/icons/${data.db_type_id}_dashboard.svg`,
                              information: data.db_information,
                              chaosEventQueryTemplate:
                                data.chaos_event_query_template,
                              chaosVerdictQueryTemplate:
                                data.chaos_verdict_query_template,
                              applicationMetadataMap:
                                data.application_metadata_map,
                            });
                            dataSource.selectDataSource({
                              selectedDataSourceURL: '',
                              selectedDataSourceID: '',
                              selectedDataSourceName: '',
                            });
                            setAnchorEl(null);
                          }}
                          className={
                            data.db_id === selectedDashboardInformation.id
                              ? classes.menuItemSelected
                              : classes.menuItem
                          }
                        >
                          <div className={classes.expDiv}>
                            <Typography
                              data-cy="switchDashboard"
                              className={`${classes.btnText} ${classes.italic}`}
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
                  dataSourceName: selectedDataSource.selectedDataSourceName,
                  dataSourceURL: selectedDataSource.selectedDataSourceURL,
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
            <ToolBar />
            <div
              className={classes.analyticsDiv}
              key={selectedDashboardInformation.dashboardKey}
            >
              <div className={classes.chaosTableSection}>
                <ChaosAccordion
                  dashboardKey={selectedDashboardInformation.dashboardKey}
                  chaosEventsToBeShown={[]}
                  postEventSelectionRoutine={postEventSelectionRoutine}
                />
              </div>
              {selectedDashboardInformation.metaData[0] &&
                selectedDashboardInformation.metaData[0].panel_groups.length >
                  0 &&
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
                        selectedPanels={selectedPanels}
                        selectedApplications={selectedApplications}
                      />
                    </div>
                  )
                )}
            </div>
          </div>
        )}
      </div>
      {dataSourceStatus !== 'ACTIVE' ? (
        <DataSourceInactiveModal
          dataSourceStatus={dataSourceStatus}
          dashboardID={selectedDashboardInformation.id}
        />
      ) : (
        <div />
      )}
    </Scaffold>
  );
};

export default DashboardPage;
