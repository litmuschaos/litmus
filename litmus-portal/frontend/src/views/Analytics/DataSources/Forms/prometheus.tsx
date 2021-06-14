/* eslint-disable no-unused-expressions */
import { useQuery } from '@apollo/client';
import {
  FormControlLabel,
  FormGroup,
  Icon,
  Typography,
} from '@material-ui/core';
import { InputField, RadioButton } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LIST_DATASOURCE } from '../../../../graphql';
import { DataSourceDetails } from '../../../../models/dataSourceData';
import {
  DataSourceList,
  ListDataSourceResponse,
  ListDataSourceVars,
} from '../../../../models/graphql/dataSourceDetails';
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
    LIST_DATASOURCE,
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
      data?.ListDataSource.forEach(
        (dataSourceDetail: ListDataSourceResponse) => {
          if (dataSourceDetail.ds_id === dataSourceID) {
            setDataSourceDetails({
              ...dataSourceDetails,
              id: dataSourceDetail.ds_id,
              name: dataSourceDetail.ds_name,
              dataSourceType: dataSourceDetail.ds_type,
              url: dataSourceDetail.ds_url,
              access: dataSourceDetail.access_type,
              basicAuth: dataSourceDetail.auth_type === 'basic auth',
              username: dataSourceDetail.basic_auth_username,
              password: dataSourceDetail.basic_auth_password,
              noAuth: dataSourceDetail.auth_type === 'no auth',
              withCredentials: false,
              tlsClientAuth: false,
              withCACert: false,
              scrapeInterval: `${dataSourceDetail.scrape_interval.toString()}s`,
              queryTimeout: `${dataSourceDetail.query_timeout.toString()}s`,
              httpMethod: dataSourceDetail.http_method,
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
            {t('analyticsDashboard.dataSourceForm.general')}
          </Typography>
          <Typography className={classes.subHeading}>
            {t('analyticsDashboard.dataSourceForm.generalInfo')}
          </Typography>
          <div className={classes.flexDisplay} style={{ width: '80%' }}>
            <div className={classes.inputDiv}>
              <InputField
                label={t('analyticsDashboard.dataSourceForm.name')}
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
                label={t('analyticsDashboard.dataSourceForm.dataSourceType')}
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
          <div className={classes.iconWithTextDiv}>
            <img
              src="/icons/docs.svg"
              alt="Docs icon"
              className={classes.inlineIcon}
            />
            <Typography className={classes.infoValue}>
              {t('analyticsDashboard.dataSourceForm.docsAndSetup')}
            </Typography>
            <Icon
              onClick={() => {
                window.open(
                  'https://github.com/litmuschaos/litmus/tree/master/monitoring#model-1-optional-prometheus-scrape-config-model'
                );
              }}
            >
              <img
                src="/icons/externalLink.svg"
                alt="external link"
                className={classes.linkIcon}
              />
            </Icon>
          </div>
          <div className={classes.horizontalLine} />
          <Typography className={classes.heading}>
            {t('analyticsDashboard.dataSourceForm.endPoint')}
          </Typography>
          <Typography className={classes.subHeading}>
            {t('analyticsDashboard.dataSourceForm.endPointInfo')}
          </Typography>
          <div className={classes.flexDisplay} style={{ width: '80%' }}>
            <div className={classes.inputDiv}>
              <InputField
                label={t('analyticsDashboard.dataSourceForm.url')}
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
                label={t('analyticsDashboard.dataSourceForm.Access')}
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
            {t('analyticsDashboard.dataSourceForm.authentication')}
          </Typography>
          <Typography className={classes.subHeading}>
            {t('analyticsDashboard.dataSourceForm.authenticationInfo')}
          </Typography>
          <FormGroup>
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
                label={t('analyticsDashboard.dataSourceForm.noAuth')}
              />
              <FormControlLabel
                className={classes.basicAuth}
                control={
                  <RadioButton
                    color="primary"
                    checked={dataSourceDetails.basicAuth}
                    onChange={handleAuthChange}
                    name="basicAuth"
                  />
                }
                label={t('analyticsDashboard.dataSourceForm.basicAuth')}
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
                label={t('analyticsDashboard.dataSourceForm.withCredentials')}
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
                label={t('analyticsDashboard.dataSourceForm.tlsClientAuth')}
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
                label={t('analyticsDashboard.dataSourceForm.withCACert')}
              />
            </div>
          </FormGroup>
          <div className={classes.horizontalLine} />
          {dataSourceDetails.basicAuth ? (
            <div>
              <div className={classes.flexDisplay} style={{ width: '55%' }}>
                <div className={classes.inputDiv}>
                  <InputField
                    label={t('analyticsDashboard.dataSourceForm.username')}
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
                    label={t('analyticsDashboard.dataSourceForm.password')}
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
            {t('analyticsDashboard.dataSourceForm.configuration')}
          </Typography>
          <Typography className={classes.subHeading}>
            {t('analyticsDashboard.dataSourceForm.configurationInfo')}
          </Typography>
          <div className={classes.flexDisplay} style={{ width: '80%' }}>
            <div className={classes.inputDiv}>
              <InputField
                label={t('analyticsDashboard.dataSourceForm.scrapeInterval')}
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
                label={t('analyticsDashboard.dataSourceForm.queryTimeOut')}
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
                label={t('analyticsDashboard.dataSourceForm.httpMethod')}
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
