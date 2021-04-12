import { useMutation } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DashboardList from '../../components/PreconfiguredDashboards/data';
import Scaffold from '../../containers/layouts/Scaffold';
import { CREATE_DASHBOARD, UPDATE_DASHBOARD } from '../../graphql/mutations';
import { DashboardDetails } from '../../models/dashboardsData';
import {
  CreateDashboardInput,
  Panel,
  PanelGroup,
  PanelGroupResponse,
  UpdateDashboardInput,
  updatePanelGroupInput,
} from '../../models/graphql/dashboardsDetails';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { ReactComponent as CrossMarkIcon } from '../../svg/crossmark.svg';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import ConfigureDashboard from '../../views/AnalyticsDashboard/KubernetesDashboards/Form';
import {
  DEFAULT_DASHBOARD_REFRESH_RATE_STRING,
  DEFAULT_RELATIVE_TIME_RANGE,
} from '../MonitoringDashboardPage/constants';
import useStyles from './styles';

interface DashboardConfigurePageProps {
  configure: boolean;
}

const DashboardConfigurePage: React.FC<DashboardConfigurePageProps> = ({
  configure,
}) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
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
      const panelGroups: PanelGroup[] = [];
      DashboardList[DashboardTemplateID ?? 0].panelGroups.forEach(
        (panelGroup) => {
          const selectedPanels: Panel[] = [];
          panelGroup.panels.forEach((panel) => {
            selectedPanels.push(panel);
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
      start_time: `${
        Math.round(new Date().getTime() / 1000) - DEFAULT_RELATIVE_TIME_RANGE
      }`,
      project_id: projectID,
      cluster_id: dashboardVars.agentID,
      refresh_rate: DEFAULT_DASHBOARD_REFRESH_RATE_STRING,
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
      start_time: `${
        Math.round(new Date().getTime() / 1000) - DEFAULT_RELATIVE_TIME_RANGE
      }`,
      refresh_rate: DEFAULT_DASHBOARD_REFRESH_RATE_STRING,
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
        width="60%"
        modalActions={
          <ButtonOutlined
            className={classes.closeButton}
            onClick={() => setOpen(false)}
          >
            &#x2715;
          </ButtonOutlined>
        }
      >
        <div className={classes.modal}>
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
              onClick={() => {
                history.push({
                  pathname: '/analytics',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
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
                onClick={() => {
                  history.push({
                    pathname: '/analytics',
                    search: `?projectID=${projectID}&projectRole=${projectRole}`,
                  });
                }}
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
