import { useMutation, useQuery } from '@apollo/client';
import { Drawer, Snackbar, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ButtonFilled, ButtonOutlined, TextButton } from 'litmus-ui';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PROM_SERIES_LIST, UPDATE_DASHBOARD } from '../../../../graphql';
import { DashboardDetails } from '../../../../models/dashboardsData';
import {
  PrometheusSeriesListQueryVars,
  PrometheusSeriesListResponse,
} from '../../../../models/graphql/prometheus';
import {
  DEFAULT_CHAOS_EVENT_AND_VERDICT_PROMETHEUS_QUERY_LEGEND,
  DEFAULT_CHAOS_EVENT_AND_VERDICT_PROMETHEUS_QUERY_RESOLUTION,
} from '../../../../pages/MonitoringDashboard/constants';
import { getProjectID } from '../../../../utils/getSearchParams';
import QueryEditor from './QueryEditor';
import useStyles from './styles';

interface Option {
  name: string;
  [index: string]: any;
}

interface ChaosAnnotationsEditorProps {
  dashboardID: string;
  dataSourceURL: string;
  chaosEventQueryTemplate: string;
  chaosVerdictQueryTemplate: string;
  drawerOpen: boolean;
  handleDrawerClose: () => void;
  handleSuccessfulUpdate: () => void;
}

const ChaosAnnotationsEditor: React.FC<ChaosAnnotationsEditorProps> = ({
  dashboardID,
  dataSourceURL,
  chaosEventQueryTemplate,
  chaosVerdictQueryTemplate,
  drawerOpen,
  handleDrawerClose,
  handleSuccessfulUpdate,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [success, setSuccess] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [seriesList, setSeriesList] = React.useState<Array<Option>>([]);
  const [dashboardVars, setDashboardVars] = React.useState<DashboardDetails>({
    id: dashboardID,
    chaosEventQueryTemplate,
    chaosVerdictQueryTemplate,
  });

  const alertStateHandler = (successState: boolean) => {
    setSuccess(successState);
    setIsAlertOpen(true);
  };

  useQuery<PrometheusSeriesListResponse, PrometheusSeriesListQueryVars>(
    PROM_SERIES_LIST,
    {
      variables: {
        request: {
          url: dataSourceURL,
          start: `${
            new Date(
              moment
                .unix(Math.round(new Date().getTime() / 1000) - 900)
                .format()
            ).getTime() / 1000
          }`,
          end: `${
            new Date(
              moment.unix(Math.round(new Date().getTime() / 1000)).format()
            ).getTime() / 1000
          }`,
        },
      },
      fetchPolicy: 'cache-and-network',
      skip:
        !drawerOpen ||
        seriesList.length > 0 ||
        dataSourceURL === '' ||
        dashboardID === '',
      onCompleted: (prometheusSeriesData) => {
        if (prometheusSeriesData) {
          const seriesValues: Array<Option> = [];
          if (prometheusSeriesData.getPromSeriesList.seriesList) {
            prometheusSeriesData.getPromSeriesList.seriesList.forEach(
              (series) => {
                seriesValues.push({ name: series });
              }
            );
          }
          setSeriesList(seriesValues);
        }
      },
    }
  );

  const [updateDashboard] = useMutation(UPDATE_DASHBOARD, {
    onCompleted: () => alertStateHandler(true),
    onError: () => alertStateHandler(false),
  });

  return (
    <>
      {isAlertOpen && (
        <Snackbar
          open={isAlertOpen}
          autoHideDuration={3000}
          onClose={() => {
            setIsAlertOpen(false);
            if (success) {
              handleSuccessfulUpdate();
            }
          }}
        >
          <Alert
            onClose={() => {
              setIsAlertOpen(false);
              if (success) {
                handleSuccessfulUpdate();
              }
            }}
            severity={success ? 'success' : 'error'}
          >
            {success
              ? t(
                  'monitoringDashboard.monitoringDashboardPage.chaosAnnotationsEditor.updateSuccess'
                )
              : t(
                  'monitoringDashboard.monitoringDashboardPage.chaosAnnotationsEditor.updateError'
                )}
          </Alert>
        </Snackbar>
      )}
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open={drawerOpen}
        classes={{
          paper: classes.drawerPaper,
        }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <div className={classes.drawerContent}>
          <div className={classes.flexContainer}>
            <Typography className={classes.drawerHeading} align="left">
              {t(
                'monitoringDashboard.monitoringDashboardPage.chaosAnnotationsEditor.heading'
              )}
            </Typography>
            <ButtonOutlined
              className={classes.closeButton}
              onClick={() => handleDrawerClose()}
            >
              &#x2715;
            </ButtonOutlined>
          </div>
          <div className={classes.editors}>
            <QueryEditor
              index={0}
              promQuery={{
                queryID: t(
                  'monitoringDashboard.monitoringDashboardPage.chaosAnnotationsEditor.eventQuery'
                ),
                promQueryName: chaosEventQueryTemplate,
                legend: DEFAULT_CHAOS_EVENT_AND_VERDICT_PROMETHEUS_QUERY_LEGEND,
                resolution:
                  DEFAULT_CHAOS_EVENT_AND_VERDICT_PROMETHEUS_QUERY_RESOLUTION,
                minstep: '1',
                line: false,
                closeArea: false,
              }}
              dsURL={dataSourceURL}
              seriesList={seriesList}
              handleUpdateQuery={(query) =>
                setDashboardVars({
                  ...dashboardVars,
                  chaosEventQueryTemplate: query.promQueryName,
                })
              }
            />
            <QueryEditor
              index={1}
              promQuery={{
                queryID: t(
                  'monitoringDashboard.monitoringDashboardPage.chaosAnnotationsEditor.verdictQuery'
                ),
                promQueryName: chaosVerdictQueryTemplate,
                legend: DEFAULT_CHAOS_EVENT_AND_VERDICT_PROMETHEUS_QUERY_LEGEND,
                resolution:
                  DEFAULT_CHAOS_EVENT_AND_VERDICT_PROMETHEUS_QUERY_RESOLUTION,
                minstep: '1',
                line: false,
                closeArea: false,
              }}
              dsURL={dataSourceURL}
              seriesList={seriesList}
              handleUpdateQuery={(query) =>
                setDashboardVars({
                  ...dashboardVars,
                  chaosVerdictQueryTemplate: query.promQueryName,
                })
              }
            />
          </div>
          <div className={classes.flexButtons}>
            <TextButton
              onClick={() => handleDrawerClose()}
              className={classes.cancelButton}
            >
              <Typography className={classes.buttonText}>
                {t(
                  'monitoringDashboard.monitoringDashboardPage.chaosAnnotationsEditor.cancel'
                )}
              </Typography>
            </TextButton>
            <ButtonFilled
              onClick={() =>
                updateDashboard({
                  variables: {
                    projectID: getProjectID(),
                    dashboard: {
                      dbID: dashboardVars.id ?? '',
                      chaosEventQueryTemplate:
                        dashboardVars.chaosEventQueryTemplate ?? '',
                      chaosVerdictQueryTemplate:
                        dashboardVars.chaosVerdictQueryTemplate ?? '',
                    },
                    chaosQueryUpdate: true,
                  },
                })
              }
            >
              <Typography
                className={`${classes.buttonText} ${classes.confirmButtonText}`}
              >
                {t(
                  'monitoringDashboard.monitoringDashboardPage.chaosAnnotationsEditor.saveChanges'
                )}
              </Typography>
            </ButtonFilled>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default ChaosAnnotationsEditor;
