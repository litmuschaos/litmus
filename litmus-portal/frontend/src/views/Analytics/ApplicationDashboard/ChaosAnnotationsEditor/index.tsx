/* eslint-disable no-unused-expressions */
import { useMutation, useQuery } from '@apollo/client';
import { Drawer, Snackbar, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ButtonFilled, ButtonOutlined, TextButton } from 'litmus-ui';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PROM_SERIES_LIST, UPDATE_DASHBOARD } from '../../../../graphql';
import { DashboardDetails } from '../../../../models/dashboardsData';
import { UpdateDashboardInput } from '../../../../models/graphql/dashboardsDetails';
import {
  PrometheusSeriesListQueryVars,
  PrometheusSeriesListResponse,
} from '../../../../models/graphql/prometheus';
import {
  DEFAULT_CHAOS_EVENT_AND_VERDICT_PROMETHEUS_QUERY_LEGEND,
  DEFAULT_CHAOS_EVENT_AND_VERDICT_PROMETHEUS_QUERY_RESOLUTION,
} from '../../../../pages/ApplicationDashboard/constants';
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
        prometheusDSInput: {
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
          prometheusSeriesData.GetPromSeriesList.seriesList?.forEach(
            (series) => {
              seriesValues.push({ name: series });
            }
          );
          setSeriesList(seriesValues);
        }
      },
    }
  );

  const [updateDashboard] = useMutation<UpdateDashboardInput>(
    UPDATE_DASHBOARD,
    {
      onCompleted: () => alertStateHandler(true),
      onError: () => alertStateHandler(false),
    }
  );

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
                  'analyticsDashboard.monitoringDashboardPage.chaosAnnotationsEditor.updateSuccess'
                )
              : t(
                  'analyticsDashboard.monitoringDashboardPage.chaosAnnotationsEditor.updateError'
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
                'analyticsDashboard.monitoringDashboardPage.chaosAnnotationsEditor.heading'
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
                queryid: t(
                  'analyticsDashboard.monitoringDashboardPage.chaosAnnotationsEditor.eventQuery'
                ),
                prom_query_name: chaosEventQueryTemplate,
                legend: DEFAULT_CHAOS_EVENT_AND_VERDICT_PROMETHEUS_QUERY_LEGEND,
                resolution:
                  DEFAULT_CHAOS_EVENT_AND_VERDICT_PROMETHEUS_QUERY_RESOLUTION,
                minstep: '1',
                line: false,
                close_area: false,
              }}
              dsURL={dataSourceURL}
              seriesList={seriesList}
              handleUpdateQuery={(query) =>
                setDashboardVars({
                  ...dashboardVars,
                  chaosEventQueryTemplate: query.prom_query_name,
                })
              }
            />
            <QueryEditor
              index={1}
              promQuery={{
                queryid: t(
                  'analyticsDashboard.monitoringDashboardPage.chaosAnnotationsEditor.verdictQuery'
                ),
                prom_query_name: chaosVerdictQueryTemplate,
                legend: DEFAULT_CHAOS_EVENT_AND_VERDICT_PROMETHEUS_QUERY_LEGEND,
                resolution:
                  DEFAULT_CHAOS_EVENT_AND_VERDICT_PROMETHEUS_QUERY_RESOLUTION,
                minstep: '1',
                line: false,
                close_area: false,
              }}
              dsURL={dataSourceURL}
              seriesList={seriesList}
              handleUpdateQuery={(query) =>
                setDashboardVars({
                  ...dashboardVars,
                  chaosVerdictQueryTemplate: query.prom_query_name,
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
                  'analyticsDashboard.monitoringDashboardPage.chaosAnnotationsEditor.cancel'
                )}
              </Typography>
            </TextButton>
            <ButtonFilled
              onClick={() =>
                updateDashboard({
                  variables: {
                    updateDBInput: {
                      db_id: dashboardVars.id ?? '',
                      chaos_event_query_template:
                        dashboardVars.chaosEventQueryTemplate ?? '',
                      chaos_verdict_query_template:
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
                  'analyticsDashboard.monitoringDashboardPage.chaosAnnotationsEditor.saveChanges'
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
