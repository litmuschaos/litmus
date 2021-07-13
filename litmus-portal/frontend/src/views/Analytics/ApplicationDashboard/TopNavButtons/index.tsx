/* eslint-disable no-unused-expressions */
import { MenuItem, Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledMenu } from '../../../../components/StyledMenu';
import {
  DashboardExport,
  PanelExport,
  PanelGroupExport,
  PanelGroupMap,
  PromQueryExport,
  SelectedDashboardInformation,
} from '../../../../models/dashboardsData';
import {
  ApplicationMetadata,
  PanelOption,
  Resource,
} from '../../../../models/graphql/dashboardsDetails';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import { history } from '../../../../redux/configureStore';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import DashboardCloneModal from '../DashboardCloneModal';
import useStyles from './styles';

interface TopNavButtonsProps {
  isInfoToggledState: Boolean;
  switchIsInfoToggled: (toggleState: Boolean) => void;
  dashboardData: SelectedDashboardInformation;
  dashboardTypeID: string;
}

interface NavButtonStates {
  isInfoToggled: Boolean;
  isOptionsToggled: Boolean;
}

const TopNavButtons: React.FC<TopNavButtonsProps> = ({
  isInfoToggledState,
  switchIsInfoToggled,
  dashboardData,
  dashboardTypeID,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const dashboard = useActions(DashboardActions);

  const [navButtonStates, setNavButtonStates] = React.useState<NavButtonStates>(
    {
      isInfoToggled: isInfoToggledState,
      isOptionsToggled: false,
    }
  );
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [cloneModalOpen, setCloneModalOpen] = React.useState<Boolean>(false);

  const getDashboard = () => {
    const panelGroupMap: PanelGroupMap[] = [];
    const panelGroups: PanelGroupExport[] = [];
    dashboardData.metaData[0].panel_groups.forEach((panelGroup) => {
      panelGroupMap.push({
        groupName: panelGroup.panel_group_name,
        panels: [],
      });
      const len: number = panelGroupMap.length;
      const selectedPanels: PanelExport[] = [];
      panelGroup.panels.forEach((panel) => {
        panelGroupMap[len - 1].panels.push(panel.panel_name);
        const queries: PromQueryExport[] = [];
        panel.prom_queries.forEach((query) => {
          queries.push({
            prom_query_name: query.prom_query_name,
            legend: query.legend,
            resolution: query.resolution,
            minstep: query.minstep,
            line: query.line,
            close_area: query.close_area,
          });
        });
        const options: PanelOption = {
          points: panel.panel_options.points,
          grids: panel.panel_options.grids,
          left_axis: panel.panel_options.left_axis,
        };
        const selectedPanel: PanelExport = {
          prom_queries: queries,
          panel_options: options,
          panel_name: panel.panel_name,
          y_axis_left: panel.y_axis_left,
          y_axis_right: panel.y_axis_right,
          x_axis_down: panel.x_axis_down,
          unit: panel.unit,
        };
        selectedPanels.push(selectedPanel);
      });
      panelGroups.push({
        panel_group_name: panelGroup.panel_group_name,
        panels: selectedPanels,
      });
    });

    const applicationMetadataMap: ApplicationMetadata[] = [];

    dashboardData.applicationMetadataMap?.forEach((applicationMetadata) => {
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

    const exportedDashboard: DashboardExport = {
      dashboardID: dashboardTypeID,
      name: dashboardData.name,
      information: dashboardData.information,
      chaosEventQueryTemplate: dashboardData.chaosEventQueryTemplate,
      chaosVerdictQueryTemplate: dashboardData.chaosVerdictQueryTemplate,
      applicationMetadataMap,
      panelGroupMap,
      panelGroups,
    };

    return exportedDashboard;
  };

  // Function to download the JSON
  const downloadJSON = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(getDashboard(), null, 2)], {
      type: 'text/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${dashboardData.name}.json`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className={classes.buttons}>
      {navButtonStates.isInfoToggled ? (
        <ButtonFilled
          onClick={() => {
            setNavButtonStates({ ...navButtonStates, isInfoToggled: false });
            switchIsInfoToggled(false);
          }}
          className={classes.button}
        >
          <img
            src="./icons/infoWhite.svg"
            alt="Info icon"
            className={classes.icon}
          />
          <Typography className={classes.infoText}>
            {t('analyticsDashboard.monitoringDashboardPage.infoButtonText')}
          </Typography>
        </ButtonFilled>
      ) : (
        <ButtonOutlined
          onClick={() => {
            setNavButtonStates({ ...navButtonStates, isInfoToggled: true });
            switchIsInfoToggled(true);
          }}
          className={classes.button}
        >
          <img
            src="./icons/info.svg"
            alt="Info icon"
            className={classes.icon}
          />
          <Typography className={classes.infoText}>
            {t('analyticsDashboard.monitoringDashboardPage.infoButtonText')}
          </Typography>
        </ButtonOutlined>
      )}
      <div ref={anchorRef}>
        {navButtonStates.isOptionsToggled ? (
          <ButtonFilled
            onClick={() => {
              setAnchorEl(null);
              setNavButtonStates({
                ...navButtonStates,
                isOptionsToggled: false,
              });
            }}
            className={classes.button}
          >
            <img
              src="./icons/menu-active.svg"
              alt="Options icon"
              className={classes.menuIcon}
            />
          </ButtonFilled>
        ) : (
          <ButtonOutlined
            onClick={(event: React.MouseEvent<HTMLElement>) => {
              setAnchorEl(event.currentTarget);
              setNavButtonStates({
                ...navButtonStates,
                isOptionsToggled: true,
              });
            }}
            className={classes.button}
          >
            <img
              src="./icons/menu.svg"
              alt="Options icon"
              className={classes.menuIcon}
            />
          </ButtonOutlined>
        )}
      </div>
      <StyledMenu
        id="long-menu"
        anchorEl={anchorRef.current}
        elevation={0}
        getContentAnchorEl={null}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setNavButtonStates({ ...navButtonStates, isOptionsToggled: false });
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        className={classes.menuList}
      >
        <MenuItem
          value="Configure"
          onClick={() => {
            dashboard.selectDashboard({
              selectedDashboardID: dashboardData.id,
              activePanelID: '',
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
              data-cy="optionsConfigureDashboard"
              className={classes.btnText}
            >
              {t('analyticsDashboard.applicationDashboardTable.configure')}
            </Typography>
          </div>
        </MenuItem>

        <MenuItem
          value="Make a copy"
          onClick={() => {
            setCloneModalOpen(true);
          }}
          className={classes.menuItem}
        >
          <div className={classes.expDiv}>
            <img
              src="./icons/copy-dashboard.svg"
              alt="Make a copy"
              className={classes.btnImg}
            />
            <Typography
              data-cy="optionsCopyDashboard"
              className={classes.btnText}
            >
              {t('analyticsDashboard.monitoringDashboardPage.options.clone')}
            </Typography>
          </div>
        </MenuItem>

        <MenuItem
          value="Download json"
          onClick={() => downloadJSON()}
          className={classes.menuItem}
        >
          <div className={classes.expDiv}>
            <img
              src="./icons/download-dashboard.svg"
              alt="Download json"
              className={classes.btnImg}
            />
            <Typography
              data-cy="optionsDownloadDashboard"
              className={classes.btnText}
            >
              {t('analyticsDashboard.monitoringDashboardPage.options.json')}
            </Typography>
          </div>
        </MenuItem>

        <MenuItem
          value="Export pdf"
          onClick={() => {}}
          className={classes.menuItem}
          disabled
        >
          <div className={classes.expDiv}>
            <img
              src="./icons/export-dashboard.svg"
              alt="Export pdf"
              className={classes.btnImg}
            />
            <Typography
              data-cy="optionsExportDashboard"
              className={classes.btnText}
            >
              {t('analyticsDashboard.monitoringDashboardPage.options.pdf')}
            </Typography>
          </div>
        </MenuItem>
      </StyledMenu>
      {cloneModalOpen ? (
        <DashboardCloneModal
          dashboardData={dashboardData}
          onClose={() => {
            setCloneModalOpen(false);
          }}
        />
      ) : (
        <div />
      )}
    </div>
  );
};

export default TopNavButtons;
