import { useMutation } from '@apollo/client';
import { Snackbar, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React, { lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BackButton from '../../components/Button/BackButton';
import Loader from '../../components/Loader';
import Scaffold from '../../containers/layouts/Scaffold';
import { CREATE_DATASOURCE, UPDATE_DATASOURCE } from '../../graphql/mutations';
import { DataSourceDetails } from '../../models/dataSourceData';
import {
  CreateDataSourceInput,
  ListDataSourceResponse,
} from '../../models/graphql/dataSourceDetails';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import {
  isValidWebUrl,
  validateTextEmpty,
  validateTimeInSeconds,
} from '../../utils/validate';
import useStyles from './styles';

const ConfigurePrometheus = lazy(
  () => import('../../views/Analytics/DataSources/Forms/prometheus')
);

interface DataSourceConfigurePageProps {
  configure: boolean;
}

const DataSourceConfigurePage: React.FC<DataSourceConfigurePageProps> = ({
  configure,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dataSourceID = useSelector(
    (state: RootState) => state.selectDataSource.selectedDataSourceID
  );
  const selectedDataSourceName = useSelector(
    (state: RootState) => state.selectDataSource.selectedDataSourceName
  );
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const [disabled, setDisabled] = React.useState(true);
  const [page, setPage] = React.useState<number>(1);
  const [dataSourceVars, setDataSourceVars] = useState<DataSourceDetails>({
    id: '',
    name: '',
    dataSourceType: 'Prometheus',
    url: 'http://localhost:9090',
    access: 'Server (Default)',
    basicAuth: false,
    username: '',
    password: '',
    noAuth: true,
    withCredentials: false,
    tlsClientAuth: false,
    withCACert: false,
    scrapeInterval: '15s',
    queryTimeout: '30s',
    httpMethod: 'POST',
  });
  const [mutate, setMutate] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [createDataSource] = useMutation<
    ListDataSourceResponse,
    CreateDataSourceInput
  >(CREATE_DATASOURCE, {
    onCompleted: () => {
      setMutate(false);
      setSuccess(true);
      setIsAlertOpen(true);
    },
    onError: () => {
      setMutate(false);
      setSuccess(false);
      setIsAlertOpen(true);
    },
  });
  const [updateDataSource] = useMutation<
    ListDataSourceResponse,
    CreateDataSourceInput
  >(UPDATE_DATASOURCE, {
    onCompleted: () => {
      setMutate(false);
      setSuccess(true);
      setIsAlertOpen(true);
    },
    onError: () => {
      setMutate(false);
      setSuccess(false);
      setIsAlertOpen(true);
    },
  });

  const handleCreateMutation = () => {
    let authType: string = 'no auth';
    if (dataSourceVars.noAuth === false && dataSourceVars.basicAuth === true) {
      authType = 'basic auth';
    }
    const dataSourceInput = {
      ds_name: dataSourceVars.name,
      ds_type: dataSourceVars.dataSourceType,
      ds_url:
        dataSourceVars.url[dataSourceVars.url.length - 1] !== '/'
          ? dataSourceVars.url
          : dataSourceVars.url.slice(0, -1),
      access_type: dataSourceVars.access,
      auth_type: authType,
      basic_auth_username: dataSourceVars.username,
      basic_auth_password: dataSourceVars.password,
      scrape_interval: parseInt(
        dataSourceVars.scrapeInterval.split('s')[0],
        10
      ),
      query_timeout: parseInt(dataSourceVars.queryTimeout.split('s')[0], 10),
      http_method: dataSourceVars.httpMethod,
      project_id: projectID,
    };
    createDataSource({
      variables: { DSInput: dataSourceInput },
    });
  };

  const handleUpdateMutation = () => {
    let authType: string = 'no auth';
    if (dataSourceVars.noAuth === false && dataSourceVars.basicAuth === true) {
      authType = 'basic auth';
    }
    const dataSourceInput = {
      ds_id: dataSourceVars.id ?? '',
      ds_name: dataSourceVars.name,
      ds_type: dataSourceVars.dataSourceType,
      ds_url:
        dataSourceVars.url[dataSourceVars.url.length - 1] !== '/'
          ? dataSourceVars.url
          : dataSourceVars.url.slice(0, -1),
      access_type: dataSourceVars.access,
      auth_type: authType,
      basic_auth_username: dataSourceVars.username,
      basic_auth_password: dataSourceVars.password,
      scrape_interval: parseInt(
        dataSourceVars.scrapeInterval.split('s')[0],
        10
      ),
      query_timeout: parseInt(dataSourceVars.queryTimeout.split('s')[0], 10),
      http_method: dataSourceVars.httpMethod,
      project_id: projectID,
    };
    updateDataSource({
      variables: { DSInput: dataSourceInput },
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
      dataSourceVars.name === '' ||
      !isValidWebUrl(dataSourceVars.url) ||
      !validateTimeInSeconds(dataSourceVars.queryTimeout) ||
      !validateTimeInSeconds(dataSourceVars.scrapeInterval) ||
      (dataSourceVars.basicAuth &&
        (validateTextEmpty(dataSourceVars.username) ||
          validateTextEmpty(dataSourceVars.password)))
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [dataSourceVars]);

  return (
    <Scaffold>
      <div className={classes.rootConfigure}>
        {configure === false ? (
          <div>
            <div className={classes.backButton}>
              <BackButton />
            </div>
            <Typography className={classes.heading}>
              {t('analyticsDashboard.dataSourceForm.headingAdd')}
            </Typography>
            <ConfigurePrometheus
              configure={configure}
              page={page}
              CallbackToSetVars={(vars: DataSourceDetails) => {
                setDataSourceVars(vars);
              }}
            />
          </div>
        ) : (
          <div>
            <div className={classes.backButton}>
              <BackButton />
            </div>
            <Typography className={classes.heading}>
              {t('analyticsDashboard.dataSourceForm.headingConfigure')} /
              {` ${selectedDataSourceName}`}
            </Typography>
            {dataSourceID ? (
              <ConfigurePrometheus
                configure={configure}
                dataSourceID={dataSourceID}
                page={page}
                CallbackToSetVars={(vars: DataSourceDetails) => {
                  setDataSourceVars(vars);
                }}
              />
            ) : (
              <div />
            )}
          </div>
        )}

        <div
          className={`${classes.buttons} ${page === 2 ? '' : classes.flexEnd}`}
        >
          {page === 2 && (
            <ButtonOutlined onClick={() => setPage(1)} disabled={false}>
              <Typography>
                {t('analyticsDashboard.dataSourceForm.back')}
              </Typography>
            </ButtonOutlined>
          )}
          <div className={classes.saveButton}>
            <Typography className={classes.stepText}>
              {t('analyticsDashboard.dataSourceForm.step')}
              <strong>{` ${page} `}</strong>
              {t('analyticsDashboard.dataSourceForm.of2')}
            </Typography>
            <ButtonFilled
              disabled={
                (page === 1 &&
                  (dataSourceVars.name === '' ||
                    !isValidWebUrl(dataSourceVars.url))) ||
                mutate
                  ? true
                  : page === 2
                  ? disabled
                  : false
              }
              onClick={() =>
                page === 2 && !disabled ? setMutate(true) : setPage(2)
              }
            >
              <Typography className={classes.buttonText}>
                {page === 2
                  ? mutate
                    ? !configure
                      ? t('analyticsDashboard.dataSourceForm.adding')
                      : t('analyticsDashboard.dataSourceForm.updating')
                    : t('analyticsDashboard.dataSourceForm.saveChanges')
                  : t('analyticsDashboard.dataSourceForm.next')}
              </Typography>
              {mutate && <Loader size={20} />}
            </ButtonFilled>
          </div>
        </div>
      </div>
      {isAlertOpen && (
        <Snackbar
          open={isAlertOpen}
          autoHideDuration={6000}
          onClose={() => {
            setIsAlertOpen(false);
            if (success) {
              history.push({
                pathname: '/analytics',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }
          }}
        >
          <Alert
            onClose={() => {
              setIsAlertOpen(false);
              if (success) {
                history.push({
                  pathname: '/analytics',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }
            }}
            severity={success ? 'success' : 'error'}
          >
            {!configure
              ? success
                ? t('analyticsDashboard.dataSourceForm.connectionSuccess')
                : t('analyticsDashboard.dataSourceForm.connectionError')
              : success
              ? t('analyticsDashboard.dataSourceForm.updateSuccess')
              : t('analyticsDashboard.dataSourceForm.updateError')}
          </Alert>
        </Snackbar>
      )}
    </Scaffold>
  );
};

export default DataSourceConfigurePage;
