import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BackButton from '../../components/Button/BackButton';
import Loader from '../../components/Loader';
import Wrapper from '../../containers/layouts/Wrapper';
import { GET_DASHBOARD, GET_DATASOURCE } from '../../graphql';
import {
  DashboardDetails,
  PanelDetails,
  PanelGroupDetails,
  PromQueryDetails,
} from '../../models/dashboardsData';
import {
  ApplicationMetadata,
  ApplicationMetadataResponse,
  GetDashboard,
  GetDashboardRequest,
  PanelGroupResponse,
  PanelOption,
  PanelResponse,
  Resource,
  UpdatePanelGroupRequest,
} from '../../models/graphql/dashboardsDetails';
import {
  DataSourceList,
  ListDataSourceVars,
} from '../../models/graphql/dataSourceDetails';
import useActions from '../../redux/actions';
import * as AlertActions from '../../redux/actions/alert';
import { RootState } from '../../redux/reducers';
import { getProjectID } from '../../utils/getSearchParams';
import DashboardStepper from '../../views/Observability/MonitoringDashboards/Stepper';
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
    } = useQuery<DataSourceList, ListDataSourceVars>(GET_DATASOURCE, {
      variables: { projectID },
      fetchPolicy: 'cache-and-network',
    });

    // Apollo query to get the dashboard data
    const {
      data: dashboardList,
      loading: loadingDashboard,
      error: errorFetchingDashboard,
    } = useQuery<GetDashboard, GetDashboardRequest>(GET_DASHBOARD, {
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
            panel.promQueries.forEach((promQuery) => {
              promQueries.push({
                queryID: promQuery.queryID,
                promQueryName: promQuery.promQueryName,
                legend: promQuery.legend,
                resolution: promQuery.resolution,
                minstep: promQuery.minstep,
                line: promQuery.line,
                closeArea: promQuery.closeArea,
              });
            });
            const panelOption: PanelOption = {
              points: panel.panelOptions.points,
              grids: panel.panelOptions.grids,
              leftAxis: panel.panelOptions.leftAxis,
            };
            panels.push({
              panelName: panel.panelName,
              yAxisLeft: panel.yAxisLeft,
              yAxisRight: panel.yAxisRight,
              xAxisDown: panel.xAxisDown,
              unit: panel.unit,
              panelOptions: panelOption,
              promQueries,
              panelID: panel.panelID,
              createdAt: panel.createdAt,
              panelGroupID: panelGroup.panelGroupID,
              panelGroupName: panelGroup.panelGroupName,
            });
          });
          panelGroups.push({
            panelGroupID: panelGroup.panelGroupID,
            panelGroupName: panelGroup.panelGroupName,
            panels,
          });
        });
      }
      return panelGroups;
    };

    const getExistingPanelGroupMap = (
      panelGroupsInput: PanelGroupResponse[]
    ) => {
      const panelGroupMap: UpdatePanelGroupRequest[] = [];
      if (panelGroupsInput?.length) {
        panelGroupsInput.forEach((panelGroup: PanelGroupResponse) => {
          panelGroupMap.push({
            panelGroupID: panelGroup.panelGroupID,
            panelGroupName: panelGroup.panelGroupName,
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
        dashboardList.getDashboard &&
        dashboardList.getDashboard.length > 0
      ) {
        const dashboardDetail = dashboardList.getDashboard[0];
        setDashboardVars({
          ...dashboardVars,
          id: selectedDashboard.selectedDashboardID,
          name: dashboardDetail.dbName,
          dataSourceType: dashboardDetail.dsType,
          dashboardTypeID: dashboardDetail.dbTypeID,
          dashboardTypeName: dashboardDetail.dbTypeName,
          dataSourceID: dashboardDetail.dsID,
          dataSourceURL: dashboardDetail.dsURL,
          agentID: dashboardDetail.clusterID,
          information: dashboardDetail.dbInformation,
          panelGroupMap: getExistingPanelGroupMap(dashboardDetail.panelGroups),
          panelGroups: getExistingPanelGroups(dashboardDetail.panelGroups),
          chaosEventQueryTemplate: dashboardDetail.chaosEventQueryTemplate,
          chaosVerdictQueryTemplate: dashboardDetail.chaosVerdictQueryTemplate,
          applicationMetadataMap: getApplicationMetadataMap(
            dashboardDetail.applicationMetadataMap
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
                ? t('monitoringDashboard.monitoringDashboards.loadingDashboard')
                : t(
                    'monitoringDashboard.monitoringDashboards.loadingDataSources'
                  )}
            </Typography>
          </div>
        ) : configure && errorFetchingDashboard ? (
          <div className={classes.center}>
            <Typography className={classes.error}>
              {t(
                'monitoringDashboard.monitoringDashboards.errorFetchingDashboard'
              )}
            </Typography>
          </div>
        ) : errorFetchingDataSources ? (
          <div className={classes.center}>
            <Typography className={classes.error}>
              {t(
                'monitoringDashboard.monitoringDashboards.errorFetchingDataSources'
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
