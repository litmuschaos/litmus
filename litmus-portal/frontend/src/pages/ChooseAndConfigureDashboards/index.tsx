import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BackButton from '../../components/Button/BackButton';
import Loader from '../../components/Loader';
import Wrapper from '../../containers/layouts/Wrapper';
import { LIST_DASHBOARD, LIST_DATASOURCE } from '../../graphql';
import {
  DashboardDetails,
  PanelDetails,
  PanelGroupDetails,
  PromQueryDetails,
} from '../../models/dashboardsData';
import {
  ApplicationMetadata,
  ApplicationMetadataResponse,
  DashboardList,
  ListDashboardVars,
  PanelGroupResponse,
  PanelOption,
  PanelResponse,
  Resource,
  updatePanelGroupInput,
} from '../../models/graphql/dashboardsDetails';
import {
  DataSourceList,
  ListDataSourceVars,
} from '../../models/graphql/dataSourceDetails';
import useActions from '../../redux/actions';
import * as AlertActions from '../../redux/actions/alert';
import { RootState } from '../../redux/reducers';
import { getProjectID } from '../../utils/getSearchParams';
import DashboardStepper from '../../views/Analytics/ApplicationDashboards/Stepper';
import useStyles from './styles';

interface ChooseAndConfigureDashboardsProps {
  configure: boolean;
}

const ChooseAndConfigureDashboards: React.FC<ChooseAndConfigureDashboardsProps> =
  ({ configure }) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const projectID = getProjectID();
    const selectedDashboard = useSelector(
      (state: RootState) => state.selectDashboard
    );
    const alert = useActions(AlertActions);
    alert.changeAlertState(false);

    // Apollo query to get the data source data
    const {
      data: dataSourceList,
      loading: loadingDataSources,
      error: errorFetchingDataSources,
    } = useQuery<DataSourceList, ListDataSourceVars>(LIST_DATASOURCE, {
      variables: { projectID },
      fetchPolicy: 'cache-and-network',
    });

    // Apollo query to get the dashboard data
    const {
      data: dashboardList,
      loading: loadingDashboard,
      error: errorFetchingDashboard,
    } = useQuery<DashboardList, ListDashboardVars>(LIST_DASHBOARD, {
      variables: { projectID, dbID: selectedDashboard.selectedDashboardID },
      skip: !configure || selectedDashboard.selectedDashboardID === '',
      fetchPolicy: 'network-only',
    });

    const [dashboardVars, setDashboardVars] = React.useState<DashboardDetails>({
      id: '',
      name: '',
      dashboardTypeID: '',
      dashboardTypeName: '',
      dataSourceType: '',
      dataSourceID: '',
      dataSourceURL: '',
      chaosEventQueryTemplate: '',
      chaosVerdictQueryTemplate: '',
      agentID: '',
      information: '',
      panelGroupMap: [],
      panelGroups: [],
      selectedPanelGroupMap: [],
      applicationMetadataMap: [],
    });

    const getExistingPanelGroups = (panelGroupsInput: PanelGroupResponse[]) => {
      const panelGroups: PanelGroupDetails[] = [];
      if (panelGroupsInput?.length) {
        panelGroupsInput.forEach((panelGroup: PanelGroupResponse) => {
          const panels: PanelDetails[] = [];
          panelGroup.panels.forEach((panel: PanelResponse) => {
            const promQueries: PromQueryDetails[] = [];
            panel.prom_queries.forEach((promQuery) => {
              promQueries.push({
                queryid: promQuery.queryid,
                prom_query_name: promQuery.prom_query_name,
                legend: promQuery.legend,
                resolution: promQuery.resolution,
                minstep: promQuery.minstep,
                line: promQuery.line,
                close_area: promQuery.close_area,
              });
            });
            const panelOption: PanelOption = {
              points: panel.panel_options.points,
              grids: panel.panel_options.grids,
              left_axis: panel.panel_options.left_axis,
            };
            panels.push({
              panel_name: panel.panel_name,
              y_axis_left: panel.y_axis_left,
              y_axis_right: panel.y_axis_right,
              x_axis_down: panel.x_axis_down,
              unit: panel.unit,
              panel_options: panelOption,
              prom_queries: promQueries,
              panel_id: panel.panel_id,
              created_at: panel.created_at,
              panel_group_id: panelGroup.panel_group_id,
              panel_group_name: panelGroup.panel_group_name,
            });
          });
          panelGroups.push({
            panel_group_id: panelGroup.panel_group_id,
            panel_group_name: panelGroup.panel_group_name,
            panels,
          });
        });
      }
      return panelGroups;
    };

    const getExistingPanelGroupMap = (
      panelGroupsInput: PanelGroupResponse[]
    ) => {
      const panelGroupMap: updatePanelGroupInput[] = [];
      if (panelGroupsInput?.length) {
        panelGroupsInput.forEach((panelGroup: PanelGroupResponse) => {
          panelGroupMap.push({
            panel_group_id: panelGroup.panel_group_id,
            panel_group_name: panelGroup.panel_group_name,
            panels: panelGroup.panels,
          });
        });
      }
      return panelGroupMap;
    };

    const getApplicationMetadataMap = (
      applicationMetadataMapResponse: ApplicationMetadataResponse[]
    ) => {
      const applicationMetadataMap: ApplicationMetadata[] = [];
      if (applicationMetadataMapResponse) {
        applicationMetadataMapResponse.forEach((applicationMetadata) => {
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
      return applicationMetadataMap;
    };

    useEffect(() => {
      if (
        configure === true &&
        dashboardList &&
        dashboardList.ListDashboard &&
        dashboardList.ListDashboard.length > 0
      ) {
        const dashboardDetail = dashboardList.ListDashboard[0];
        setDashboardVars({
          ...dashboardVars,
          id: selectedDashboard.selectedDashboardID,
          name: dashboardDetail.db_name,
          dataSourceType: dashboardDetail.ds_type,
          dashboardTypeID: dashboardDetail.db_type_id,
          dashboardTypeName: dashboardDetail.db_type_name,
          dataSourceID: dashboardDetail.ds_id,
          dataSourceURL: dashboardDetail.ds_url,
          agentID: dashboardDetail.cluster_id,
          information: dashboardDetail.db_information,
          panelGroupMap: getExistingPanelGroupMap(dashboardDetail.panel_groups),
          panelGroups: getExistingPanelGroups(dashboardDetail.panel_groups),
          chaosEventQueryTemplate: dashboardDetail.chaos_event_query_template,
          chaosVerdictQueryTemplate:
            dashboardDetail.chaos_verdict_query_template,
          applicationMetadataMap: getApplicationMetadataMap(
            dashboardDetail.application_metadata_map
          ),
        });
      }
    }, [dashboardList, dataSourceList]);

    return (
      <Wrapper>
        {((configure && errorFetchingDashboard) ||
          errorFetchingDataSources) && <BackButton />}
        {(configure && (loadingDashboard || loadingDataSources)) ||
        (!configure && loadingDataSources) ? (
          <div className={classes.center}>
            <Loader />
            <Typography className={classes.loading}>
              {configure
                ? t('analyticsDashboard.applicationDashboards.loadingDashboard')
                : t(
                    'analyticsDashboard.applicationDashboards.loadingDataSources'
                  )}
            </Typography>
          </div>
        ) : configure && errorFetchingDashboard ? (
          <div className={classes.center}>
            <Typography className={classes.error}>
              {t(
                'analyticsDashboard.applicationDashboards.errorFetchingDashboard'
              )}
            </Typography>
          </div>
        ) : errorFetchingDataSources ? (
          <div className={classes.center}>
            <Typography className={classes.error}>
              {t(
                'analyticsDashboard.applicationDashboards.errorFetchingDataSources'
              )}
            </Typography>
          </div>
        ) : (
          <>
            <BackButton />
            <DashboardStepper
              configure={configure}
              activePanelID={selectedDashboard.activePanelID}
              existingDashboardVars={dashboardVars}
              dataSourceList={dataSourceList?.ListDataSource ?? []}
            />
          </>
        )}
      </Wrapper>
    );
  };

export default ChooseAndConfigureDashboards;
