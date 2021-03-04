/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-destructuring */
import { useMutation, useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import YAML from 'yaml';
import DashboardList from '../../components/PreconfiguredDashboards/data';
import Scaffold from '../../containers/layouts/Scaffold';
import { SCHEDULE_DETAILS } from '../../graphql';
import { CREATE_DASHBOARD, UPDATE_DASHBOARD } from '../../graphql/mutations';
import {
  Artifact,
  CronWorkflowYaml,
  Parameter,
  Template,
  WorkflowYaml,
} from '../../models/chaosWorkflowYaml';
import {
  ChaosEngineNamesAndNamespacesMap,
  DashboardDetails,
} from '../../models/dashboardsData';
import {
  CreateDashboardInput,
  Panel,
  PanelGroup,
  PanelGroupResponse,
  UpdateDashboardInput,
  updatePanelGroupInput,
} from '../../models/graphql/dashboardsDetails';
import {
  ScheduleDataVars,
  Schedules,
  ScheduleWorkflow,
} from '../../models/graphql/scheduleData';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { ReactComponent as CrossMarkIcon } from '../../svg/crossmark.svg';
import { validateWorkflowParameter } from '../../utils/validate';
import {
  generateChaosQuery,
  getWorkflowParameter,
} from '../../utils/yamlUtils';
import ConfigureDashboard from '../../views/AnalyticsDashboard/KubernetesDashboards/Form';
import useStyles from './styles';

interface DashboardConfigurePageProps {
  configure: boolean;
}

const DashboardConfigurePage: React.FC<DashboardConfigurePageProps> = ({
  configure,
}) => {
  const classes = useStyles();
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );
  const dashboardID = useSelector(
    (state: RootState) => state.selectDashboard.selectedDashboardID
  );
  const DashboardTemplateID = useSelector(
    (state: RootState) => state.selectDashboard.selectedDashboardTemplateID
  );
  const selectedDashboardName = useSelector(
    (state: RootState) => state.selectDashboard.selectedDashboardName
  );
  const [open, setOpen] = React.useState(false);
  const [disabled, setDisabled] = React.useState(true);
  const [dashboardVars, setDashboardVars] = useState<DashboardDetails>({
    id: '',
    name: '',
    dashboardType: '',
    dataSourceType: '',
    dataSourceID: '',
    agentID: '',
    dataSourceName: '',
    agentName: '',
    information: '',
    panelGroupMap: [],
    panelGroups: [],
  });
  const [mutate, setMutate] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  // Apollo query to get the scheduled data
  const { data: workflowSchedules } = useQuery<Schedules, ScheduleDataVars>(
    SCHEDULE_DETAILS,
    {
      variables: { projectID: selectedProjectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  const [createDashboard] = useMutation<CreateDashboardInput>(
    CREATE_DASHBOARD,
    {
      onCompleted: () => {
        setSuccess(true);
        setMutate(false);
        setOpen(true);
      },
      onError: () => {
        setMutate(false);
        setOpen(true);
      },
    }
  );
  const [updateDashboard] = useMutation<UpdateDashboardInput>(
    UPDATE_DASHBOARD,
    {
      onCompleted: () => {
        setSuccess(true);
        setMutate(false);
        setOpen(true);
      },
      onError: () => {
        setMutate(false);
        setOpen(true);
      },
    }
  );

  const getPanelGroups = () => {
    if (configure === false) {
      const chaosEngineNamesAndNamespacesMap: ChaosEngineNamesAndNamespacesMap[] = [];
      workflowSchedules?.getScheduledWorkflows.forEach(
        (schedule: ScheduleWorkflow) => {
          if (
            schedule.cluster_id === dashboardVars.agentID &&
            !schedule.isRemoved
          ) {
            let workflowYaml: WorkflowYaml | CronWorkflowYaml;
            let parametersMap: Parameter[];
            let workflowYamlCheck: boolean = true;
            try {
              workflowYaml = JSON.parse(schedule.workflow_manifest);
              parametersMap = (workflowYaml as WorkflowYaml).spec.arguments
                .parameters;
            } catch (err) {
              workflowYaml = JSON.parse(schedule.workflow_manifest);
              parametersMap = (workflowYaml as CronWorkflowYaml).spec
                .workflowSpec.arguments.parameters;
              workflowYamlCheck = false;
            }
            (workflowYamlCheck
              ? (workflowYaml as WorkflowYaml).spec.templates
              : (workflowYaml as CronWorkflowYaml).spec.workflowSpec.templates
            ).forEach((template: Template) => {
              if (template.inputs) {
                // TODO it will crash on create configurer new dashboard
                (template.inputs?.artifacts ?? []).forEach(
                  (artifact: Artifact) => {
                    const parsedEmbeddedYaml = YAML.parse(artifact.raw.data);
                    if (parsedEmbeddedYaml.kind === 'ChaosEngine') {
                      let engineNamespace: string = '';
                      if (
                        typeof parsedEmbeddedYaml.metadata.namespace ===
                        'string'
                      ) {
                        engineNamespace = (parsedEmbeddedYaml.metadata
                          .namespace as string).substring(
                          1,
                          (parsedEmbeddedYaml.metadata.namespace as string)
                            .length - 1
                        );
                      } else {
                        engineNamespace = Object.keys(
                          parsedEmbeddedYaml.metadata.namespace
                        )[0];
                      }
                      if (validateWorkflowParameter(engineNamespace)) {
                        engineNamespace = getWorkflowParameter(engineNamespace);
                        parametersMap.forEach(
                          (parameterKeyValue: Parameter) => {
                            if (parameterKeyValue.name === engineNamespace) {
                              engineNamespace = parameterKeyValue.value;
                            }
                          }
                        );
                      } else {
                        engineNamespace = parsedEmbeddedYaml.metadata.namespace;
                      }
                      let matchIndex: number = -1;
                      const check: number = chaosEngineNamesAndNamespacesMap.filter(
                        (data, index) => {
                          if (
                            data.engineName ===
                              parsedEmbeddedYaml.metadata.name &&
                            data.engineNamespace === engineNamespace
                          ) {
                            matchIndex = index;
                            return true;
                          }
                          return false;
                        }
                      ).length;
                      if (check === 0) {
                        chaosEngineNamesAndNamespacesMap.push({
                          engineName: parsedEmbeddedYaml.metadata.name,
                          engineNamespace,
                          workflowName: workflowYaml.metadata.name,
                        });
                      } else {
                        chaosEngineNamesAndNamespacesMap[
                          matchIndex
                        ].workflowName = `${chaosEngineNamesAndNamespacesMap[matchIndex].workflowName}, \n${workflowYaml.metadata.name}`;
                      }
                    }
                  }
                );
              }
            });
          }
        }
      );

      const panelGroups: PanelGroup[] = [];
      DashboardList[DashboardTemplateID ?? 0].panelGroups.forEach(
        (panelGroup) => {
          const selectedPanels: Panel[] = [];
          panelGroup.panels.forEach((panel) => {
            const selectedPanel: Panel = panel;
            chaosEngineNamesAndNamespacesMap.forEach((keyValue) => {
              selectedPanel.prom_queries.push({
                queryid: uuidv4(),
                prom_query_name: generateChaosQuery(
                  DashboardList[DashboardTemplateID ?? 0]
                    .chaosEventQueryTemplate,
                  keyValue.engineName,
                  keyValue.engineNamespace
                ),
                legend: `${keyValue.workflowName}- \n${keyValue.engineName}`,
                resolution: '1/1',
                minstep: '1',
                line: false,
                close_area: true,
              });
            });
            selectedPanels.push(selectedPanel);
          });
          panelGroups.push({
            panel_group_name: panelGroup.panel_group_name,
            panels: selectedPanels,
          });
        }
      );
      return panelGroups;
    }
    const panelGroups: updatePanelGroupInput[] = [];
    if (dashboardVars.panelGroups?.length) {
      dashboardVars.panelGroups.forEach((panelGroup: PanelGroupResponse) => {
        panelGroups.push({
          panel_group_id: panelGroup.panel_group_id,
          panel_group_name: panelGroup.panel_group_name,
        });
      });
    }
    return panelGroups;
  };

  const handleCreateMutation = () => {
    const dashboardInput = {
      ds_id: dashboardVars.dataSourceID,
      db_name: dashboardVars.name,
      db_type: dashboardVars.dashboardType,
      panel_groups: getPanelGroups(),
      end_time: `${Math.round(new Date().getTime() / 1000)}`,
      start_time: `${Math.round(new Date().getTime() / 1000) - 1800}`,
      project_id: selectedProjectID,
      cluster_id: dashboardVars.agentID,
      refresh_rate: '5',
    };
    createDashboard({
      variables: { createDBInput: dashboardInput },
    });
  };

  const handleUpdateMutation = () => {
    const dashboardInput = {
      db_id: dashboardVars.id as string,
      ds_id: dashboardVars.dataSourceID,
      db_name: dashboardVars.name,
      db_type: dashboardVars.dashboardType,
      panel_groups: getPanelGroups(),
      end_time: `${Math.round(new Date().getTime() / 1000)}`,
      start_time: `${Math.round(new Date().getTime() / 1000) - 1800}`,
      refresh_rate: '5',
    };
    updateDashboard({
      variables: { updataDBInput: dashboardInput },
    });
  };

  useEffect(() => {
    if (mutate === true && configure === false) {
      handleCreateMutation();
    } else if (mutate === true && configure === true) {
      handleUpdateMutation();
    }
  }, [mutate]);

  useEffect(() => {
    if (
      dashboardVars.agentID === '' ||
      dashboardVars.dataSourceID === '' ||
      dashboardVars.dataSourceType === '' ||
      dashboardVars.name === ''
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [dashboardVars]);

  return (
    <Scaffold>
      <div className={classes.rootConfigure}>
        {configure === false ? (
          <div>
            <div className={classes.config}>
              <Typography className={classes.heading}>
                Configure a new dashboard
              </Typography>
              <Typography className={classes.description}>
                Provide Dashboard metadata for your project.
              </Typography>
            </div>
            <ConfigureDashboard
              configure={configure}
              CallbackToSetVars={(vars: DashboardDetails) => {
                setDashboardVars(vars);
              }}
            />
          </div>
        ) : (
          <div>
            <div className={classes.config}>
              <Typography className={classes.heading}>
                Configure dashboard / {selectedDashboardName}
              </Typography>
              <Typography className={classes.description}>
                Configure dashboard information.
              </Typography>
            </div>
            {dashboardID ? (
              <ConfigureDashboard
                configure={configure}
                dashboardID={dashboardID}
                CallbackToSetVars={(vars: DashboardDetails) => {
                  setDashboardVars(vars);
                }}
              />
            ) : (
              <div />
            )}
          </div>
        )}

        <div className={classes.buttons}>
          <div className={classes.cancelButton}>
            <ButtonOutlined
              onClick={() => window.history.back()}
              disabled={false}
            >
              <div>Back</div>
            </ButtonOutlined>
          </div>
          <div className={classes.saveButton}>
            <ButtonFilled
              disabled={disabled}
              variant="success"
              onClick={() => setMutate(true)}
            >
              <div>{'\u2713'} Save</div>
            </ButtonFilled>
          </div>
        </div>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        modalActions={
          <ButtonOutlined
            className={classes.closeButton}
            onClick={() => setOpen(false)}
          >
            &#x2715;
          </ButtonOutlined>
        }
      >
        <div>
          <Typography align="center">
            {success === true ? (
              <img
                src="/icons/finish.svg"
                alt="success"
                className={classes.icon}
              />
            ) : (
              <CrossMarkIcon className={classes.icon} />
            )}
          </Typography>

          <Typography
            className={classes.modalHeading}
            align="center"
            variant="h3"
          >
            {success === true && configure === false
              ? `A new dashboard is successfully created`
              : success === true && configure === true
              ? `Dashboard successfully reconfigured`
              : `There was a problem while configuring your dashboard`}
          </Typography>

          <Typography
            align="center"
            variant="body1"
            className={classes.modalBody}
          >
            {success === true && configure === false ? (
              <div>You will see the dashboard in the home page.</div>
            ) : success === true && configure === true ? (
              <div>
                You will see the updated dashboard configuration in the
                dashboard table.
              </div>
            ) : (
              <div>Try back again or check your entered details.</div>
            )}
          </Typography>

          {success === true ? (
            <ButtonFilled
              variant="success"
              onClick={() => history.push('/analytics')}
            >
              <div>Back to Kubernetes Dashboard</div>
            </ButtonFilled>
          ) : (
            <div className={classes.flexButtons}>
              <ButtonOutlined
                onClick={() => {
                  setOpen(false);
                  setMutate(true);
                }}
                disabled={false}
              >
                <div>Try Again</div>
              </ButtonOutlined>

              <ButtonFilled
                variant="error"
                onClick={() => history.push('/analytics')}
              >
                <div>Back to Kubernetes Dashboard</div>
              </ButtonFilled>
            </div>
          )}
        </div>
      </Modal>
    </Scaffold>
  );
};

export default DashboardConfigurePage;
