/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery } from '@apollo/client';
import { IconButton, Menu, MenuItem, Typography } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import YAML from 'yaml';
import DashboardList from '../../../../components/PreconfiguredDashboards/data';
import { SCHEDULE_DETAILS } from '../../../../graphql';
import { DELETE_DASHBOARD, UPDATE_PANEL } from '../../../../graphql/mutations';
import {
  Artifact,
  CronWorkflowYaml,
  Parameter,
  Template,
  WorkflowYaml,
} from '../../../../models/chaosWorkflowYaml';
import { ChaosResultNamesAndNamespacesMap } from '../../../../models/dashboardsData';
import {
  DeleteDashboardInput,
  ListDashboardResponse,
  Panel,
  PanelGroup,
  PanelGroupResponse,
  PanelOption,
  PanelResponse,
  PromQuery,
  UpdatePanelInput,
} from '../../../../models/graphql/dashboardsDetails';
import {
  ScheduleDataVars,
  Schedules,
  ScheduleWorkflow,
} from '../../../../models/graphql/scheduleData';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import * as DataSourceActions from '../../../../redux/actions/dataSource';
import * as TabActions from '../../../../redux/actions/tabs';
import { history } from '../../../../redux/configureStore';
import { ReactComponent as CrossMarkIcon } from '../../../../svg/crossmark.svg';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import getEngineNameAndNamespace from '../../../../utils/promUtils';
import { validateWorkflowParameter } from '../../../../utils/validate';
import {
  generateChaosQuery,
  getWorkflowParameter,
} from '../../../../utils/yamlUtils';
import useStyles, { StyledTableCell } from './styles';

interface TableDataProps {
  data: ListDashboardResponse;
}

const TableData: React.FC<TableDataProps> = ({ data }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dashboard = useActions(DashboardActions);
  const dataSource = useActions(DataSourceActions);
  const tabs = useActions(TabActions);
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const [mutate, setMutate] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [
    dashboardSelectedForDeleting,
    setDashboardSelectedForDeleting,
  ] = React.useState<DeleteDashboardInput>({
    dbID: '',
  });
  // Apollo query to get the scheduled data
  const { data: workflowSchedules } = useQuery<Schedules, ScheduleDataVars>(
    SCHEDULE_DETAILS,
    {
      variables: { projectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  const [updatePanel] = useMutation<UpdatePanelInput>(UPDATE_PANEL, {
    onError: () => {
      console.error('error updating dashboard details');
    },
  });

  const [deleteDashboard] = useMutation<boolean, DeleteDashboardInput>(
    DELETE_DASHBOARD,
    {
      onCompleted: () => {
        setSuccess(true);
        setMutate(false);
        setOpenModal(true);
      },
      onError: () => {
        setMutate(false);
        setOpenModal(true);
      },
    }
  );

  // Function to convert UNIX time in format of dddd, DD MMM YYYY, HH:mm
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('dddd, DD MMM YYYY, HH:mm');
    return resDate;
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const reSyncChaosQueries = () => {
    const chaosResultNamesAndNamespacesMap: ChaosResultNamesAndNamespacesMap[] = [];
    workflowSchedules?.getScheduledWorkflows.forEach(
      (schedule: ScheduleWorkflow) => {
        if (schedule.cluster_id === data.cluster_id && !schedule.isRemoved) {
          let workflowYaml: WorkflowYaml | CronWorkflowYaml;
          let parametersMap: Parameter[];
          let workflowYamlCheck: boolean = true;
          try {
            workflowYaml = JSON.parse(schedule.workflow_manifest);
            parametersMap = (workflowYaml as WorkflowYaml).spec.arguments
              .parameters;
          } catch (err) {
            workflowYaml = JSON.parse(schedule.workflow_manifest);
            parametersMap = (workflowYaml as CronWorkflowYaml).spec.workflowSpec
              .arguments.parameters;
            workflowYamlCheck = false;
          }
          (workflowYamlCheck
            ? (workflowYaml as WorkflowYaml).spec.templates
            : (workflowYaml as CronWorkflowYaml).spec.workflowSpec.templates
          ).forEach((template: Template) => {
            if (template.inputs && template.inputs.artifacts) {
              template.inputs.artifacts.forEach((artifact: Artifact) => {
                const parsedEmbeddedYaml = YAML.parse(artifact.raw.data);
                if (parsedEmbeddedYaml.kind === 'ChaosEngine') {
                  let engineNamespace: string = '';
                  if (
                    typeof parsedEmbeddedYaml.metadata.namespace === 'string'
                  ) {
                    engineNamespace = (parsedEmbeddedYaml.metadata
                      .namespace as string).substring(
                      1,
                      (parsedEmbeddedYaml.metadata.namespace as string).length -
                        1
                    );
                  } else {
                    engineNamespace = Object.keys(
                      parsedEmbeddedYaml.metadata.namespace
                    )[0];
                  }
                  if (validateWorkflowParameter(engineNamespace)) {
                    engineNamespace = getWorkflowParameter(engineNamespace);
                    parametersMap.forEach((parameterKeyValue: Parameter) => {
                      if (parameterKeyValue.name === engineNamespace) {
                        engineNamespace = parameterKeyValue.value;
                      }
                    });
                  } else {
                    engineNamespace = parsedEmbeddedYaml.metadata.namespace;
                  }
                  let matchIndex: number = -1;
                  const check: number = chaosResultNamesAndNamespacesMap.filter(
                    (data, index) => {
                      if (
                        data.resultName.includes(
                          parsedEmbeddedYaml.metadata.name
                        ) &&
                        data.resultNamespace === engineNamespace
                      ) {
                        matchIndex = index;
                        return true;
                      }
                      return false;
                    }
                  ).length;
                  if (check === 0) {
                    chaosResultNamesAndNamespacesMap.push({
                      resultName: `${parsedEmbeddedYaml.metadata.name}-${parsedEmbeddedYaml.spec.experiments[0].name}`,
                      resultNamespace: engineNamespace,
                      workflowName: workflowYaml.metadata.name,
                      experimentName:
                        parsedEmbeddedYaml.spec.experiments[0].name,
                    });
                  } else {
                    chaosResultNamesAndNamespacesMap[
                      matchIndex
                    ].workflowName = `${chaosResultNamesAndNamespacesMap[matchIndex].workflowName}, \n${workflowYaml.metadata.name}`;
                  }
                }
              });
            }
          });
        }
      }
    );

    const isChaosQueryPresent: number[] = Array(
      chaosResultNamesAndNamespacesMap.length
    ).fill(0);

    data.panel_groups[0].panels[0].prom_queries.forEach(
      (existingPromQuery: PromQuery) => {
        if (
          existingPromQuery.prom_query_name.startsWith(
            'litmuschaos_awaited_experiments'
          )
        ) {
          const chaosDetails: ChaosResultNamesAndNamespacesMap = getEngineNameAndNamespace(
            existingPromQuery.prom_query_name
          );
          chaosResultNamesAndNamespacesMap.forEach(
            (
              chaosDetailsFomSchedule: ChaosResultNamesAndNamespacesMap,
              index: number
            ) => {
              if (
                chaosDetailsFomSchedule.resultName.includes(
                  chaosDetails.resultName
                ) &&
                chaosDetailsFomSchedule.resultNamespace ===
                  chaosDetails.resultNamespace
              ) {
                isChaosQueryPresent[index] = 1;
              }
            }
          );
        }
      }
    );

    const dashboardTemplateID: number =
      data.db_type === 'Kubernetes Platform' ? 0 : 1;

    const updatedPanelGroups: PanelGroup[] = [];

    data.panel_groups.forEach((panelGroup: PanelGroupResponse) => {
      const updatedPanels: Panel[] = [];
      panelGroup.panels.forEach((panel: PanelResponse) => {
        const updatedQueries: PromQuery[] = [];
        panel.prom_queries.forEach((query: PromQuery) => {
          let updatedLegend: string = query.legend;
          if (
            query.prom_query_name.startsWith('litmuschaos_awaited_experiments')
          ) {
            const chaosDetails: ChaosResultNamesAndNamespacesMap = getEngineNameAndNamespace(
              query.prom_query_name
            );
            chaosResultNamesAndNamespacesMap.forEach(
              (chaosDetailsFomSchedule: ChaosResultNamesAndNamespacesMap) => {
                if (
                  chaosDetailsFomSchedule.resultName.includes(
                    chaosDetails.resultName
                  ) &&
                  chaosDetailsFomSchedule.resultNamespace ===
                    chaosDetails.resultNamespace &&
                  !query.legend.includes(chaosDetailsFomSchedule.workflowName)
                ) {
                  updatedLegend = `${chaosDetailsFomSchedule.workflowName}, \n${query.legend}`;
                }
              }
            );
          }
          const updatedQuery: PromQuery = {
            queryid: query.queryid,
            prom_query_name: query.prom_query_name,
            resolution: query.resolution,
            minstep: query.minstep,
            line: query.line,
            close_area: query.close_area,
            legend: updatedLegend,
          };
          updatedQueries.push(updatedQuery);
        });
        chaosResultNamesAndNamespacesMap.forEach(
          (keyValue: ChaosResultNamesAndNamespacesMap, index: number) => {
            if (isChaosQueryPresent[index] === 0) {
              updatedQueries.push({
                queryid: uuidv4(),
                prom_query_name: generateChaosQuery(
                  DashboardList[dashboardTemplateID].chaosEventQueryTemplate,
                  keyValue.resultName,
                  keyValue.resultNamespace
                ),
                legend: `${keyValue.workflowName} / \n${keyValue.experimentName}`,
                resolution: '1/1',
                minstep: '1',
                line: false,
                close_area: true,
              });
            }
          }
        );
        const existingPanelOptions: PanelOption = {
          points: panel.panel_options.points,
          grids: panel.panel_options.grids,
          left_axis: panel.panel_options.left_axis,
        };
        const updatedPanel: Panel = {
          panel_id: panel.panel_id,
          panel_name: panel.panel_name,
          panel_options: existingPanelOptions,
          prom_queries: updatedQueries,
          y_axis_left: panel.y_axis_left,
          y_axis_right: panel.y_axis_right,
          x_axis_down: panel.x_axis_down,
          unit: panel.unit,
        };
        updatedPanels.push(updatedPanel);
      });
      updatedPanelGroups.push({
        panel_group_id: panelGroup.panel_group_id,
        panel_group_name: panelGroup.panel_group_name,
        panels: updatedPanels,
      });
    });

    const panelInputData: Panel[] = [];

    updatedPanelGroups.forEach((panelGroup: PanelGroup) => {
      panelGroup.panels.forEach((panel: Panel) => {
        panelInputData.push({
          panel_id: panel.panel_id,
          db_id: data.db_id,
          panel_group_id: panelGroup.panel_group_id,
          prom_queries: panel.prom_queries,
          panel_options: panel.panel_options,
          panel_name: panel.panel_name,
          y_axis_left: panel.y_axis_left,
          y_axis_right: panel.y_axis_right,
          x_axis_down: panel.x_axis_down,
          unit: panel.unit,
        });
      });
    });

    updatePanel({
      variables: { panelInput: panelInputData },
    });

    return true;
  };

  const onDashboardLoadRoutine = async () => {
    dashboard.selectDashboard({
      selectedDashboardID: data.db_id,
      selectedDashboardName: data.db_name,
      selectedDashboardTemplateName: data.db_type,
      selectedAgentID: data.cluster_id,
      selectedAgentName: data.cluster_name,
    });
    return Promise.resolve(reSyncChaosQueries());
  };

  useEffect(() => {
    if (mutate === true) {
      deleteDashboard({
        variables: { dbID: dashboardSelectedForDeleting.dbID },
      });
    }
  }, [mutate]);

  return (
    <>
      <StyledTableCell className={classes.dashboardName}>
        <Typography
          variant="body2"
          align="center"
          className={classes.tableData}
        >
          <strong>{data.db_name}</strong>
        </Typography>
      </StyledTableCell>

      <StyledTableCell className={classes.tableHeader}>
        <Typography
          variant="body2"
          align="center"
          className={classes.tableData}
        >
          <strong>{data.cluster_name}</strong>
        </Typography>
      </StyledTableCell>

      <StyledTableCell className={classes.tableHeader}>
        <Typography variant="body2" align="center">
          <strong>{data.db_type}</strong>
        </Typography>
      </StyledTableCell>

      <StyledTableCell className={classes.tableHeader}>
        <Typography variant="body2" align="center">
          <strong>{data.ds_type}</strong>
        </Typography>
      </StyledTableCell>

      <StyledTableCell className={classes.tableHeader}>
        <Typography variant="body2" align="center">
          {formatDate(data.updated_at)}
        </Typography>
      </StyledTableCell>

      <StyledTableCell>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
          data-cy="browseDashboardOptions"
        >
          <MoreVertIcon className={classes.headerIcon} />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={handleClose}
        >
          <MenuItem
            value="Analysis"
            onClick={() => {
              onDashboardLoadRoutine().then(() => {
                dataSource.selectDataSource({
                  selectedDataSourceURL: '',
                  selectedDataSourceID: '',
                  selectedDataSourceName: '',
                });
                history.push({
                  pathname: '/analytics/dashboard',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              });
            }}
            className={classes.menuItem}
          >
            <div className={classes.expDiv}>
              <img
                src="./icons/analytics.svg"
                alt="See Analytics"
                className={classes.btnImg}
              />
              <Typography data-cy="openDashboard" className={classes.btnText}>
                {t(
                  'analyticsDashboardViews.kubernetesDashboard.table.seeAnalytics'
                )}
              </Typography>
            </div>
          </MenuItem>

          <MenuItem
            value="Configure"
            onClick={() => {
              const dashboardType: string = data.db_type;
              let dashboardTemplateID: number = -1;
              if (dashboardType === 'Kubernetes Platform') {
                dashboardTemplateID = 0;
              } else if (dashboardType === 'Sock Shop') {
                dashboardTemplateID = 1;
              }
              dashboard.selectDashboard({
                selectedDashboardID: data.db_id,
                selectedDashboardName: data.db_name,
                selectedDashboardTemplateID: dashboardTemplateID,
              });
              history.push({
                pathname: '/analytics/dashboard/configure',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
            className={classes.menuItem}
          >
            <div className={classes.expDiv}>
              <img
                src="./icons/cogwheel.svg"
                alt="Configure"
                className={classes.btnImg}
              />
              <Typography
                data-cy=" configureDashboard"
                className={classes.btnText}
              >
                {t(
                  'analyticsDashboardViews.kubernetesDashboard.table.configure'
                )}
              </Typography>
            </div>
          </MenuItem>

          <MenuItem
            value="Delete"
            onClick={() => {
              setDashboardSelectedForDeleting({
                dbID: data.db_id,
              });
              setOpenModal(true);
            }}
            className={classes.menuItem}
          >
            <div className={classes.expDiv}>
              <img
                src="./icons/delete.svg"
                alt="Delete"
                className={classes.btnImg}
              />
              <Typography data-cy="deleteDashboard" className={classes.btnText}>
                Delete
              </Typography>
            </div>
          </MenuItem>
        </Menu>
      </StyledTableCell>

      <Modal
        open={openModal}
        onClose={() => {
          setConfirm(false);
          setOpenModal(false);
        }}
        width="60%"
        modalActions={
          <ButtonOutlined
            className={classes.closeButton}
            onClick={() => {
              setConfirm(false);
              setOpenModal(false);
            }}
          >
            &#x2715;
          </ButtonOutlined>
        }
      >
        <div className={classes.modal}>
          {confirm === true ? (
            <Typography align="center">
              {success === true ? (
                <img
                  src="./icons/finish.svg"
                  alt="success"
                  className={classes.icon}
                />
              ) : (
                <CrossMarkIcon className={classes.icon} />
              )}
            </Typography>
          ) : (
            <div />
          )}

          {confirm === true ? (
            <Typography
              className={classes.modalHeading}
              align="center"
              variant="h3"
            >
              {success === true
                ? `The dashboard is successfully deleted.`
                : `There was a problem deleting your dashboard.`}
            </Typography>
          ) : (
            <div />
          )}

          {confirm === true ? (
            <Typography
              align="center"
              variant="body1"
              className={classes.modalBody}
            >
              {success === true ? (
                <div>
                  You will see the dashboard deleted in the dashboard table.
                </div>
              ) : (
                <div>
                  Error encountered while deleting the dashboard. Please try
                  again.
                </div>
              )}
            </Typography>
          ) : (
            <div />
          )}

          {success === true && confirm === true ? (
            <ButtonFilled
              variant="success"
              onClick={() => {
                setConfirm(false);
                setOpenModal(false);
                tabs.changeAnalyticsDashboardTabs(2);
                window.location.reload();
              }}
            >
              <div>Back to Kubernetes Dashboard</div>
            </ButtonFilled>
          ) : success === false && confirm === true ? (
            <div className={classes.flexButtons}>
              <ButtonOutlined
                className={classes.buttonOutlineWarning}
                onClick={() => {
                  setOpenModal(false);
                  setMutate(true);
                }}
                disabled={false}
              >
                <div>Try Again</div>
              </ButtonOutlined>

              <ButtonFilled
                variant="success"
                onClick={() => {
                  setConfirm(false);
                  setOpenModal(false);
                  tabs.changeAnalyticsDashboardTabs(2);
                  window.location.reload();
                }}
              >
                <div>Back to Kubernetes Dashboard</div>
              </ButtonFilled>
            </div>
          ) : (
            <div>
              <Typography align="center">
                <img
                  src="./icons/delete_large_icon.svg"
                  alt="delete"
                  className={classes.icon}
                />
              </Typography>

              <Typography
                className={classes.modalHeading}
                align="center"
                variant="h3"
              >
                Are you sure to remove this dashboard?
              </Typography>

              <Typography
                align="center"
                variant="body1"
                className={classes.modalBody}
              >
                The following action cannot be reverted.
              </Typography>

              <div className={classes.flexButtons}>
                <ButtonOutlined
                  onClick={() => {
                    setOpenModal(false);
                    history.push({
                      pathname: '/analytics',
                      search: `?projectID=${projectID}&projectRole=${projectRole}`,
                    });
                  }}
                  disabled={false}
                >
                  <div>No</div>
                </ButtonOutlined>

                <ButtonFilled
                  variant="error"
                  onClick={() => {
                    setConfirm(true);
                    setOpenModal(false);
                    setMutate(true);
                  }}
                >
                  <div>Yes</div>
                </ButtonFilled>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
export default TableData;
