/* eslint-disable no-unused-expressions */
import { useQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import BackButton from '../../components/Button/BackButton';
import Scaffold from '../../containers/layouts/Scaffold';
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
  ListDashboardResponse,
  ListDashboardVars,
  PanelGroupResponse,
  PanelOption,
  PanelResponse,
  Resource,
  updatePanelGroupInput,
} from '../../models/graphql/dashboardsDetails';
import {
  DataSourceList,
  ListDataSourceResponse,
  ListDataSourceVars,
} from '../../models/graphql/dataSourceDetails';
import useActions from '../../redux/actions';
import * as AlertActions from '../../redux/actions/alert';
import { RootState } from '../../redux/reducers';
import { getProjectID } from '../../utils/getSearchParams';
import DashboardStepper from '../../views/Analytics/ApplicationDashboards/Stepper';

interface ChooseAndConfigureDashboardsProps {
  configure: boolean;
}

const ChooseAndConfigureDashboards: React.FC<ChooseAndConfigureDashboardsProps> = ({
  configure,
}) => {
  const projectID = getProjectID();
  const selectedDashboard = useSelector(
    (state: RootState) => state.selectDashboard
  );
  const alert = useActions(AlertActions);
  alert.changeAlertState(false);

  // Apollo query to get the data source data
  const { data: dataSourceList } = useQuery<DataSourceList, ListDataSourceVars>(
    LIST_DATASOURCE,
    {
      variables: { projectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  // Apollo query to get the dashboard data
  const { data: dashboardList } = useQuery<DashboardList, ListDashboardVars>(
    LIST_DASHBOARD,
    {
      variables: { projectID },
      fetchPolicy: 'cache-and-network',
    }
  );

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
              ...promQuery,
            });
          });
          const panelOption: PanelOption = {
            points: panel.panel_options.points,
            grids: panel.panel_options.grids,
            left_axis: panel.panel_options.left_axis,
          };
          panels.push({
            ...panel,
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

  const getExistingPanelGroupMap = (panelGroupsInput: PanelGroupResponse[]) => {
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
    applicationMetadataMapResponse?.forEach((applicationMetadata) => {
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
    return applicationMetadataMap;
  };

  const getSelectedDsURL = (selectedDsID: string) => {
    const dsList: ListDataSourceResponse[] =
      dataSourceList?.ListDataSource ?? [];
    let selectedDsURL: string = '';
    dsList.forEach((ds) => {
      if (ds.ds_id === selectedDsID) {
        selectedDsURL = ds.ds_url;
      }
    });
    return selectedDsURL;
  };

  useEffect(() => {
    if (configure === true) {
      dashboardList?.ListDashboard?.forEach(
        (dashboardDetail: ListDashboardResponse) => {
          if (dashboardDetail.db_id === selectedDashboard.selectedDashboardID) {
            setDashboardVars({
              ...dashboardVars,
              id: selectedDashboard.selectedDashboardID,
              name: dashboardDetail.db_name,
              dataSourceType: dashboardDetail.ds_type,
              dashboardTypeID: dashboardDetail.db_type_id,
              dashboardTypeName: dashboardDetail.db_type_name,
              dataSourceID: dashboardDetail.ds_id,
              dataSourceURL: getSelectedDsURL(dashboardDetail.ds_id),
              agentID: dashboardDetail.cluster_id,
              information: dashboardDetail.db_information,
              panelGroupMap: getExistingPanelGroupMap(
                dashboardDetail.panel_groups
              ),
              panelGroups: getExistingPanelGroups(dashboardDetail.panel_groups),
              chaosEventQueryTemplate:
                dashboardDetail.chaos_event_query_template,
              chaosVerdictQueryTemplate:
                dashboardDetail.chaos_verdict_query_template,
              applicationMetadataMap: getApplicationMetadataMap(
                dashboardDetail.application_metadata_map
              ),
            });
          }
        }
      );
    }
  }, [dashboardList, dataSourceList]);

  return (
    <Scaffold>
      <BackButton />
      <DashboardStepper
        configure={configure}
        activePanelID={selectedDashboard.activePanelID}
        existingDashboardVars={dashboardVars}
        dataSourceList={dataSourceList?.ListDataSource ?? []}
      />
    </Scaffold>
  );
};

export default ChooseAndConfigureDashboards;
