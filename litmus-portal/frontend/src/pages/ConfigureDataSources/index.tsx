import { useMutation } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BackButton from '../../components/Button/BackButton';
import Scaffold from '../../containers/layouts/Scaffold';
import { CREATE_DATASOURCE, UPDATE_DATASOURCE } from '../../graphql/mutations';
import { DataSourceDetails } from '../../models/dataSourceData';
import {
  CreateDataSourceInput,
  ListDataSourceResponse,
} from '../../models/graphql/dataSourceDetails';
import { history } from '../../redux/configureStore';
import { RootState } from '../../redux/reducers';
import { ReactComponent as CrossMarkIcon } from '../../svg/crossmark.svg';
import { getProjectID, getProjectRole } from '../../utils/getSearchParams';
import { isValidWebUrl, validateTimeInSeconds } from '../../utils/validate';
import ConfigurePrometheus from '../../views/Analytics/DataSources/Forms/prometheus';
import useStyles from './styles';

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
  const [open, setOpen] = React.useState(false);
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
  const [success, setSuccess] = React.useState(false);
  const [createDataSource] = useMutation<
    ListDataSourceResponse,
    CreateDataSourceInput
  >(CREATE_DATASOURCE, {
    onCompleted: () => {
      setSuccess(true);
      setMutate(false);
      setOpen(true);
    },
    onError: () => {
      setMutate(false);
      setOpen(true);
    },
  });
  const [updateDataSource] = useMutation<
    ListDataSourceResponse,
    CreateDataSourceInput
  >(UPDATE_DATASOURCE, {
    onCompleted: () => {
      setSuccess(true);
      setMutate(false);
      setOpen(true);
    },
    onError: () => {
      setMutate(false);
      setOpen(true);
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
      !validateTimeInSeconds(dataSourceVars.scrapeInterval)
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
              {t('analyticsDashboard.dataSourceForm.headingConfigure')} /{' '}
              {selectedDataSourceName}
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

        <div className={classes.buttons}>
          {page === 2 && (
            <ButtonOutlined onClick={() => setPage(1)} disabled={false}>
              <Typography>
                {t('analyticsDashboard.dataSourceForm.back')}
              </Typography>
            </ButtonOutlined>
          )}
          <div className={classes.saveButton}>
            <Typography className={classes.stepText}>
              {t('analyticsDashboard.dataSourceForm.step')}{' '}
              <strong>{page}</strong>{' '}
              {t('analyticsDashboard.dataSourceForm.of2')}
            </Typography>
            <ButtonFilled
              disabled={
                page === 1 && dataSourceVars.name === ''
                  ? true
                  : page === 2
                  ? disabled
                  : false
              }
              onClick={() =>
                page === 2 && !disabled ? setMutate(true) : setPage(2)
              }
            >
              <Typography>
                {page === 2
                  ? `${t('analyticsDashboard.dataSourceForm.saveChanges')}`
                  : `${t('analyticsDashboard.dataSourceForm.next')}`}
              </Typography>
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
              ? `${t(
                  'analyticsDashboard.dataSourceForm.modalHeadingSuccessAdd'
                )}`
              : success === true && configure === true
              ? `${t(
                  'analyticsDashboard.dataSourceForm.modalHeadingSuccessConfigure'
                )}`
              : `${t('analyticsDashboard.dataSourceForm.modalHeadingFailed')}`}
          </Typography>

          <Typography
            align="center"
            variant="body1"
            className={classes.modalBody}
          >
            {success === true && configure === false ? (
              <div>
                {t('analyticsDashboard.dataSourceForm.modalBodySuccessAdd')}
              </div>
            ) : success === true && configure === true ? (
              <div>
                {t(
                  'analyticsDashboard.dataSourceForm.modalBodySuccessConfigure'
                )}
              </div>
            ) : (
              <div>
                {t('analyticsDashboard.dataSourceForm.modalBodyFailed')}
              </div>
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
              <div>
                {t('analyticsDashboard.dataSourceForm.modalActionsBack')}
              </div>
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
                <div>
                  {t('analyticsDashboard.dataSourceForm.modalActionsTryAgain')}
                </div>
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
                <div>
                  {t('analyticsDashboard.dataSourceForm.modalActionsBack')}
                </div>
              </ButtonFilled>
            </div>
          )}
        </div>
      </Modal>
    </Scaffold>
  );
};

export default DataSourceConfigurePage;
