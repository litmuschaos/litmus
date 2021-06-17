/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from '@apollo/client';
import { IconButton, Menu, MenuItem, Typography } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import BackButton from '../../components/Button/BackButton';
import Scaffold from '../../containers/layouts/Scaffold';
import { LIST_DASHBOARD, LIST_DATASOURCE } from '../../graphql';
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
import {
  DataSourceList,
  ListDataSourceResponse,
  ListDataSourceVars,
} from '../../models/graphql/dataSourceDetails';
import useActions from '../../redux/actions';
import * as DashboardActions from '../../redux/actions/dashboards';
import * as DataSourceActions from '../../redux/actions/dataSource';
import { RootState } from '../../redux/reducers';
import { getProjectID } from '../../utils/getSearchParams';
import DataSourceInactiveModal from '../../views/Analytics/ApplicationDashboard/DataSourceInactiveModal';
import InfoDropdown from '../../views/Analytics/ApplicationDashboard/InfoDropdown';
import DashboardPanelGroup from '../../views/Analytics/ApplicationDashboard/Panel/DashboardPanelGroup';
import ToolBar from '../../views/Analytics/ApplicationDashboard/ToolBar';
import TopNavButtons from '../../views/Analytics/ApplicationDashboard/TopNavButtons';
import { ACTIVE } from './constants';
import useStyles from './styles';

const DashboardPage: React.FC = () => {
  const classes = useStyles();
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

  const [
    selectedDashboardInformation,
    setSelectedDashboardInformation,
  ] = React.useState<SelectedDashboardInformation>({
    id: selectedDashboard.selectedDashboardID ?? '',
    name: '',
    typeName: '',
    typeID: '',
    agentID: '',
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
  const [dataSourceStatus, setDataSourceStatus] = React.useState<string>(
    'ACTIVE'
  );
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [isInfoOpen, setIsInfoOpen] = React.useState<Boolean>(false);
  const [selectedPanels, setSelectedPanels] = React.useState<string[]>([]);

  // Apollo query to get the dashboards data
  const { data: dashboards } = useQuery<DashboardList, ListDashboardVars>(
    LIST_DASHBOARD,
    {
      variables: { projectID },
      fetchPolicy: 'no-cache',
    }
  );

  // Apollo query to get the datasources data
  const { data: dataSources } = useQuery<DataSourceList, ListDataSourceVars>(
    LIST_DATASOURCE,
    {
      variables: { projectID },
      fetchPolicy: 'no-cache',
    }
  );

  useEffect(() => {
    if (dashboards && dashboards.ListDashboard.length) {
      if (
        selectedDashboardInformation.id !==
        selectedDashboardInformation.dashboardKey
      ) {
        const selectedDashboard: ListDashboardResponse = dashboards.ListDashboard.filter(
          (data) => {
            return data.db_id === selectedDashboardInformation.id;
          }
        )[0];
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
        }
        const availableDashboards: ListDashboardResponse[] = selectedDashboard
          ? dashboards.ListDashboard.filter((data) => {
              return data.cluster_id === selectedDashboard.cluster_id;
            })
          : [];
        if (selectedDashboard) {
          setSelectedDashboardInformation({
            ...selectedDashboardInformation,
            dashboardListForAgent: availableDashboards,
            metaData: [selectedDashboard],
            dashboardKey: selectedDashboardInformation.id,
            panelNameAndIDList: selectedPanelNameAndIDList,
            name: selectedDashboard.db_name,
            typeName: selectedDashboard.db_type_name,
            typeID: selectedDashboard.db_type_id,
            agentID: selectedDashboard.cluster_id,
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
        }
      }
    }
  }, [dashboards, selectedDashboardInformation.id]);

  useEffect(() => {
    if (dataSources && dataSources.ListDataSource.length) {
      dashboard.selectDashboard({
        refreshRate: 0,
      });
      if (selectedDataSource.selectedDataSourceID === '') {
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

  return (
    <Scaffold>
      <div className={classes.rootContainer}>
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
              switchIsInfoToggled={(toggleState: Boolean) => {
                setIsInfoOpen(toggleState);
              }}
              dashboardData={selectedDashboardInformation}
              dashboardTypeID={selectedDashboardInformation.typeID}
            />
          </div>
          {isInfoOpen && (
            <InfoDropdown
              dashboardConfigurationDetails={{
                name: selectedDashboardInformation.name,
                typeID: selectedDashboardInformation.typeID,
                dataSourceName: selectedDataSource.selectedDataSourceName,
                dataSourceURL: selectedDataSource.selectedDataSourceURL,
                agentName: selectedDashboardInformation.agentName,
              }}
              metricsToBeShown={selectedDashboardInformation.panelNameAndIDList}
              applicationsToBeShown={[]}
              postPanelSelectionRoutine={(selectedPanelList: string[]) => {
                setSelectedPanels(selectedPanelList);
              }}
              postApplicationSelectionRoutine={(
                selectedApplicationList: string[]
              ) => {}}
            />
          )}
          <ToolBar />
          <div
            className={classes.analyticsDiv}
            key={selectedDashboardInformation.dashboardKey}
          >
            {/* <div className={classes.chaosTableSection}>
              <ChaosAccordion
                dashboardKey={selectedDashboardInformation.dashboardKey}
                chaosEventsToBeShown={prometheusQueryData?.chaosEventsToBeShown}
                postEventSelectionRoutine={postEventSelectionRoutine}
              />
            </div> */}
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
                    />
                  </div>
                )
              )}
          </div>
        </div>
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
