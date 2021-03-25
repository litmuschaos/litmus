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
  useTheme,
} from '@material-ui/core';
import AutorenewOutlinedIcon from '@material-ui/icons/AutorenewOutlined';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import WatchLaterRoundedIcon from '@material-ui/icons/WatchLaterRounded';
import { ButtonOutlined, GraphMetric } from 'litmus-ui';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BackButton from '../../components/Button/BackButton';
import DateRangeSelector from '../../components/DateRangeSelector';
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
import { RangeType } from '../../models/redux/dashboards';
import useActions from '../../redux/actions';
import * as DashboardActions from '../../redux/actions/dashboards';
import * as DataSourceActions from '../../redux/actions/dataSource';
import { RootState } from '../../redux/reducers';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import {
  chaosEventDataParserForPrometheus,
  getChaosQueryPromInputAndID,
} from '../../utils/promUtils';
import DashboardPanelGroup from '../../views/AnalyticsDashboard/MonitoringDashboardPage/DashboardPanelGroup';
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
}

interface PrometheusQueryDataInterface {
  promInput: PrometheusQueryInput;
  chaosInput: string[];
  firstLoad: Boolean;
}

interface RefreshObjectType {
  label: string;
  value: number;
}

const DashboardPage: React.FC = () => {
  const classes = useStyles();
  const outlinedInputClasses = useOutlinedInputStyles();
  const { t } = useTranslation();
  const { palette } = useTheme();
  const ACTIVE: string = 'Active';
  const dataSource = useActions(DataSourceActions);
  const dashboard = useActions(DashboardActions);
  // get ProjectID
  const projectID = getProjectID();
  const projectRole = getProjectRole();
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
  const [refreshRate, setRefreshRate] = React.useState<number>(
    selectedDashboard.refreshRate ? selectedDashboard.refreshRate : 0
  );
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
  const dateRangeSelectorRef = React.useRef<HTMLButtonElement>(null);
  const [range, setRange] = React.useState<RangeType>(
    selectedDashboard.range &&
      selectedDashboard.range.startDate !== '' &&
      selectedDashboard.range.endDate !== ''
      ? selectedDashboard.range
      : {
          startDate: moment
            .unix(Math.round(new Date().getTime() / 1000) - 1800)
            .format(),
          endDate: moment
            .unix(Math.round(new Date().getTime() / 1000))
            .format(),
        }
  );
  const [
    isDateRangeSelectorPopoverOpen,
    setDateRangeSelectorPopoverOpen,
  ] = React.useState(false);

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
    setRange({ startDate: startDateFormatted, endDate: endDateFormatted });
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

  // Apollo query to get the scheduled workflow data
  const { data: analyticsData } = useQuery<WorkflowList, WorkflowListDataVars>(
    WORKFLOW_LIST_DETAILS,
    {
      variables: { projectID, workflowIDs: [] },
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
      if (eventData) {
        chaos_data = chaosEventDataParserForPrometheus(
          eventData,
          prometheusQueryData?.chaosInput,
          palette.error.main
        );
        setChaosData(chaos_data);
        chaos_data = [];
      }
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
        start: `${
          new Date(
            moment(selectedDashboard.range.startDate).format()
          ).getTime() / 1000
        }`,
        end: `${
          new Date(moment(selectedDashboard.range.endDate).format()).getTime() /
          1000
        }`,
        queries: chaosInformation.promQueries,
      },
      chaosInput: chaosInformation.chaosQueryIDs,
      firstLoad: !analyticsData?.ListWorkflow,
    });
    chaosInformation = {
      promQueries: [],
      chaosQueryIDs: [],
    };
  };

  useEffect(() => {
    if (prometheusQueryData.firstLoad) {
      generateChaosQueries();
      dashboard.selectDashboard({
        range: {
          startDate: moment
            .unix(Math.round(new Date().getTime() / 1000) - 1800)
            .format(),
          endDate: moment
            .unix(Math.round(new Date().getTime() / 1000))
            .format(),
        },
      });
    }
    if (!prometheusQueryData.firstLoad) {
      setTimeout(
        () => {
          generateChaosQueries();
        },
        selectedDashboard.refreshRate !== 0
          ? selectedDashboard.refreshRate
          : 10000
      );
    }
  }, [prometheusQueryData]);

  return (
    <Scaffold>
      <div className={classes.rootContainer}>
        <div className={classes.root}>
          <div className={classes.button}>
            <BackButton />
          </div>
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
          <div className={classes.headerDiv}>
            {/* <Typography
              variant="h5"
              className={`${classes.weightedFont} ${classes.dashboardType}`}
            >
              {selectedDashboardInformation.type}
            </Typography> */}
            <Typography>
              {`View the chaos events and metrics in a given \n time interval by
              selecting a time interval.`}
            </Typography>
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
                {selectedDashboard.range.startDate === ' '
                  ? 'Select Period'
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
                    
                  to ${selectedDashboard.range.endDate.split('-')[0]}-${
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
                <Typography className={classes.refreshText}>Refresh</Typography>
              </InputLabel>
              <Select
                labelId="refresh-controlled-open-select-label"
                id="refresh-controlled-open-select"
                open={openRefresh}
                onClose={handleCloseRefresh}
                onOpen={handleOpenRefresh}
                value={refreshRate !== 0 ? refreshRate : null}
                onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                  setRefreshRate(event.target.value as number);
                  dashboard.selectDashboard({
                    refreshRate: event.target.value as number,
                  });
                  setTimeout(() => {
                    window.location.reload(false);
                  }, 1000);
                }}
                input={<OutlinedInput classes={outlinedInputClasses} />}
                IconComponent={KeyboardArrowDownIcon}
              >
                <MenuItem
                  key="Off-refresh-option"
                  value={2147483647}
                  className={
                    refreshRate === 2147483647
                      ? classes.menuListItemSelected
                      : classes.menuListItem
                  }
                >
                  Off
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
                    {data.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
      {}
    </Scaffold>
  );
};

export default DashboardPage;
