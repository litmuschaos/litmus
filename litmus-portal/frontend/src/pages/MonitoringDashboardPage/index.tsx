/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from '@apollo/client';
import {
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@material-ui/core';
import AutorenewOutlinedIcon from '@material-ui/icons/AutorenewOutlined';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import WatchLaterRoundedIcon from '@material-ui/icons/WatchLaterRounded';
import { ButtonOutlined } from 'litmus-ui';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BackButton from '../../components/Button/BackButton';
import DateRangeSelector from '../../components/DateRangeSelector';
import Scaffold from '../../containers/layouts/Scaffold';
import { LIST_DASHBOARD, LIST_DATASOURCE } from '../../graphql';
import { PanelNameAndID } from '../../models/dashboardsData';
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
import DataSourceInactiveModal from '../../views/AnalyticsDashboard/MonitoringDashboardPage/DataSourceInactiveModal';
import InfoDropdown from '../../views/AnalyticsDashboard/MonitoringDashboardPage/InfoDropdown';
import DashboardPanelGroup from '../../views/AnalyticsDashboard/MonitoringDashboardPage/Panel/DashboardPanelGroup';
import TopNavButtons from '../../views/AnalyticsDashboard/MonitoringDashboardPage/TopNavButtons';
import {
  ACTIVE,
  DEFAULT_REFRESH_RATE,
  DEFAULT_TOLERANCE_LIMIT,
  MAX_REFRESH_RATE,
  MINIMUM_TOLERANCE_LIMIT,
} from './constants';
import refreshData from './refreshData';
import useStyles, { useOutlinedInputStyles } from './styles';

interface SelectedDashboardInformation {
  id: string;
  name: string;
  type: string;
  agentID: string;
  agentName: string;
  dashboardListForAgent: ListDashboardResponse[];
  metaData: ListDashboardResponse[];
  dashboardKey: string;
  selectionOverride: Boolean;
  panelNameAndIDList: PanelNameAndID[];
}

interface RefreshObjectType {
  label: string;
  value: number;
}

const DashboardPage: React.FC = () => {
  const classes = useStyles();
  const outlinedInputClasses = useOutlinedInputStyles();
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
    selectionOverride: false,
    panelNameAndIDList: [],
  });
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [refreshRate, setRefreshRate] = React.useState<number>(
    selectedDashboard.refreshRate ? selectedDashboard.refreshRate : 0
  );
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
  const dateRangeSelectorRef = React.useRef<HTMLButtonElement>(null);
  const [
    isDateRangeSelectorPopoverOpen,
    setDateRangeSelectorPopoverOpen,
  ] = React.useState(false);
  const [isInfoOpen, setIsInfoOpen] = React.useState<Boolean>(false);
  const [selectedPanels, setSelectedPanels] = React.useState<string[]>([]);

  const clearTimeOuts = async () => {
    let id = window.setTimeout(() => {}, 0);
    while (id--) {
      window.clearTimeout(id);
    }

    return Promise.resolve(id === 0);
  };

  const CallbackFromRangeSelector = (
    selectedStartDate: string,
    selectedEndDate: string
  ) => {
    const startDateFormatted: string = moment(selectedStartDate).format();
    const endDateFormatted: string = moment(selectedEndDate)
      .add(23, 'hours')
      .add(59, 'minutes')
      .add(59, 'seconds')
      .format();
    dashboard.selectDashboard({
      range: { startDate: startDateFormatted, endDate: endDateFormatted },
    });
    const endDate: number =
      new Date(moment(endDateFormatted).format()).getTime() / 1000;
    const now: number = Math.round(new Date().getTime() / 1000);
    const diff: number = Math.abs(now - endDate);
    const maxLim: number =
      (selectedDashboard.refreshRate ?? DEFAULT_REFRESH_RATE) / 1000 !== 0
        ? (selectedDashboard.refreshRate ?? DEFAULT_REFRESH_RATE) / 1000 +
          MINIMUM_TOLERANCE_LIMIT
        : DEFAULT_TOLERANCE_LIMIT;
    if (
      !(diff >= 0 && diff <= maxLim) &&
      selectedDashboard.refreshRate !== MAX_REFRESH_RATE
    ) {
      clearTimeOuts().then(() => {
        setRefreshRate(MAX_REFRESH_RATE);
      });
    }
  };
  const [openRefresh, setOpenRefresh] = React.useState(false);
  const handleCloseRefresh = () => {
    setOpenRefresh(false);
  };

  const handleOpenRefresh = () => {
    setOpenRefresh(true);
  };

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
        const selectedPanelNameAndIDList: PanelNameAndID[] = [];
        selectedDashboard.panel_groups.forEach(
          (panelGroup: PanelGroupResponse) => {
            panelGroup.panels.forEach((panel: PanelResponse) => {
              selectedPanelNameAndIDList.push({
                name: panel.panel_name,
                id: panel.panel_id,
              });
            });
          }
        );
        dashboard.selectDashboard({
          selectedDashboardID: selectedDashboardInformation.id,
          selectedDashboardName: selectedDashboard.db_name,
          selectedDashboardTemplateName: selectedDashboard.db_type,
          refreshRate: 0,
        });
        setSelectedDashboardInformation({
          ...selectedDashboardInformation,
          dashboardListForAgent: availableDashboards,
          metaData: [selectedDashboard],
          dashboardKey: selectedDashboardInformation.id,
          panelNameAndIDList: selectedPanelNameAndIDList,
        });
        setSelectedPanels(
          selectedPanelNameAndIDList.map((panel: PanelNameAndID) => panel.id)
        );
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
            setSelectedDashboardInformation({
              ...selectedDashboardInformation,
              selectionOverride: false,
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

  const getRefreshRateStatus = () => {
    if (selectedDashboard.range) {
      const endDate: number =
        new Date(moment(selectedDashboard.range.endDate).format()).getTime() /
        1000;
      const now: number = Math.round(new Date().getTime() / 1000);
      const diff: number = Math.abs(now - endDate);
      const maxLim: number =
        (selectedDashboard.refreshRate ?? DEFAULT_REFRESH_RATE) / 1000 !== 0
          ? (selectedDashboard.refreshRate ?? DEFAULT_REFRESH_RATE) / 1000 +
            MINIMUM_TOLERANCE_LIMIT
          : DEFAULT_TOLERANCE_LIMIT;
      if (!(diff >= 0 && diff <= maxLim)) {
        // A non relative time range has been selected.
        // Refresh rate switch is not acknowledged and it's state is locked (Off).
        // Select a relative time range or select a different refresh rate to unlock again.
        return true;
      }
    }
    // For relative time ranges.
    return false;
  };

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
                            type: data.db_type,
                          });
                          dataSource.selectDataSource({
                            selectedDataSourceURL: '',
                            selectedDataSourceID: '',
                            selectedDataSourceName: '',
                          });
                          setRefreshRate(0);
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
            />
          </div>
          {isInfoOpen && (
            <div className={classes.infoDiv}>
              <InfoDropdown
                dashboardConfigurationDetails={{
                  name: selectedDashboardInformation.name,
                  type: selectedDashboardInformation.type,
                  dataSourceName: selectedDataSource.selectedDataSourceName,
                  dataSourceURL: selectedDataSource.selectedDataSourceURL,
                  agent: selectedDashboardInformation.agentName,
                }}
                metricsToBeShown={
                  selectedDashboardInformation.panelNameAndIDList
                }
                applicationsToBeShown={[]}
                postPanelSelectionRoutine={(selectedPanelList: string[]) => {
                  setSelectedPanels(selectedPanelList);
                }}
                postApplicationSelectionRoutine={(
                  selectedApplicationList: string[]
                ) => {}}
                closeInfo={() => {
                  setIsInfoOpen(false);
                }}
              />
            </div>
          )}
          <div className={classes.headerDiv}>
            <Typography className={classes.headerInfoText}>
              {t('analyticsDashboard.monitoringDashboardPage.headerInfoText')}
            </Typography>
            <div className={classes.controls}>
              <ButtonOutlined
                className={classes.selectDate}
                onClick={() => setDateRangeSelectorPopoverOpen(true)}
                ref={dateRangeSelectorRef}
                aria-label="time range"
                aria-haspopup="true"
              >
                <Typography className={classes.displayDate}>
                  <IconButton className={classes.rangeSelectorClockIcon}>
                    <WatchLaterRoundedIcon />
                  </IconButton>
                  {!selectedDashboard.range ||
                  selectedDashboard.range.startDate === ' '
                    ? `${t(
                        'analyticsDashboard.monitoringDashboardPage.rangeSelector.selectPeriod'
                      )}`
                    : `${selectedDashboard.range.startDate.split('-')[0]}-${
                        selectedDashboard.range.startDate.split('-')[1]
                      }-${selectedDashboard.range.startDate.substring(
                        selectedDashboard.range.startDate.lastIndexOf('-') + 1,
                        selectedDashboard.range.startDate.lastIndexOf('T')
                      )} 
                    
                  ${selectedDashboard.range.startDate.substring(
                    selectedDashboard.range.startDate.lastIndexOf('T') + 1,
                    selectedDashboard.range.startDate.lastIndexOf('+')
                  )} 
                    ${t(
                      'analyticsDashboard.monitoringDashboardPage.rangeSelector.to'
                    )}
                   ${selectedDashboard.range.endDate.split('-')[0]}-${
                        selectedDashboard.range.endDate.split('-')[1]
                      }-${selectedDashboard.range.endDate.substring(
                        selectedDashboard.range.endDate.lastIndexOf('-') + 1,
                        selectedDashboard.range.endDate.lastIndexOf('T')
                      )} 
                    
                  ${selectedDashboard.range.endDate.substring(
                    selectedDashboard.range.endDate.lastIndexOf('T') + 1,
                    selectedDashboard.range.endDate.lastIndexOf('+')
                  )}`}

                  <IconButton className={classes.rangeSelectorIcon}>
                    <KeyboardArrowDownIcon />
                  </IconButton>
                </Typography>
              </ButtonOutlined>
              <DateRangeSelector
                anchorEl={dateRangeSelectorRef.current as HTMLElement}
                isOpen={isDateRangeSelectorPopoverOpen}
                onClose={() => {
                  setDateRangeSelectorPopoverOpen(false);
                }}
                callbackToSetRange={CallbackFromRangeSelector}
                className={classes.rangeSelectorPopover}
              />
              <FormControl className={classes.formControl} variant="outlined">
                <InputLabel
                  id="refresh-controlled-open-select-label"
                  className={classes.inputLabel}
                >
                  <AutorenewOutlinedIcon className={classes.refreshIcon} />
                  <Typography className={classes.refreshText}>
                    {t(
                      'analyticsDashboard.monitoringDashboardPage.refresh.heading'
                    )}
                  </Typography>
                </InputLabel>
                <Select
                  labelId="refresh-controlled-open-select-label"
                  id="refresh-controlled-open-select"
                  open={openRefresh}
                  disabled={getRefreshRateStatus()}
                  onClose={handleCloseRefresh}
                  onOpen={handleOpenRefresh}
                  value={refreshRate !== 0 ? refreshRate : null}
                  onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                    // When viewing data for non-relative time range, refresh should be Off ideally.
                    // UI can auto detect if it is not Off and switches it to Off.
                    // Now the user can try to view the non-relative time range data again.
                    if (selectedDashboard.refreshRate !== MAX_REFRESH_RATE) {
                      dashboard.selectDashboard({
                        refreshRate: event.target.value as number,
                      });
                      setRefreshRate(event.target.value as number);
                    } else {
                      dashboard.selectDashboard({
                        refreshRate: event.target.value as number,
                      });
                      setRefreshRate(event.target.value as number);
                      dashboard.selectDashboard({
                        forceUpdate: true,
                      });
                    }
                  }}
                  input={<OutlinedInput classes={outlinedInputClasses} />}
                  IconComponent={KeyboardArrowDownIcon}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                    getContentAnchorEl: null,
                  }}
                >
                  <MenuItem
                    key="Off-refresh-option"
                    value={MAX_REFRESH_RATE}
                    className={
                      refreshRate === MAX_REFRESH_RATE
                        ? classes.menuListItemSelected
                        : classes.menuListItem
                    }
                  >
                    {t(
                      'analyticsDashboard.monitoringDashboardPage.refresh.off'
                    )}
                  </MenuItem>
                  {refreshData.map((data: RefreshObjectType) => (
                    <MenuItem
                      key={`${data.label}-refresh-option`}
                      value={data.value}
                      className={
                        refreshRate === data.value
                          ? classes.menuListItemSelected
                          : classes.menuListItem
                      }
                    >
                      {t(data.label)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
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
          dashboardType={selectedDashboardInformation.type}
          dashboardID={selectedDashboardInformation.id}
          dashboardName={selectedDashboardInformation.name}
        />
      ) : (
        <div />
      )}
    </Scaffold>
  );
};

export default DashboardPage;
