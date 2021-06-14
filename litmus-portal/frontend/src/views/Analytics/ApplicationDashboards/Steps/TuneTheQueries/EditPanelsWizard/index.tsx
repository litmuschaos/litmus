/* eslint-disable no-unused-expressions */
import { useLazyQuery } from '@apollo/client';
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
  const [getSeriesList] = useLazyQuery<
    PrometheusSeriesListResponse,
    PrometheusSeriesListQueryVars
  >(PROM_SERIES_LIST, {
    variables: {
      prometheusDSInput: {
        url: dashboardVars.dataSourceURL ?? '',
        start: `${
          new Date(
            moment.unix(Math.round(new Date().getTime() / 1000) - 900).format()
          ).getTime() / 1000
        }`,
        end: `${
          new Date(
            moment.unix(Math.round(new Date().getTime() / 1000)).format()
          ).getTime() / 1000
        }`,
      },
    },
    fetchPolicy: 'network-only',
    onCompleted: (prometheusSeriesData) => {
      if (prometheusSeriesData) {
        const seriesValues: Array<Option> = [];
        prometheusSeriesData.GetPromSeriesList.seriesList?.forEach((series) => {
          seriesValues.push({ name: series });
        });
        setSeriesList(seriesValues);
      }
    },
  });

  const selectedDashboard = useSelector(
    (state: RootState) => state.selectDashboard
  );
  const [tabValue, setTabValue] = React.useState<number>(0);
  const [update, setUpdate] = useState(false);
  const [reload, setReload] = useState(false);

  const getPanelsByGroup = (name: string) => {
    const preSelectedPanels: string[] = [];
    dashboardVars.selectedPanelGroupMap?.forEach((panelGroup) => {
      if (name === panelGroup.groupName) {
        panelGroup.panels.forEach((panel) => {
          preSelectedPanels.push(panel);
        });
      }
    });
    return preSelectedPanels;
  };

  const getSelectedPanelGroups = () => {
    const preSelectedPanelGroups: string[] = [];
    dashboardVars.selectedPanelGroupMap?.forEach((panelGroup) => {
      preSelectedPanelGroups.push(panelGroup.groupName);
    });
    const selectedPanelGroups: PanelGroupDetails[] = [];
    selectedDashboard.dashboardJSON.panelGroups.forEach(
      (panelGroup: PanelGroupDetails) => {
        if (preSelectedPanelGroups.includes(panelGroup.panel_group_name)) {
          const selectedPanels: PanelDetails[] = [];
          const preSelectedPanels: string[] = getPanelsByGroup(
            panelGroup.panel_group_name
          );
          panelGroup.panels.forEach((panel: PanelDetails) => {
            if (preSelectedPanels.includes(panel.panel_name)) {
              const promQueryList: PromQueryDetails[] = [];
              panel.prom_queries.forEach((promQuery) => {
                promQueryList.push({
                  hidden: false,
                  queryid: uuidv4(),
                  prom_query_name: promQuery.prom_query_name,
                  legend: promQuery.legend,
                  resolution: promQuery.resolution,
                  minstep: promQuery.minstep,
                  line: promQuery.line,
                  close_area: promQuery.close_area,
                });
              });
              selectedPanels.push({
                panel_group_name: panelGroup.panel_group_name,
                ds_url: dashboardVars.dataSourceURL ?? '',
                prom_queries: promQueryList,
                panel_options: panel.panel_options,
                panel_name: panel.panel_name,
                y_axis_left: panel.y_axis_left,
                y_axis_right: panel.y_axis_right,
                x_axis_down: panel.x_axis_down,
                unit: panel.unit,
              });
            }
          });
          selectedPanelGroups.push({
            panel_group_name: panelGroup.panel_group_name,
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
        panel.panel_group_name &&
        !newPanelGroups.includes(panel.panel_group_name)
      ) {
        newPanelGroups.push(panel.panel_group_name);
        newPanelGroupOptions.push({ name: panel.panel_group_name });
      }
    });
    setPanelGroupsList(newPanelGroupOptions);
  };

  const handleCreatePanel = () => {
    const existingPanels: PanelDetails[] =
      dashboardDetails.selectedPanels ?? [];
    const newPanel: PanelDetails = {
      panel_id: '',
      panel_group_id: '',
      created_at: '',
      panel_group_name: 'Untitled Group name',
      ds_url: dashboardVars.dataSourceURL ?? '',
      prom_queries: [
        {
          hidden: false,
          queryid: uuidv4(),
          prom_query_name: '',
          legend: '',
          resolution: '1/2',
          minstep: '5',
          line: true,
          close_area: false,
        },
      ],
      panel_options: {
        points: false,
        grids: true,
        left_axis: true,
      },
      panel_name: 'Untitled Metric',
      y_axis_left: '',
      y_axis_right: '',
      x_axis_down: '',
      unit: '',
    };
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
    dashboardDetails.panelGroups?.forEach((panelGroup) => {
      panelGroup.panels.forEach((panel) => {
        if (
          configure &&
          panel.panel_id &&
          activeEditPanelID !== '' &&
          panel.panel_id === activeEditPanelID
        ) {
          allSelectedPanelsWithActiveIndex.activeIndex = count;
        }
        allSelectedPanelsWithActiveIndex.panels.push({
          panel_id: panel.panel_id ?? '',
          panel_group_id: panel.panel_group_id ?? '',
          created_at: panel.created_at ?? '',
          panel_group_name: panel.panel_group_name ?? '',
          ds_url: dashboardVars.dataSourceURL ?? '',
          prom_queries: panel.prom_queries,
          panel_options: panel.panel_options,
          panel_name: panel.panel_name,
          y_axis_left: panel.y_axis_left,
          y_axis_right: panel.y_axis_right,
          x_axis_down: panel.x_axis_down,
          unit: panel.unit,
        });
        count += 1;
      });
    });
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
    getSeriesList();
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
      panelGroupList = dashboardVars.panelGroups ?? [];
    } else {
      panelGroupList = selectedDashboard.dashboardJSON.panelGroups;
    }
    panelGroupList.forEach((panelGroup) => {
      panelGroup.panels.forEach((selectedPanel) => {
        if (
          configure &&
          selectedPanel.panel_id === existingPanels[index].panel_id
        ) {
          existingPanels[index] = {
            panel_id: selectedPanel.panel_id ?? '',
            panel_group_id: panelGroup.panel_group_id ?? '',
            created_at: selectedPanel.created_at ?? '',
            panel_group_name: panelGroup.panel_group_name,
            ds_url: dashboardVars.dataSourceURL ?? '',
            prom_queries: selectedPanel.prom_queries,
            panel_options: selectedPanel.panel_options,
            panel_name: selectedPanel.panel_name,
            y_axis_left: selectedPanel.y_axis_left,
            y_axis_right: selectedPanel.y_axis_right,
            x_axis_down: selectedPanel.x_axis_down,
            unit: selectedPanel.unit,
          };
        } else if (
          !configure &&
          selectedPanel.panel_name === existingPanels[index].panel_name
        ) {
          const initialPromQueries: PromQueryDetails[] = [];
          selectedPanel.prom_queries.forEach((prom_query) => {
            initialPromQueries.push({
              hidden: false,
              queryid: uuidv4(),
              prom_query_name: prom_query.prom_query_name,
              legend: prom_query.legend,
              resolution: prom_query.resolution,
              minstep: prom_query.minstep,
              line: prom_query.line,
              close_area: prom_query.close_area,
            });
          });
          existingPanels[index] = {
            ds_url: dashboardVars.dataSourceURL ?? '',
            prom_queries: initialPromQueries,
            panel_group_name: panelGroup.panel_group_name,
            panel_options: selectedPanel.panel_options,
            panel_name: selectedPanel.panel_name,
            y_axis_left: selectedPanel.y_axis_left,
            y_axis_right: selectedPanel.y_axis_right,
            x_axis_down: selectedPanel.x_axis_down,
            unit: selectedPanel.unit,
          };
        }
      });
    });
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
            <StyledTab label={panel.panel_name} {...a11yProps(index)} />
          ))}
          <StyledTab
            label={t(
              'analyticsDashboard.applicationDashboards.tuneTheQueries.addMetric'
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
            key={`tab-panel-${panel.panel_name}`}
          >
            <QueryEditingWizard
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
