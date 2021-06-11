/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery, useSubscription } from '@apollo/client';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import { AutocompleteChipInput, InputField } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { GET_CLUSTER, KUBE_OBJ } from '../../../../../../graphql';
import { DashboardDetails } from '../../../../../../models/dashboardsData';
import {
  Cluster,
  Clusters,
  ClusterVars,
} from '../../../../../../models/graphql/clusterData';
import {
  GVRRequest,
  KubeObjData,
  KubeObjRequest,
  KubeObjResource,
  KubeObjResponse,
} from '../../../../../../models/graphql/createWorkflowData';
import {
  ApplicationMetadata,
  Resource,
} from '../../../../../../models/graphql/dashboardsDetails';
import { ListDataSourceResponse } from '../../../../../../models/graphql/dataSourceDetails';
import useActions from '../../../../../../redux/actions';
import * as DashboardActions from '../../../../../../redux/actions/dashboards';
import { RootState } from '../../../../../../redux/reducers';
import { getProjectID } from '../../../../../../utils/getSearchParams';
import { validateTextEmpty } from '../../../../../../utils/validate';
import gvrList from './data';
import useStyles from './styles';

interface DashboardMetadataFormProps {
  dashboardVars: DashboardDetails;
  dataSourceList: ListDataSourceResponse[];
  configure: boolean;
  CallbackToSetVars: (vars: DashboardDetails) => void;
  setDisabledNext: (next: boolean) => void;
}

interface Option {
  name: string;
  [index: string]: any;
}

const DashboardMetadataForm: React.FC<DashboardMetadataFormProps> = ({
  dashboardVars,
  dataSourceList,
  configure,
  CallbackToSetVars,
  setDisabledNext,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const projectID = getProjectID();
  const dashboard = useActions(DashboardActions);
  const selectedDashboard = useSelector(
    (state: RootState) => state.selectDashboard
  );

  const getSelectedApps = (dashboardJSON: any) => {
    dashboard.selectDashboard({
      selectedDashboardID: '',
    });
    return dashboardJSON.applicationMetadataMap;
  };

  const [dashboardDetails, setDashboardDetails] = useState<DashboardDetails>({
    id: !configure ? '' : dashboardVars.id ?? '',
    name: !configure
      ? selectedDashboard.dashboardJSON
        ? selectedDashboard.dashboardJSON.name
        : 'custom'
      : dashboardVars.name ?? '',
    dashboardTypeID: !configure
      ? selectedDashboard.dashboardJSON
        ? selectedDashboard.dashboardJSON.dashboardID
        : 'custom'
      : dashboardVars.dashboardTypeID ?? '',
    dashboardTypeName: !configure
      ? selectedDashboard.dashboardJSON
        ? selectedDashboard.dashboardJSON.name
        : 'Custom'
      : dashboardVars.dashboardTypeName ?? '',
    dataSourceType: !configure
      ? 'Prometheus'
      : dashboardVars.dataSourceType ?? '',
    dataSourceID: dashboardVars.dataSourceID ?? '',
    dataSourceURL: dashboardVars.dataSourceURL ?? '',
    chaosEventQueryTemplate: !configure
      ? selectedDashboard.dashboardJSON
        ? selectedDashboard.dashboardJSON.chaosEventQueryTemplate
        : 'litmuschaos_awaited_experiments{job="chaos-exporter"}'
      : dashboardVars.chaosEventQueryTemplate ?? '',
    chaosVerdictQueryTemplate: !configure
      ? selectedDashboard.dashboardJSON
        ? selectedDashboard.dashboardJSON.chaosVerdictQueryTemplate
        : 'litmuschaos_experiment_verdict{job="chaos-exporter"}'
      : dashboardVars.chaosVerdictQueryTemplate ?? '',
    agentID: dashboardVars.agentID ?? '',
    information: !configure
      ? selectedDashboard.dashboardJSON
        ? selectedDashboard.dashboardJSON.information
        : 'Customized dashboard'
      : dashboardVars.information ?? '',
    panelGroupMap: dashboardVars.panelGroupMap ?? [],
    panelGroups: dashboardVars.panelGroups ?? [],
    applicationMetadataMap: !configure
      ? selectedDashboard.selectedDashboardID !== 'upload'
        ? dashboardVars.applicationMetadataMap
        : getSelectedApps(selectedDashboard.dashboardJSON)
      : dashboardVars.applicationMetadataMap ?? [],
  });
  const [update, setUpdate] = useState(false);
  const [
    availableApplicationMetadataMap,
    setAvailableApplicationMetadataMap,
  ] = useState<ApplicationMetadata[]>([]);
  const [kubeObjInput, setKubeObjInput] = useState<GVRRequest>({
    group: '',
    version: 'v1',
    resource: 'pods',
  });
  const [selectedNamespaceList, setSelectedNamespaceList] = useState<
    Array<Option>
  >([]);

  // Apollo query to get the agent data
  const { data: agentList } = useQuery<Clusters, ClusterVars>(GET_CLUSTER, {
    variables: { project_id: projectID },
    fetchPolicy: 'cache-and-network',
  });

  /**
   * GraphQL subscription to fetch the KubeObjData from the server
   */
  const { data: kubeObjectData } = useSubscription<
    KubeObjResponse,
    KubeObjRequest
  >(KUBE_OBJ, {
    variables: {
      data: {
        cluster_id: dashboardDetails.agentID ?? '',
        object_type: 'kubeobject',
        kube_obj_request: {
          group: kubeObjInput.group,
          version: kubeObjInput.version,
          resource: kubeObjInput.resource,
        },
      },
    },
    onSubscriptionComplete: () => {
      const newAvailableApplicationMetadataMap: ApplicationMetadata[] = [];
      try {
        const kubeData: KubeObjData[] = JSON.parse(
          kubeObjectData?.getKubeObject.kube_obj ?? ''
        );
        kubeData.forEach((obj: KubeObjData) => {
          const newAvailableApplicationMetadata: ApplicationMetadata = {
            namespace: obj.namespace,
            applications: [
              {
                kind: kubeObjInput.resource,
                names: [],
              },
            ],
          };
          if (obj.data != null) {
            obj.data.forEach((objData: KubeObjResource) => {
              if (objData.name != null) {
                newAvailableApplicationMetadata.applications[0].names.push(
                  objData.name
                );
              }
            });
          }
          newAvailableApplicationMetadataMap.push(
            newAvailableApplicationMetadata
          );
        });
      } catch (err) {
        console.error(err);
      }
      setAvailableApplicationMetadataMap(newAvailableApplicationMetadataMap);
    },
    fetchPolicy: 'network-only',
  });

  const nameChangeHandler = (event: React.ChangeEvent<{ value: string }>) => {
    setDashboardDetails({
      ...dashboardDetails,
      name: (event.target as HTMLInputElement).value,
    });
    setUpdate(true);
  };

  const getSelectedDsURL = (selectedDsID: string) => {
    let selectedDsURL: string = '';
    dataSourceList.forEach((ds) => {
      if (ds.ds_id === selectedDsID) {
        selectedDsURL = ds.ds_url;
      }
    });
    return selectedDsURL;
  };

  useEffect(() => {
    if (
      dashboardDetails.name === '' ||
      dashboardDetails.dashboardTypeID === '' ||
      dashboardDetails.dashboardTypeName === '' ||
      dashboardDetails.dataSourceType === '' ||
      dashboardDetails.dataSourceID === '' ||
      dashboardDetails.dataSourceURL === '' ||
      dashboardDetails.chaosEventQueryTemplate === '' ||
      dashboardDetails.chaosVerdictQueryTemplate === '' ||
      dashboardDetails.agentID === '' ||
      dashboardDetails.information === ''
    ) {
      setDisabledNext(true);
    } else if (
      configure === true &&
      (dashboardDetails.id === '' ||
        dashboardDetails.panelGroupMap?.length === 0 ||
        dashboardDetails.panelGroups?.length === 0)
    ) {
      setDisabledNext(true);
    } else {
      setDisabledNext(false);
    }
    if (update === true) {
      CallbackToSetVars(dashboardDetails);
      setUpdate(false);
    }
  }, [update]);

  useEffect(() => {
    if (dashboardDetails.agentID === '' && !configure) {
      const availableAgents = (agentList?.getCluster ?? []).filter(
        (cluster) => {
          return (
            cluster.is_active &&
            cluster.is_cluster_confirmed &&
            cluster.is_registered
          );
        }
      );
      setDashboardDetails({
        ...dashboardDetails,
        agentID: availableAgents.length ? availableAgents[0].cluster_id : '',
      });
      setUpdate(true);
    }
  }, [agentList]);

  useEffect(() => {
    if (dashboardDetails.dataSourceID === '' && !configure) {
      const availableDataSources = dataSourceList.filter((dataSource) => {
        return dataSource.health_status === 'Active';
      });
      setDashboardDetails({
        ...dashboardDetails,
        dataSourceID: availableDataSources.length
          ? availableDataSources[0].ds_id
          : '',
        dataSourceURL: availableDataSources.length
          ? availableDataSources[0].ds_url
          : '',
      });
      setUpdate(true);
    }
  }, [dataSourceList]);

  const getAvailableApplications = () => {
    const availableApplications: Array<Option> = [];
    availableApplicationMetadataMap.forEach((appMetadata) => {
      selectedNamespaceList.forEach((namespaceOption) => {
        if (namespaceOption.name === appMetadata.namespace) {
          const apps: Resource[] = appMetadata.applications.filter(
            (application) => application.kind === kubeObjInput.resource
          );
          if (apps.length) {
            apps[0].names.forEach((appName) => {
              availableApplications.push({
                name: `${
                  namespaceOption.name
                } / ${kubeObjInput.resource.substring(
                  0,
                  kubeObjInput.resource.length - 1
                )} / ${appName}`,
              });
            });
          }
        }
      });
    });
    return availableApplications;
  };

  const getSelectedAppDetails = () => {
    const options: Array<Option> = [];
    dashboardDetails.applicationMetadataMap?.forEach((app) => {
      app.applications.forEach((resources) => {
        resources.names.forEach((name) => {
          options.push({
            name: `${app.namespace} / ${resources.kind} / ${name}`,
          });
        });
      });
    });
    return options;
  };

  const getSelectedAppNamespaces = () => {
    const options: Array<Option> = [];
    dashboardDetails.applicationMetadataMap?.forEach((app) => {
      options.push({
        name: app.namespace,
      });
    });
    return options;
  };

  useEffect(() => {
    if (configure) {
      setDashboardDetails({
        ...dashboardVars,
      });
      if (
        dashboardDetails.name === '' ||
        dashboardDetails.dashboardTypeID === '' ||
        dashboardDetails.dashboardTypeName === '' ||
        dashboardDetails.dataSourceType === '' ||
        dashboardDetails.dataSourceID === '' ||
        dashboardDetails.dataSourceURL === '' ||
        dashboardDetails.chaosEventQueryTemplate === '' ||
        dashboardDetails.chaosVerdictQueryTemplate === '' ||
        dashboardDetails.agentID === '' ||
        dashboardDetails.information === '' ||
        dashboardDetails.panelGroupMap?.length === 0 ||
        dashboardDetails.panelGroups?.length === 0
      ) {
        setDisabledNext(true);
      } else {
        setDisabledNext(false);
      }
    }
  }, [dashboardVars]);

  return (
    <div className={classes.root}>
      <div className={classes.flexDisplay}>
        <InputField
          label={t(
            'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.name'
          )}
          data-cy="inputDashboardName"
          width="20rem"
          variant={
            validateTextEmpty(dashboardDetails.name ?? '') ? 'error' : 'primary'
          }
          onChange={nameChangeHandler}
          value={dashboardDetails.name}
        />

        <FormControl
          variant="outlined"
          className={classes.formControl}
          color="primary"
        >
          <InputLabel className={classes.selectTextLabel}>
            {t(
              'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.agent'
            )}
          </InputLabel>
          <Select
            value={dashboardDetails.agentID}
            onChange={(event) => {
              setDashboardDetails({
                ...dashboardDetails,
                agentID: event.target.value as string,
              });
              setUpdate(true);
            }}
            label={t(
              'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.agent'
            )}
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
                <MenuItem key={agent.cluster_id} value={agent.cluster_id}>
                  {agent.cluster_name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </div>

      <div className={classes.flexDisplay}>
        <FormControl
          variant="outlined"
          className={classes.formControl}
          color="primary"
        >
          <InputLabel className={classes.selectTextLabel}>
            {t(
              'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.dataSource'
            )}
          </InputLabel>
          <Select
            value={dashboardDetails.dataSourceID}
            onChange={(event) => {
              setDashboardDetails({
                ...dashboardDetails,
                dataSourceID: event.target.value as string,
                dataSourceURL: getSelectedDsURL(event.target.value as string),
              });
              setUpdate(true);
            }}
            label={t(
              'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.dataSource'
            )}
            className={classes.selectText}
          >
            {dataSourceList.map((dataSource: ListDataSourceResponse) => (
              <MenuItem key={dataSource.ds_id} value={dataSource.ds_id}>
                {dataSource.ds_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <InputField
          label={t(
            'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.dashboardType'
          )}
          data-cy="inputDashboardType"
          width="20rem"
          variant={
            validateTextEmpty(dashboardDetails.dashboardTypeName ?? '')
              ? 'error'
              : 'primary'
          }
          disabled
          value={dashboardDetails.dashboardTypeName}
        />
      </div>

      {(dashboardDetails.dashboardTypeID === 'custom' ||
        dashboardDetails.dashboardTypeID?.startsWith('generic')) && (
        <div>
          <Typography className={classes.heading}>
            {t(
              'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.applications'
            )}
          </Typography>

          <AutocompleteChipInput
            defaultValue={getSelectedAppNamespaces()}
            onChange={(event, value, reason) => {
              setSelectedNamespaceList(value as Array<Option>);
            }}
            options={availableApplicationMetadataMap.map((value) => {
              return { name: value.namespace };
            })}
            label={t(
              'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.selectNamespaces'
            )}
            placeholder={`${t(
              'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.addNamespace'
            )}`}
            disableCloseOnSelect
            disableClearable={false}
            limitTags={4}
            className={classes.namespaceSelect}
          />

          <div className={classes.appSelectFlex}>
            <FormControl
              variant="outlined"
              className={classes.formControl}
              style={{ width: '12.5rem' }}
              color="primary"
            >
              <InputLabel className={classes.selectTextLabel}>
                {t(
                  'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.selectApplicationType'
                )}
              </InputLabel>
              <Select
                value={kubeObjInput.resource}
                onChange={(event: any) => {
                  setKubeObjInput(
                    gvrList.filter(
                      (gvr) => gvr.resource === (event.target.value as string)
                    )[0]
                  );
                }}
                label={t(
                  'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.selectApplicationType'
                )}
                className={classes.selectText}
              >
                {gvrList.map((gvr: GVRRequest) => (
                  <MenuItem key={gvr.resource} value={gvr.resource}>
                    {gvr.resource}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <AutocompleteChipInput
              defaultValue={getSelectedAppDetails()}
              onChange={(event, value, reason) => {
                const newSelection: ApplicationMetadata[] = [];
                const selectedApps: Array<Option> = value as Array<Option>;
                selectedApps.forEach((nsKindApp) => {
                  const selectedNs = nsKindApp.name.split('/')[0].trim();
                  const selectedKind = nsKindApp.name.split('/')[1].trim();
                  const selectedApp = nsKindApp.name.split('/')[2].trim();
                  let nsFound = false;
                  newSelection.forEach((nsMap, index) => {
                    if (nsMap.namespace === selectedNs) {
                      nsFound = true;
                      let kindFound = false;
                      newSelection[index].applications.forEach(
                        (kindMap, matchIndex) => {
                          if (kindMap.kind === selectedKind) {
                            kindFound = true;
                            newSelection[index].applications[
                              matchIndex
                            ].names.push(selectedApp);
                          }
                        }
                      );
                      if (!kindFound) {
                        newSelection[index].applications.push({
                          kind: selectedKind,
                          names: [selectedApp],
                        });
                      }
                    }
                  });
                  if (!nsFound) {
                    newSelection.push({
                      namespace: selectedNs,
                      applications: [
                        { kind: selectedKind, names: [selectedApp] },
                      ],
                    });
                  }
                });
                setDashboardDetails({
                  ...dashboardDetails,
                  applicationMetadataMap:
                    dashboardDetails.dashboardTypeID === 'custom' ||
                    dashboardDetails.dashboardTypeID?.startsWith('generic')
                      ? newSelection
                      : [],
                });
                setUpdate(true);
              }}
              options={getAvailableApplications()}
              label={t(
                'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.selectApplications'
              )}
              placeholder={`${t(
                'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.addApplication'
              )}`}
              disableCloseOnSelect
              disableClearable={false}
              limitTags={4}
              style={{ width: '27.5rem' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMetadataForm;
