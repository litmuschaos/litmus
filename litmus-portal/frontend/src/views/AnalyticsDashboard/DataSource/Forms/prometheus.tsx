/* eslint-disable no-unused-expressions */
import { useQuery } from '@apollo/client';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import { InputField } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import CheckBox from '../../../../components/CheckBox';
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
  CallbackToSetVars: (vars: DataSourceDetails) => void;
}

const ConfigurePrometheus: React.FC<ConfigurePrometheusProps> = ({
  configure,
  dataSourceID,
  CallbackToSetVars,
}) => {
  const classes = useStyles();
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
    <div>
      <div className={classes.root}>
        <Typography className={classes.heading}>
          <strong>Source information</strong>
        </Typography>
        <div className={classes.flexDisplay}>
          <div className={classes.inputDiv}>
            <InputField
              label="Name"
              data-cy="inputDataSourceName"
              variant={
                validateTextEmpty(dataSourceDetails.name) ? 'error' : 'primary'
              }
              onChange={nameChangeHandler}
              value={dataSourceDetails.name}
            />
          </div>
          <div className={classes.inputDiv}>
            <InputField
              label="Data Source Type"
              data-cy="inputDataSourceType"
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
        <Divider variant="middle" className={classes.horizontalLine} />
        <Typography className={classes.heading}>
          <strong>End Point</strong>
        </Typography>
        <div className={classes.flexDisplay}>
          <div className={classes.inputDiv}>
            <InputField
              label="URL"
              data-cy="inputDataSourceURL"
              variant={
                isValidWebUrl(dataSourceDetails.url) ? 'primary' : 'error'
              }
              onChange={urlChangeHandler}
              value={dataSourceDetails.url}
            />
          </div>
          <div className={classes.inputDiv}>
            <InputField
              label="Access"
              data-cy="inputDataSourceAccess"
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
        <Divider variant="middle" className={classes.horizontalLine} />
        <Typography className={classes.heading}>
          <strong>Auth</strong>
        </Typography>
        <FormGroup>
          <div className={classes.inputDivCheckBox}>
            <FormControlLabel
              control={
                <CheckBox
                  color="primary"
                  checked={dataSourceDetails.noAuth}
                  onChange={handleAuthChange}
                  name="noAuth"
                />
              }
              label="No auth"
            />
            <FormControlLabel
              className={classes.basicAuth}
              control={
                <CheckBox
                  color="primary"
                  disabled
                  checked={dataSourceDetails.basicAuth}
                  onChange={handleAuthChange}
                  name="basicAuth"
                />
              }
              label="Basic auth"
            />
            <FormControlLabel
              className={classes.withCredentials}
              control={
                <Checkbox
                  color="primary"
                  disabled
                  checked={dataSourceDetails.withCredentials}
                  onChange={handleAuthChange}
                  name="withCredentials"
                />
              }
              label="with Credentials"
            />
          </div>
          <div className={classes.inputDivCheckBox}>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  disabled
                  checked={dataSourceDetails.tlsClientAuth}
                  onChange={handleAuthChange}
                  name="tlsClientAuth"
                />
              }
              label="TLS Client Auth"
            />
            <FormControlLabel
              className={classes.withCACert}
              control={
                <Checkbox
                  color="primary"
                  disabled
                  checked={dataSourceDetails.withCACert}
                  onChange={handleAuthChange}
                  name="withCACert"
                />
              }
              label="with CA Cert"
            />
          </div>
        </FormGroup>
        <Divider variant="middle" className={classes.horizontalLine} />
        {dataSourceDetails.basicAuth ? (
          <div>
            <Typography className={classes.heading}>
              <strong>Basic Auth Details</strong>
            </Typography>
            <div className={classes.flexDisplay}>
              <div className={classes.inputDiv}>
                <InputField
                  label="Username"
                  data-cy="inputPrometheusUsername"
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
                  label="Password"
                  data-cy="inputPrometheusPassword"
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
            <Divider variant="middle" className={classes.horizontalLine} />
          </div>
        ) : (
          <div />
        )}
        <Typography className={classes.heading}>
          <strong>Configuration</strong>
        </Typography>
        <div className={classes.flexDisplay}>
          <div className={classes.inputDiv}>
            <InputField
              label="Scrape Interval"
              data-cy="inputScrapeInterval"
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
              label="Query timeout"
              data-cy="inputQueryTimeout"
              variant={
                validateTimeInSeconds(dataSourceDetails.queryTimeout)
                  ? 'primary'
                  : 'error'
              }
              onChange={queryTimeoutChangeHandler}
              value={dataSourceDetails.queryTimeout}
            />
          </div>
        </div>
        <div className={classes.inputDivLeft}>
          <InputField
            label="HTTP Method"
            data-cy="inputHTTPMethod"
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
  );
};

export default ConfigurePrometheus;
