import { useQuery } from '@apollo/client';
import { AppBar, Tabs, useTheme } from '@material-ui/core';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { StyledTab } from '../../../../../../components/Tabs';
import { PROM_SERIES_LIST } from '../../../../../../graphql';
import {
  DashboardDetails,
  PanelDetails,
  PanelGroupDetails,
  PromQueryDetails,
} from '../../../../../../models/dashboardsData';
import { PanelOption } from '../../../../../../models/graphql/dashboardsDetails';
import {
  PrometheusSeriesListQueryVars,
  PrometheusSeriesListResponse,
} from '../../../../../../models/graphql/prometheus';
import { RootState } from '../../../../../../redux/reducers';
import QueryEditingWizard from './QueryEditingWizard';
import useStyles from './styles';

interface TabPanelProps {
  children: React.ReactNode;
  index: any;
  value: any;
}

interface Option {
  name: string;
  [index: string]: any;
}

interface EditPanelsWizardProps {
  configure: boolean;
  activeEditPanelID: string;
  dashboardVars: DashboardDetails;
  CallbackToSetPanels: (panels: PanelDetails[]) => void;
}

interface SelectedPanelsWithActiveIndex {
  panels: PanelDetails[];
  activeIndex: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
};

const a11yProps = (index: any) => {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
};

const EditPanelsWizard: React.FC<EditPanelsWizardProps> = ({
  configure,
  activeEditPanelID,
  dashboardVars,
  CallbackToSetPanels,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [seriesList, setSeriesList] = useState<Array<Option>>([]);
  const [panelGroupsList, setPanelGroupsList] = useState<Array<Option>>([]);
  useQuery<PrometheusSeriesListResponse, PrometheusSeriesListQueryVars>(
    PROM_SERIES_LIST,
    {
      variables: {
        prometheusDSInput: {
          url: dashboardVars.dataSourceURL ?? '',
          start: `${
            new Date(
              moment
                .unix(Math.round(new Date().getTime() / 1000) - 900)
                .format()
            ).getTime() / 1000
          }`,
          end: `${
            new Date(
              moment.unix(Math.round(new Date().getTime() / 1000)).format()
            ).getTime() / 1000
          }`,
        },
      },
      skip: seriesList.length > 0 || dashboardVars.dataSourceURL === '',
      fetchPolicy: 'cache-and-network',
      onCompleted: (prometheusSeriesData) => {
        if (prometheusSeriesData) {
          const seriesValues: Array<Option> = [];
          if (prometheusSeriesData.GetPromSeriesList.seriesList) {
            prometheusSeriesData.GetPromSeriesList.seriesList.forEach(
              (series) => {
                seriesValues.push({ name: series });
              }
            );
          }
          setSeriesList(seriesValues);
        }
      },
    }
  );

  const selectedDashboard = useSelector(
    (state: RootState) => state.selectDashboard
  );
  const [tabValue, setTabValue] = React.useState<number>(0);
  const [update, setUpdate] = useState(false);
  const [reload, setReload] = useState(false);

  const getPanelsByGroup = (name: string) => {
    const preSelectedPanels: string[] = [];
    if (dashboardVars.selectedPanelGroupMap) {
      dashboardVars.selectedPanelGroupMap.forEach((panelGroup) => {
        if (name === panelGroup.groupName) {
          panelGroup.panels.forEach((panel) => {
            preSelectedPanels.push(panel);
          });
        }
      });
    }
    return preSelectedPanels;
  };

  const getSelectedPanelGroups = () => {
    const preSelectedPanelGroups: string[] = [];
    if (dashboardVars.selectedPanelGroupMap) {
      dashboardVars.selectedPanelGroupMap.forEach((panelGroup) => {
        preSelectedPanelGroups.push(panelGroup.groupName);
      });
    }
    const selectedPanelGroups: PanelGroupDetails[] = [];
    selectedDashboard.dashboardJSON.panelGroups.forEach(
      (panelGroup: PanelGroupDetails) => {
        if (preSelectedPanelGroups.includes(panelGroup.panelGroupName)) {
          const selectedPanels: PanelDetails[] = [];
          const preSelectedPanels: string[] = getPanelsByGroup(
            panelGroup.panelGroupName
          );
          panelGroup.panels.forEach((panel: PanelDetails) => {
            if (preSelectedPanels.includes(panel.panelName)) {
              const promQueryList: PromQueryDetails[] = [];
              panel.promQueries.forEach((promQuery) => {
                promQueryList.push({
                  hidden: false,
                  queryID: uuidv4(),
                  promQueryName: promQuery.promQueryName,
                  legend: promQuery.legend,
                  resolution: promQuery.resolution,
                  minstep: promQuery.minstep,
                  line: promQuery.line,
                  closeArea: promQuery.closeArea,
                });
              });
              selectedPanels.push({
                panelGroupName: panelGroup.panelGroupName,
                dsURL: dashboardVars.dataSourceURL ?? '',
                promQueries: promQueryList,
                panelOptions: panel.panelOptions,
                panelName: panel.panelName,
                yAxisLeft: panel.yAxisLeft,
                yAxisRight: panel.yAxisRight,
                xAxisDown: panel.xAxisDown,
                unit: panel.unit,
              });
            }
          });
          selectedPanelGroups.push({
            panelGroupName: panelGroup.panelGroupName,
            panels: selectedPanels,
          });
        }
      }
    );
    return selectedPanelGroups;
  };

  const [dashboardDetails, setDashboardDetails] = useState<DashboardDetails>({
    panelGroups:
      dashboardVars.panelGroups && dashboardVars.panelGroups.length && configure
        ? dashboardVars.panelGroups
        : !configure && selectedDashboard.dashboardJSON
        ? getSelectedPanelGroups()
        : [],
    selectedPanels: [],
  });

  const generatePanelGroupsList = (updatedSelectedPanels: PanelDetails[]) => {
    const newPanelGroups: string[] = [];
    const newPanelGroupOptions: Array<Option> = [];
    updatedSelectedPanels.forEach((panel) => {
      if (
        panel.panelGroupName &&
        !newPanelGroups.includes(panel.panelGroupName)
      ) {
        newPanelGroups.push(panel.panelGroupName);
        newPanelGroupOptions.push({ name: panel.panelGroupName });
      }
    });
    setPanelGroupsList(newPanelGroupOptions);
  };

  const getNewPanel = () => {
    const newPanel: PanelDetails = {
      panelID: '',
      panelGroupID: '',
      createdAt: '',
      panelGroupName: 'Untitled Panel Group',
      dsURL: dashboardVars.dataSourceURL ?? '',
      promQueries: [
        {
          hidden: false,
          queryID: uuidv4(),
          promQueryName: '',
          legend: '',
          resolution: '1/2',
          minstep: '5',
          line: true,
          closeArea: false,
        },
      ],
      panelOptions: {
        points: false,
        grids: true,
        leftAxis: true,
      },
      panelName: 'Untitled Panel',
      yAxisLeft: '',
      yAxisRight: '',
      xAxisDown: '',
      unit: '',
    };

    return newPanel;
  };

  const handleCreatePanel = () => {
    const existingPanels: PanelDetails[] =
      dashboardDetails.selectedPanels ?? [];
    const newPanel = getNewPanel();
    existingPanels.push(newPanel);
    setDashboardDetails({
      ...dashboardDetails,
      selectedPanels: existingPanels,
    });
    generatePanelGroupsList(existingPanels);
    setUpdate(true);
  };

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    if (newValue === dashboardDetails.selectedPanels?.length) {
      handleCreatePanel();
    }
    setTabValue(newValue);
  };

  const getAllSelectedPanels = () => {
    const allSelectedPanelsWithActiveIndex: SelectedPanelsWithActiveIndex = {
      panels: [],
      activeIndex: 0,
    };
    let count = 0;
    if (dashboardDetails.panelGroups) {
      dashboardDetails.panelGroups.forEach((panelGroup) => {
        panelGroup.panels.forEach((panel) => {
          if (
            configure &&
            panel.panelID &&
            activeEditPanelID !== '' &&
            panel.panelID === activeEditPanelID
          ) {
            allSelectedPanelsWithActiveIndex.activeIndex = count;
          }
          allSelectedPanelsWithActiveIndex.panels.push({
            panelID: panel.panelID ?? '',
            panelGroupID: panel.panelGroupID ?? '',
            createdAt: panel.createdAt ?? '',
            panelGroupName: panel.panelGroupName ?? '',
            dsURL: dashboardVars.dataSourceURL ?? '',
            promQueries: panel.promQueries,
            panelOptions: panel.panelOptions,
            panelName: panel.panelName,
            yAxisLeft: panel.yAxisLeft,
            yAxisRight: panel.yAxisRight,
            xAxisDown: panel.xAxisDown,
            unit: panel.unit,
          });
          count += 1;
        });
      });
    }
    return allSelectedPanelsWithActiveIndex;
  };

  useEffect(() => {
    const panelsWithActiveIndex = getAllSelectedPanels();
    setDashboardDetails({
      ...dashboardDetails,
      selectedPanels: panelsWithActiveIndex.panels,
    });
    generatePanelGroupsList(panelsWithActiveIndex.panels);
    setTabValue(panelsWithActiveIndex.activeIndex);
    if (dashboardVars.dashboardTypeID === 'custom' && !configure) {
      handleCreatePanel();
    } else {
      setUpdate(true);
    }
  }, [dashboardDetails.panelGroups]);

  useEffect(() => {
    if (update) {
      CallbackToSetPanels(dashboardDetails.selectedPanels ?? []);
      setUpdate(false);
    }
    if (reload) {
      setReload(false);
    }
  }, [update]);

  const handleUpdatePanel = (panelVars: PanelDetails, index: number) => {
    const existingPanels: PanelDetails[] =
      dashboardDetails.selectedPanels ?? [];
    existingPanels[index] = panelVars;
    setDashboardDetails({
      ...dashboardDetails,
      selectedPanels: existingPanels,
    });
    generatePanelGroupsList(existingPanels);
    setUpdate(true);
  };

  const handleDeletePanel = (index: number) => {
    const numberOfPanels: number = dashboardDetails.selectedPanels?.length ?? 0;
    if (index !== 0 || numberOfPanels > 1) {
      const existingPanels: PanelDetails[] =
        dashboardDetails.selectedPanels ?? [];
      existingPanels.splice(index, 1);
      setDashboardDetails({
        ...dashboardDetails,
        selectedPanels: existingPanels,
      });
      generatePanelGroupsList(existingPanels);
      if (index > 0) {
        setTabValue(index - 1);
      } else {
        setReload(true);
      }
      setUpdate(true);
    }
  };

  const handleDiscardChanges = (index: number) => {
    setReload(true);
    const existingPanels: PanelDetails[] =
      dashboardDetails.selectedPanels ?? [];
    let panelGroupList: PanelGroupDetails[] = [];
    if (configure) {
      panelGroupList = dashboardVars.panelGroupMap ?? [];
    } else {
      panelGroupList =
        dashboardVars.dashboardTypeID !== 'custom'
          ? selectedDashboard.dashboardJSON.panelGroups
          : [];
    }
    panelGroupList.forEach((panelGroup) => {
      panelGroup.panels.forEach((selectedPanel) => {
        if (
          configure &&
          selectedPanel.panelID === existingPanels[index].panelID
        ) {
          const existingPromQueries: PromQueryDetails[] = [];
          selectedPanel.promQueries.forEach((promQuery) => {
            existingPromQueries.push({
              hidden: false,
              queryID: promQuery.queryID,
              promQueryName: promQuery.promQueryName,
              legend: promQuery.legend,
              resolution: promQuery.resolution,
              minstep: promQuery.minstep,
              line: promQuery.line,
              closeArea: promQuery.closeArea,
            });
          });
          const existingPanelOptions: PanelOption = {
            points: selectedPanel.panelOptions.points,
            grids: selectedPanel.panelOptions.grids,
            leftAxis: selectedPanel.panelOptions.leftAxis,
          };
          existingPanels[index] = {
            panelID: selectedPanel.panelID ?? '',
            panelGroupID: panelGroup.panelGroupID ?? '',
            createdAt: selectedPanel.createdAt ?? '',
            panelGroupName: panelGroup.panelGroupName,
            dsURL: dashboardVars.dataSourceURL ?? '',
            promQueries: existingPromQueries,
            panelOptions: existingPanelOptions,
            panelName: selectedPanel.panelName,
            yAxisLeft: selectedPanel.yAxisLeft,
            yAxisRight: selectedPanel.yAxisRight,
            xAxisDown: selectedPanel.xAxisDown,
            unit: selectedPanel.unit,
          };
        } else if (
          !configure &&
          selectedPanel.panelName === existingPanels[index].panelName
        ) {
          const initialPromQueries: PromQueryDetails[] = [];
          selectedPanel.promQueries.forEach((promQuery) => {
            initialPromQueries.push({
              hidden: false,
              queryID: uuidv4(),
              promQueryName: promQuery.promQueryName,
              legend: promQuery.legend,
              resolution: promQuery.resolution,
              minstep: promQuery.minstep,
              line: promQuery.line,
              closeArea: promQuery.closeArea,
            });
          });
          existingPanels[index] = {
            dsURL: dashboardVars.dataSourceURL ?? '',
            promQueries: initialPromQueries,
            panelGroupName: panelGroup.panelGroupName,
            panelOptions: selectedPanel.panelOptions,
            panelName: selectedPanel.panelName,
            yAxisLeft: selectedPanel.yAxisLeft,
            yAxisRight: selectedPanel.yAxisRight,
            xAxisDown: selectedPanel.xAxisDown,
            unit: selectedPanel.unit,
          };
        }
      });
    });
    if (!configure && dashboardVars.dashboardTypeID === 'custom') {
      existingPanels[index] = getNewPanel();
    }
    setDashboardDetails({
      ...dashboardDetails,
      selectedPanels: existingPanels,
    });
    generatePanelGroupsList(existingPanels);
    setUpdate(true);
  };

  useEffect(() => {
    if (
      configure &&
      selectedDashboard.activePanelID !== '' &&
      dashboardDetails.panelGroups?.length === 0 &&
      dashboardVars.panelGroups &&
      dashboardVars.panelGroups.length !== 0
    ) {
      setDashboardDetails({
        panelGroups: dashboardVars.panelGroups,
        selectedPanels: [],
      });
    }
  }, [dashboardVars]);

  return (
    <div>
      <AppBar position="static" color="default" className={classes.appBar}>
        <Tabs
          value={tabValue}
          onChange={handleChange}
          TabIndicatorProps={{
            style: {
              backgroundColor: theme.palette.primary.main,
            },
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {dashboardDetails.selectedPanels?.map((panel, index) => (
            <StyledTab
              label={panel.panelName}
              {...a11yProps(index)}
              key={`tab-${panel.panelGroupName}-${panel.panelName}`}
            />
          ))}
          <StyledTab
            label={t(
              'monitoringDashboard.monitoringDashboards.tuneTheQueries.addPanel'
            )}
            {...a11yProps(dashboardDetails.selectedPanels?.length)}
          />
        </Tabs>
      </AppBar>

      {!reload &&
        dashboardDetails.selectedPanels?.map((panel, index) => (
          <TabPanel
            value={tabValue}
            index={index}
            key={`tab-panel-${panel.panelName}`}
          >
            <QueryEditingWizard
              numberOfPanels={dashboardDetails.selectedPanels?.length ?? 0}
              panelVars={panel}
              selectedApps={dashboardVars.applicationMetadataMap ?? []}
              seriesList={seriesList}
              panelGroupsList={panelGroupsList}
              index={index}
              handleUpdatePanel={handleUpdatePanel}
              handleDeletePanel={handleDeletePanel}
              handleDiscardChanges={handleDiscardChanges}
            />
          </TabPanel>
        ))}
    </div>
  );
};
export default EditPanelsWizard;
