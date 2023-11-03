import { useLazyQuery, useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../../../components/Loader';
import { GET_HUB_STATUS, GET_PORTAL_DASHBOARDS } from '../../../../../graphql';
import { DashboardData } from '../../../../../models/dashboardsData';
import {
  GetPortalDashboard,
  PortalDashboardsRequest,
} from '../../../../../models/graphql/dashboardsDetails';
import { HubStatus } from '../../../../../models/graphql/chaoshub';
import { DEFAULT_HUB_NAME } from '../../../../../pages/MonitoringDashboard/constants';
import useActions from '../../../../../redux/actions';
import * as AlertActions from '../../../../../redux/actions/alert';
import {
  getProjectID,
  getProjectRole,
} from '../../../../../utils/getSearchParams';
import DashboardCards from './Cards/DashBoardCards';
import useStyles from './styles';

interface ChooseADashboardTypeProps {
  handleNext: () => void;
}

const ChooseADashboardType = forwardRef(
  ({ handleNext }: ChooseADashboardTypeProps, ref) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const projectID = getProjectID();
    const alert = useActions(AlertActions);
    const [dashboardList, setDashboardList] = useState<DashboardData[]>([]);

    const addCustomAndUploadDashboardCards = (dashboards: DashboardData[]) => {
      // Custom dashboard
      dashboards.push({
        dashboardTypeID: 'custom',
        typeName: 'Custom dashboard',
        urlToIcon: './icons/custom_dashboard.svg',
        information: 'Create your own custom dashboard',
      });
      // Upload a dashboard
      dashboards.push({
        dashboardTypeID: 'upload',
        typeName: 'Upload a dashboard',
        urlToIcon: './icons/upload-json.svg',
        information: 'Create a dashboard by uploading a json file',
      });

      return dashboards;
    };

    const { data: hubs, loading: loadingHubs } = useQuery<HubStatus>(
      GET_HUB_STATUS,
      {
        variables: {
          projectID,
          onError: () => {
            alert.changeAlertState(true);
          },
        },
      }
    );

    // Query to get dashboards of the selected hub
    const [getPortalDashboards, { loading: loadingDashboards }] = useLazyQuery<
      GetPortalDashboard,
      PortalDashboardsRequest
    >(GET_PORTAL_DASHBOARDS, {
      onCompleted: (data) => {
        let dashboards: DashboardData[] = [];
        (data.listPortalDashboardData ?? []).forEach((dashboard) => {
          const parsedDashboardData = JSON.parse(dashboard.dashboardData);
          dashboards.push({
            dashboardTypeID: parsedDashboardData.dashboardID,
            typeName: parsedDashboardData.name,
            urlToIcon: `./icons/${parsedDashboardData.dashboardID}_dashboard.svg`,
            information: parsedDashboardData.information,
            dashboardJSON: parsedDashboardData,
          });
        });
        dashboards = addCustomAndUploadDashboardCards(dashboards);
        setDashboardList(dashboards);
      },
      onError: () => {
        const dashboards: DashboardData[] = addCustomAndUploadDashboardCards(
          []
        );
        setDashboardList(dashboards);
        alert.changeAlertState(true);
      },
    });

    function onNext() {
      if (getProjectRole() === 'Viewer') {
        alert.changeAlertState(true);
        return false;
      }
      return true;
    }

    useImperativeHandle(ref, () => ({
      onNext,
    }));

    useEffect(() => {
      if (!loadingHubs) {
        const availableHubNames =
          hubs?.listHubStatus
            .filter((hubs) => hubs.isAvailable === true)
            .map((hub) => hub.hubName) ?? [];

        if (availableHubNames.length) {
          getPortalDashboards({
            variables: {
              projectID,
              hubName: availableHubNames.includes(DEFAULT_HUB_NAME)
                ? DEFAULT_HUB_NAME
                : availableHubNames[0],
            },
          });
        } else {
          const dashboards: DashboardData[] = addCustomAndUploadDashboardCards(
            []
          );
          setDashboardList(dashboards);
          alert.changeAlertState(true);
        }
      }
    }, [loadingHubs, hubs]);

    return (
      <div>
        <Typography className={classes.heading}>
          {t(
            'monitoringDashboard.monitoringDashboards.chooseADashboardType.header'
          )}
        </Typography>
        <Typography className={classes.description}>
          {t(
            'monitoringDashboard.monitoringDashboards.chooseADashboardType.description'
          )}
        </Typography>
        <div className={classes.cards}>
          {loadingHubs || loadingDashboards ? (
            <Loader />
          ) : (
            <DashboardCards
              dashboards={dashboardList}
              handleClick={handleNext}
              generateAlert={() => alert.changeAlertState(true)}
            />
          )}
        </div>
      </div>
    );
  }
);

export default ChooseADashboardType;
