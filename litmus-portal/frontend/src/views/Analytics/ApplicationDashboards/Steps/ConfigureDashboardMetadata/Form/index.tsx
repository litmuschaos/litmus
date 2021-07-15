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
import {
  DEFAULT_CHAOS_EVENT_PROMETHEUS_QUERY,
  DEFAULT_CHAOS_VERDICT_PROMETHEUS_QUERY,
} from '../../../../../../pages/ApplicationDashboard/constants';
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
  const [update, setUpdate] = useState(false);
  const [availableApplicationMetadataMap, setAvailableApplicationMetadataMap] =
    useState<ApplicationMetadata[]>([]);
  const [kubeObjInput, setKubeObjInput] = useState<GVRRequest>({
    group: '',
    version: 'v1',
    resource: 'pods',
  });
  const [selectedNamespaceList, setSelectedNamespaceList] = useState<
    Array<Option>
  >([]);
  const [activeAgents, setActiveAgents] = useState<Cluster[]>([]);

  const getSelectedApps = (dashboardJSON: any) => {
    dashboard.selectDashboard({
      selectedDashboardID: '',
    });
    const selectedApps: ApplicationMetadata[] = [];
    if (dashboardJSON.applicationMetadataMap) {
      dashboardJSON.applicationMetadataMap.forEach(
        (applicationMetadata: ApplicationMetadata) => {
          const namespaceApps = availableApplicationMetadataMap.filter(
            (appMeta) => appMeta.namespace === applicationMetadata.namespace
          )[0];
          applicationMetadata.applications.forEach((app) => {
            const kindApps = namespaceApps.applications.filter(
              (appKind) => appKind.kind === app.kind
            )[0];
            const availableApps = app.names.filter((name) =>
              kindApps.names.includes(name)
            );
            if (availableApps.length) {
              let nsIndex = -1;
              selectedApps.forEach((existingApp, index) => {
                if (existingApp.namespace === applicationMetadata.namespace) {
                  nsIndex = index;
                }
              });
              if (nsIndex !== -1) {
                selectedApps[nsIndex].applications.push({
                  kind: app.kind,
                  names: availableApps,
                });
              } else {
                selectedApps.push({
                  namespace: applicationMetadata.namespace,
                  applications: [
                    {
                      kind: app.kind,
                      names: availableApps,
                    },
                  ],
                });
              }
            }
          });
        }
      );
    }
    return selectedApps;
  };

  const [activeDataSources, setActiveDataSources] = useState<
    ListDataSourceResponse[]
  >([]);
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
        : DEFAULT_CHAOS_EVENT_PROMETHEUS_QUERY
      : dashboardVars.chaosEventQueryTemplate ?? '',
    chaosVerdictQueryTemplate: !configure
      ? selectedDashboard.dashboardJSON
        ? selectedDashboard.dashboardJSON.chaosVerdictQueryTemplate
        : DEFAULT_CHAOS_VERDICT_PROMETHEUS_QUERY
      : dashboardVars.chaosVerdictQueryTemplate ?? '',
    agentID: dashboardVars.agentID ?? '',
    information: !configure
      ? selectedDashboard.dashboardJSON
        ? selectedDashboard.dashboardJSON.information
        : 'Customized dashboard'
      : dashboardVars.information ?? '',
    panelGroupMap: dashboardVars.panelGroupMap ?? [],
    panelGroups: dashboardVars.panelGroups ?? [],
    applicationMetadataMap:
      !configure && selectedDashboard.selectedDashboardID === 'upload'
        ? getSelectedApps(selectedDashboard.dashboardJSON)
        : dashboardVars.applicationMetadataMap ?? [],
  });

  // Apollo query to get the agent data
  const {
    data: agentList,
    loading,
    error,
  } = useQuery<Clusters, ClusterVars>(GET_CLUSTER, {
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
    const availableAgents = (agentList?.getCluster ?? []).filter((cluster) => {
      return (
        cluster.is_active &&
        cluster.is_cluster_confirmed &&
        cluster.is_registered
      );
    });
    setActiveAgents(availableAgents);
    if (dashboardDetails.agentID === '' && !configure) {
      setDashboardDetails({
        ...dashboardDetails,
        agentID: availableAgents.length ? availableAgents[0].cluster_id : '',
      });
      setUpdate(true);
    }
  }, [agentList]);

  useEffect(() => {
    const availableDataSources = dataSourceList.filter((dataSource) => {
      return dataSource.health_status === 'Active';
    });
    setActiveDataSources(availableDataSources);
    if (dashboardDetails.dataSourceID === '' && !configure) {
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

  useEffect(() => {
    if (!configure && selectedDashboard.selectedDashboardID === 'upload') {
      setDashboardDetails({
        ...dashboardDetails,
        applicationMetadataMap: getSelectedApps(
          selectedDashboard.dashboardJSON
        ),
      });
    }
  }, [availableApplicationMetadataMap]);

  const getAvailableApplications = () => {
    const availableApplications: Array<Option> = [];
    availableApplicationMetadataMap.forEach((appMetadata) => {
      if (selectedNamespaceList.length) {
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
      }
    });
    return availableApplications;
  };

  const getSelectedAppDetails = () => {
    const options: Array<Option> = [];
    if (dashboardDetails.applicationMetadataMap) {
      dashboardDetails.applicationMetadataMap.forEach((app) => {
        app.applications.forEach((resources) => {
          resources.names.forEach((name) => {
            options.push({
              name: `${app.namespace} / ${resources.kind} / ${name}`,
            });
          });
        });
      });
    }
    return options;
  };

  const getSelectedAppNamespaces = () => {
    const options: Array<Option> = [];
    if (dashboardDetails.applicationMetadataMap) {
      dashboardDetails.applicationMetadataMap.forEach((app) => {
        options.push({
          name: app.namespace,
        });
      });
    }
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
            disabled={activeAgents.length === 0 || loading}
          >
            {activeAgents.map((agent: Cluster) => (
              <MenuItem key={agent.cluster_id} value={agent.cluster_id}>
                {agent.cluster_name}
              </MenuItem>
            ))}
          </Select>
          {!activeAgents.length && !loading ? (
            <Typography className={classes.formErrorText}>
              {t(
                'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.noActiveAgent'
              )}
            </Typography>
          ) : !(agentList?.getCluster ?? []).filter((cluster) => {
              return (
                cluster.cluster_id === dashboardDetails.agentID &&
                cluster.is_active &&
                cluster.is_cluster_confirmed &&
                cluster.is_registered
              );
            }).length && agentList?.getCluster.length ? (
            <Typography className={classes.formErrorText}>
              {t(
                'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.agentInactive'
              )}
            </Typography>
          ) : loading ? (
            <Typography className={classes.formHelperText}>
              {t(
                'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.fetchingAgents'
              )}
            </Typography>
          ) : error ? (
            <Typography className={classes.formErrorText}>
              {t(
                'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.errorFetchingAgents'
              )}
            </Typography>
          ) : (
            <></>
          )}
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
            disabled={activeDataSources.length === 0}
          >
            {activeDataSources.map((dataSource: ListDataSourceResponse) => (
              <MenuItem key={dataSource.ds_id} value={dataSource.ds_id}>
                {dataSource.ds_name}
              </MenuItem>
            ))}
          </Select>
          {!activeDataSources.length ? (
            <Typography className={classes.formErrorText}>
              {t(
                'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.noActiveDataSource'
              )}
            </Typography>
          ) : !dataSourceList.filter((dataSource) => {
              return (
                dataSource.health_status === 'Active' &&
                dataSource.ds_id === dashboardDetails.dataSourceID
              );
            }).length ? (
            <Typography className={classes.formErrorText}>
              {t(
                'analyticsDashboard.applicationDashboards.configureDashboardMetadata.form.dataSourceInactive'
              )}
            </Typography>
          ) : (
            <></>
          )}
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
            onChange={(event, value) =>
              setSelectedNamespaceList(value as Array<Option>)
            }
            getOptionSelected={(option) =>
              selectedNamespaceList
                .map((selections) => selections.name)
                .includes(option.name)
            }
            options={
              availableApplicationMetadataMap.map((value) => {
                return { name: value.namespace };
              }) ?? []
            }
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
              onChange={(event, value) => {
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
              getOptionSelected={(option) =>
                getSelectedAppDetails()
                  .map((selections) => selections.name)
                  .includes(option.name)
              }
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
