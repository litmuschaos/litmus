/* eslint-disable no-unused-expressions */
import { useQuery } from '@apollo/client';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import { InputField } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import PreConfiguredDashboards from '../../../../components/PreconfiguredDashboards/data';
import {
  GET_CLUSTER,
  LIST_DASHBOARD,
  LIST_DATASOURCE,
} from '../../../../graphql';
import {
  DashboardDetails,
  PanelGroupMap,
} from '../../../../models/dashboardsData';
import {
  Cluster,
  Clusters,
  ClusterVars,
} from '../../../../models/graphql/clusterData';
import {
  DashboardList,
  ListDashboardResponse,
  ListDashboardVars,
} from '../../../../models/graphql/dashboardsDetails';
import {
  DataSourceList,
  ListDataSourceResponse,
  ListDataSourceVars,
} from '../../../../models/graphql/dataSourceDetails';
import { RootState } from '../../../../redux/reducers';
import { validateTextEmpty } from '../../../../utils/validate';
import useStyles from './styles';

interface ConfigureDashboardProps {
  configure: boolean;
  dashboardID?: string;
  CallbackToSetVars: (vars: DashboardDetails) => void;
}

const ConfigureDashboard: React.FC<ConfigureDashboardProps> = ({
  configure,
  dashboardID,
  CallbackToSetVars,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );
  const selectedDashboard = useSelector(
    (state: RootState) => state.selectDashboard
  );
  const [dashboardDetails, setDashboardDetails] = useState<DashboardDetails>({
    name: '',
    dashboardType: selectedDashboard.selectedDashboardTemplateName ?? '',
    dataSourceType: '',
    dataSourceID: '',
    agentID: '',
    dataSourceName: '',
    agentName: '',
    information: selectedDashboard.selectedDashboardDescription ?? '',
    panelGroupMap: selectedDashboard.selectedDashboardPanelGroupMap ?? [],
    panelGroups: [],
  });
  const [update, setUpdate] = useState(false);

  // Apollo query to get the datasource data
  const { data: dataSourceList } = useQuery<DataSourceList, ListDataSourceVars>(
    LIST_DATASOURCE,
    {
      variables: { projectID: selectedProjectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  // Apollo query to get the agent data
  const { data: agentList } = useQuery<Clusters, ClusterVars>(GET_CLUSTER, {
    variables: { project_id: selectedProjectID },
    fetchPolicy: 'cache-and-network',
  });

  // Apollo query to get the dashboard data
  const { data: dashboardList } = useQuery<DashboardList, ListDashboardVars>(
    LIST_DASHBOARD,
    {
      variables: { projectID: selectedProjectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  const getDataSourceType = (searchingData: ListDataSourceResponse[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.ds_type)) {
        uniqueList.push(data.ds_type);
      }
    });
    return uniqueList;
  };

  const nameChangeHandler = (event: React.ChangeEvent<{ value: string }>) => {
    setDashboardDetails({
      ...dashboardDetails,
      name: (event.target as HTMLInputElement).value,
    });
    setUpdate(true);
  };

  useEffect(() => {
    if (configure === true) {
      dashboardList?.ListDashboard.forEach(
        (dashboardDetail: ListDashboardResponse) => {
          if (dashboardDetail.db_id === dashboardID) {
            setDashboardDetails({
              ...dashboardDetails,
              name: dashboardDetail.db_name,
              dataSourceType: dashboardDetail.ds_type,
              dashboardType: dashboardDetail.db_type,
              dataSourceID: dashboardDetail.ds_id,
              agentID: dashboardDetail.cluster_id,
              dataSourceName: dashboardDetail.ds_name,
              agentName: dashboardDetail.cluster_name,
              information:
                PreConfiguredDashboards[
                  selectedDashboard.selectedDashboardTemplateID ?? 0
                ].information,
              panelGroupMap:
                PreConfiguredDashboards[
                  selectedDashboard.selectedDashboardTemplateID ?? 0
                ].panelGroupMap ?? [],
              panelGroups: dashboardDetail.panel_groups,
            });
            setUpdate(true);
          }
        }
      );
    }
  }, [dashboardList]);

  useEffect(() => {
    if (update === true) {
      CallbackToSetVars(dashboardDetails);
      setUpdate(false);
    }
  }, [update]);

  return (
    <div>
      <div className={classes.root}>
        <Typography className={classes.heading}>
          <strong>Dashboard Information</strong>
        </Typography>
        <div className={classes.flexDisplay}>
          <div className={classes.inputDivField}>
            <InputField
              label="Name"
              data-cy="inputDashboardName"
              variant={
                validateTextEmpty(dashboardDetails.name) ? 'error' : 'primary'
              }
              onChange={nameChangeHandler}
              value={dashboardDetails.name}
            />
          </div>
          <div className={classes.inputDivField}>
            <InputField
              label="Dashboard Type"
              data-cy="inputDashboardType"
              variant={
                validateTextEmpty(dashboardDetails.dashboardType)
                  ? 'error'
                  : 'primary'
              }
              disabled
              value={dashboardDetails.dashboardType}
            />
          </div>
        </div>

        <div className={classes.flexDisplay}>
          <div className={classes.inputDiv}>
            <FormControl
              variant="outlined"
              className={classes.formControl}
              color="primary"
              focused
            >
              <InputLabel className={classes.selectText}>
                Data Source Type
              </InputLabel>
              <Select
                value={dashboardDetails.dataSourceType}
                onChange={(event) => {
                  setDashboardDetails({
                    ...dashboardDetails,
                    dataSourceType: event.target.value as string,
                  });
                  setUpdate(true);
                }}
                label="Data Source Type"
                className={classes.selectText}
              >
                {getDataSourceType(dataSourceList?.ListDataSource ?? []).map(
                  (dataSourceType: string) => (
                    <MenuItem value={dataSourceType}>{dataSourceType}</MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </div>

          <div className={classes.inputDiv}>
            <FormControl
              variant="outlined"
              className={classes.formControl}
              color="primary"
              focused
            >
              <InputLabel className={classes.selectText}>
                Data Source
              </InputLabel>
              <Select
                value={dashboardDetails.dataSourceID}
                onChange={(event) => {
                  let selectedDataSourceName: string = '';
                  dataSourceList?.ListDataSource.filter((datasource) => {
                    return (
                      datasource.ds_type === dashboardDetails.dataSourceType
                    );
                  }).forEach((dataSource: ListDataSourceResponse) => {
                    if (dataSource.ds_id === (event.target.value as string)) {
                      selectedDataSourceName = dataSource.ds_name;
                    }
                  });
                  setDashboardDetails({
                    ...dashboardDetails,
                    dataSourceID: event.target.value as string,
                    dataSourceName: selectedDataSourceName,
                  });
                  setUpdate(true);
                }}
                label="Data Source"
                className={classes.selectText}
              >
                {(dataSourceList?.ListDataSource ?? []).map(
                  (dataSource: ListDataSourceResponse) => (
                    <MenuItem value={dataSource.ds_id}>
                      {dataSource.ds_name}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </div>
        </div>

        <div className={classes.inputDiv}>
          <FormControl
            variant="outlined"
            className={classes.formControlSingle}
            color="primary"
            focused
          >
            <InputLabel className={classes.selectText}>Agent</InputLabel>
            <Select
              value={dashboardDetails.agentID}
              onChange={(event) => {
                let selectedAgentName: string = '';
                agentList?.getCluster.forEach((agent: Cluster) => {
                  if (agent.cluster_id === (event.target.value as string)) {
                    selectedAgentName = agent.cluster_name;
                  }
                });
                setDashboardDetails({
                  ...dashboardDetails,
                  agentID: event.target.value as string,
                  agentName: selectedAgentName,
                });
                setUpdate(true);
              }}
              label="Agent"
              className={classes.selectText}
            >
              {(agentList?.getCluster ?? [])
                .filter((cluster) => {
                  return (
                    cluster.is_active &&
                    cluster.is_cluster_confirmed &&
                    cluster.is_registered
                  );
                })
                .map((agent: Cluster) => (
                  <MenuItem value={agent.cluster_id}>
                    {agent.cluster_name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </div>

        <Divider variant="middle" className={classes.horizontalLine} />

        <div className={classes.flexDisplayInformation}>
          <div className={classes.inputDivInformationHead}>
            <Typography
              className={classes.headingHighlighted}
              align="center"
              variant="subtitle1"
            >
              <strong>{dashboardDetails.dashboardType}</strong>
            </Typography>
          </div>
          <div className={classes.inputDivInformationContent}>
            <Typography variant="body1" align="center">
              {dashboardDetails.information}
            </Typography>
          </div>
        </div>

        <Divider variant="middle" className={classes.horizontalLine} />

        <div className={classes.flexDisplayInformation}>
          <div className={classes.inputDivInformationHead}>
            <Typography
              className={classes.headingHighlighted}
              align="center"
              variant="subtitle1"
            >
              <strong>
                {t(
                  'analyticsDashboardViews.kubernetesDashboard.form.dashboardPanels'
                )}
              </strong>
            </Typography>
          </div>
          <div className={classes.inputDivInformationContent}>
            {dashboardDetails.panelGroupMap.map(
              (panelGroup: PanelGroupMap, index: number) => (
                <div className={classes.panelGroup}>
                  <div className={classes.panelGroupHead}>
                    <Typography
                      variant="body1"
                      align="center"
                      display="inline"
                      className={classes.panelGroupName}
                    >
                      {index + 1}
                      {`. `}
                      {panelGroup.groupName}
                    </Typography>
                  </div>
                  {panelGroup.panels.map((panel: string, index: number) => (
                    <Typography
                      variant="body1"
                      align="left"
                      className={classes.groupPanelBodyText}
                    >
                      &emsp;{index + 1}
                      {`. `}
                      {panel}
                    </Typography>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigureDashboard;
