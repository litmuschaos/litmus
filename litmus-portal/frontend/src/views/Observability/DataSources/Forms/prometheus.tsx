/* eslint-disable no-unused-expressions */
import { useQuery } from '@apollo/client';
import { FormControlLabel, FormGroup, Typography } from '@material-ui/core';
import { InputField, RadioButton, TextButton } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GET_DATASOURCE } from '../../../../graphql';
import { DataSourceDetails } from '../../../../models/dataSourceData';
import {
  DataSourceList,
  ListDataSourceResponse,
  ListDataSourceVars,
} from '../../../../models/graphql/dataSourceDetails';
import { ReactComponent as ExternalLinkIcon } from '../../../../svg/externalLink.svg';
import { ReactComponent as DocsIcon } from '../../../../svg/prometheusDocs.svg';
import { getProjectID } from '../../../../utils/getSearchParams';
import {
  isValidWebUrl,
  validateTextEmpty,
  validateTimeInSeconds,
} from '../../../../utils/validate';
import useStyles from './styles';

interface ConfigurePrometheusProps {
  configure: boolean;
  dataSourceID?: string;
  page: number;
  CallbackToSetVars: (vars: DataSourceDetails) => void;
}

const ConfigurePrometheus: React.FC<ConfigurePrometheusProps> = ({
  configure,
  dataSourceID,
  page,
  CallbackToSetVars,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const projectID = getProjectID();
  const [dataSourceDetails, setDataSourceDetails] = useState<DataSourceDetails>(
    {
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
    }
  );
  const [update, setUpdate] = useState(false);

  // Apollo query to get the datasource data
  const { data } = useQuery<DataSourceList, ListDataSourceVars>(
    GET_DATASOURCE,
    {
      variables: { projectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  const nameChangeHandler = (event: React.ChangeEvent<{ value: string }>) => {
    setDataSourceDetails({
      ...dataSourceDetails,
      name: (event.target as HTMLInputElement).value,
    });
    setUpdate(true);
  };

  const urlChangeHandler = (event: React.ChangeEvent<{ value: string }>) => {
    setDataSourceDetails({
      ...dataSourceDetails,
      url: (event.target as HTMLInputElement).value,
    });
    setUpdate(true);
  };

  const usernameChangeHandler = (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    setDataSourceDetails({
      ...dataSourceDetails,
      username: (event.target as HTMLInputElement).value,
    });
    setUpdate(true);
  };

  const passwordChangeHandler = (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    setDataSourceDetails({
      ...dataSourceDetails,
      password: (event.target as HTMLInputElement).value,
    });
    setUpdate(true);
  };

  const scrapeIntervalChangeHandler = (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    setDataSourceDetails({
      ...dataSourceDetails,
      scrapeInterval: (event.target as HTMLInputElement).value,
    });
    setUpdate(true);
  };

  const queryTimeoutChangeHandler = (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    setDataSourceDetails({
      ...dataSourceDetails,
      queryTimeout: (event.target as HTMLInputElement).value,
    });
    setUpdate(true);
  };

  const handleAuthChange = (
    event: React.ChangeEvent<{ name: string; checked: boolean }>
  ) => {
    if (event.target.checked) {
      setDataSourceDetails({
        ...dataSourceDetails,
        basicAuth: false,
        noAuth: false,
        withCredentials: false,
        tlsClientAuth: false,
        withCACert: false,
        [event.target.name]: event.target.checked,
      });
    } else if (dataSourceDetails.noAuth === false) {
      setDataSourceDetails({
        ...dataSourceDetails,
        noAuth: true,
        [event.target.name]: event.target.checked,
      });
    }
    setUpdate(true);
  };

  useEffect(() => {
    if (configure === true) {
      data?.listDataSource.forEach(
        (dataSourceDetail: ListDataSourceResponse) => {
          if (dataSourceDetail.dsID === dataSourceID) {
            setDataSourceDetails({
              ...dataSourceDetails,
              id: dataSourceDetail.dsID,
              name: dataSourceDetail.dsName,
              dataSourceType: dataSourceDetail.dsType,
              url: dataSourceDetail.dsURL,
              access: dataSourceDetail.accessType,
              basicAuth: dataSourceDetail.authType === 'basic auth',
              username: dataSourceDetail.basicAuthUsername,
              password: dataSourceDetail.basicAuthPassword,
              noAuth: dataSourceDetail.authType === 'no auth',
              withCredentials: false,
              tlsClientAuth: false,
              withCACert: false,
              scrapeInterval: `${dataSourceDetail.scrapeInterval.toString()}s`,
              queryTimeout: `${dataSourceDetail.queryTimeout.toString()}s`,
              httpMethod: dataSourceDetail.httpMethod,
            });
            setUpdate(true);
          }
        }
      );
    }
  }, [data]);

  useEffect(() => {
    if (update === true) {
      CallbackToSetVars(dataSourceDetails);
      setUpdate(false);
    }
  }, [update]);

  return (
    <div className={classes.root}>
      {page === 1 ? (
        <div>
          <Typography className={classes.heading}>
            {t('monitoringDashboard.dataSourceForm.general')}
          </Typography>
          <Typography className={classes.subHeading}>
            {t('monitoringDashboard.dataSourceForm.generalInfo')}
          </Typography>
          <div className={classes.flexDisplay} style={{ width: '80%' }}>
            <div className={classes.inputDiv}>
              <InputField
                label={t('monitoringDashboard.dataSourceForm.name')}
                data-cy="inputDataSourceName"
                width="22.5rem"
                variant={
                  validateTextEmpty(dataSourceDetails.name)
                    ? 'error'
                    : 'primary'
                }
                onChange={nameChangeHandler}
                value={dataSourceDetails.name}
              />
            </div>
            <div className={classes.inputDiv}>
              <InputField
                label={t('monitoringDashboard.dataSourceForm.dataSourceType')}
                data-cy="inputDataSourceType"
                width="22.5rem"
                variant={
                  validateTextEmpty(dataSourceDetails.dataSourceType)
                    ? 'error'
                    : 'primary'
                }
                disabled
                value={dataSourceDetails.dataSourceType}
              />
            </div>
          </div>
          <TextButton
            className={classes.button}
            onClick={() =>
              window.open(
                'https://github.com/litmuschaos/litmus/tree/master/monitoring#model-1-optional-prometheus-scrape-config-model'
              )
            }
            startIcon={<DocsIcon className={classes.inlineIcon} />}
            endIcon={<ExternalLinkIcon className={classes.inlineIcon} />}
            classes={{ label: classes.buttonLabel }}
            variant="highlight"
          >
            <Typography className={classes.infoValue}>
              {t('monitoringDashboard.dataSourceForm.docsAndSetup')}
            </Typography>
          </TextButton>
          <div className={classes.horizontalLine} />
          <Typography className={classes.heading}>
            {t('monitoringDashboard.dataSourceForm.endPoint')}
          </Typography>
          <Typography className={classes.subHeading}>
            {t('monitoringDashboard.dataSourceForm.endPointInfo')}
          </Typography>
          <div className={classes.flexDisplay} style={{ width: '80%' }}>
            <div className={classes.inputDiv}>
              <InputField
                label={t('monitoringDashboard.dataSourceForm.url')}
                data-cy="inputDataSourceURL"
                width="22.5rem"
                variant={
                  isValidWebUrl(dataSourceDetails.url) ? 'primary' : 'error'
                }
                onChange={urlChangeHandler}
                value={dataSourceDetails.url}
              />
            </div>
            <div className={classes.inputDiv}>
              <InputField
                label={t('monitoringDashboard.dataSourceForm.access')}
                data-cy="inputDataSourceAccess"
                width="22.5rem"
                variant={
                  validateTextEmpty(dataSourceDetails.access)
                    ? 'error'
                    : 'primary'
                }
                disabled
                value={dataSourceDetails.access}
              />
            </div>
          </div>
          <div className={classes.horizontalLine} />
        </div>
      ) : (
        <div>
          <Typography className={classes.heading}>
            {t('monitoringDashboard.dataSourceForm.authentication')}
          </Typography>
          <Typography className={classes.subHeading}>
            {t('monitoringDashboard.dataSourceForm.authenticationInfo')}
          </Typography>
          <FormGroup data-cy="authRadioGroup">
            <div className={classes.inputDivRadioButton}>
              <FormControlLabel
                control={
                  <RadioButton
                    color="primary"
                    checked={dataSourceDetails.noAuth}
                    onChange={handleAuthChange}
                    name="noAuth"
                  />
                }
                label={t('monitoringDashboard.dataSourceForm.noAuth')}
              />
              <FormControlLabel
                className={classes.basicAuth}
                control={
                  <RadioButton
                    color="primary"
                    disabled
                    checked={dataSourceDetails.basicAuth}
                    onChange={handleAuthChange}
                    name="basicAuth"
                  />
                }
                label={t('monitoringDashboard.dataSourceForm.basicAuth')}
              />
              <FormControlLabel
                className={classes.withCredentials}
                control={
                  <RadioButton
                    color="primary"
                    disabled
                    checked={dataSourceDetails.withCredentials}
                    onChange={handleAuthChange}
                    name="withCredentials"
                  />
                }
                label={t('monitoringDashboard.dataSourceForm.withCredentials')}
              />
            </div>
            <div className={classes.inputDivRadioButton}>
              <FormControlLabel
                control={
                  <RadioButton
                    color="primary"
                    disabled
                    checked={dataSourceDetails.tlsClientAuth}
                    onChange={handleAuthChange}
                    name="tlsClientAuth"
                  />
                }
                label={t('monitoringDashboard.dataSourceForm.tlsClientAuth')}
              />
              <FormControlLabel
                className={classes.withCACert}
                control={
                  <RadioButton
                    color="primary"
                    disabled
                    checked={dataSourceDetails.withCACert}
                    onChange={handleAuthChange}
                    name="withCACert"
                  />
                }
                label={t('monitoringDashboard.dataSourceForm.withCACert')}
              />
            </div>
          </FormGroup>
          <div className={classes.horizontalLine} />
          {dataSourceDetails.basicAuth ? (
            <div>
              <div className={classes.flexDisplay} style={{ width: '55%' }}>
                <div className={classes.inputDiv}>
                  <InputField
                    label={t('monitoringDashboard.dataSourceForm.username')}
                    data-cy="inputPrometheusUsername"
                    width="14rem"
                    variant={
                      validateTextEmpty(dataSourceDetails.username)
                        ? 'error'
                        : 'primary'
                    }
                    onChange={usernameChangeHandler}
                    value={dataSourceDetails.username}
                  />
                </div>
                <div className={classes.inputDiv}>
                  <InputField
                    label={t('monitoringDashboard.dataSourceForm.password')}
                    type="password"
                    data-cy="inputPrometheusPassword"
                    width="14rem"
                    variant={
                      validateTextEmpty(dataSourceDetails.password)
                        ? 'error'
                        : 'primary'
                    }
                    onChange={passwordChangeHandler}
                    value={dataSourceDetails.password}
                  />
                </div>
              </div>
              <div className={classes.horizontalLine} />
            </div>
          ) : (
            <div />
          )}
          <Typography className={classes.heading}>
            {t('monitoringDashboard.dataSourceForm.configuration')}
          </Typography>
          <Typography className={classes.subHeading}>
            {t('monitoringDashboard.dataSourceForm.configurationInfo')}
          </Typography>
          <div className={classes.flexDisplay} style={{ width: '80%' }}>
            <div className={classes.inputDiv}>
              <InputField
                label={t('monitoringDashboard.dataSourceForm.scrapeInterval')}
                data-cy="inputScrapeInterval"
                width="13.5rem"
                variant={
                  validateTimeInSeconds(dataSourceDetails.scrapeInterval)
                    ? 'primary'
                    : 'error'
                }
                onChange={scrapeIntervalChangeHandler}
                value={dataSourceDetails.scrapeInterval}
              />
            </div>
            <div className={classes.inputDiv}>
              <InputField
                label={t('monitoringDashboard.dataSourceForm.queryTimeOut')}
                data-cy="inputQueryTimeout"
                width="13.5rem"
                variant={
                  validateTimeInSeconds(dataSourceDetails.queryTimeout)
                    ? 'primary'
                    : 'error'
                }
                onChange={queryTimeoutChangeHandler}
                value={dataSourceDetails.queryTimeout}
              />
            </div>
            <div className={classes.inputDiv}>
              <InputField
                label={t('monitoringDashboard.dataSourceForm.httpMethod')}
                data-cy="inputHTTPMethod"
                width="13.5rem"
                variant={
                  validateTextEmpty(dataSourceDetails.httpMethod)
                    ? 'error'
                    : 'primary'
                }
                disabled
                value={dataSourceDetails.httpMethod}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurePrometheus;
