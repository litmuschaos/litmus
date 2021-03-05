import { useMutation } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
import { isValidWebUrl, validateTimeInSeconds } from '../../utils/validate';
import ConfigurePrometheus from '../../views/AnalyticsDashboard/DataSource/Forms/prometheus';
import useStyles from './styles';

interface DataSourceConfigurePageProps {
  configure: boolean;
}

const DataSourceConfigurePage: React.FC<DataSourceConfigurePageProps> = ({
  configure,
}) => {
  const classes = useStyles();
  const dataSourceID = useSelector(
    (state: RootState) => state.selectDataSource.selectedDataSourceID
  );
  const selectedDataSourceName = useSelector(
    (state: RootState) => state.selectDataSource.selectedDataSourceName
  );
  const projectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );
  const [open, setOpen] = React.useState(false);
  const [disabled, setDisabled] = React.useState(true);
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
      ds_url: dataSourceVars.url,
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
      ds_id: dataSourceVars.id,
      ds_name: dataSourceVars.name,
      ds_type: dataSourceVars.dataSourceType,
      ds_url: dataSourceVars.url,
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
            <div className={classes.config}>
              <Typography className={classes.heading}>
                Configure a new data source
              </Typography>
              <Typography className={classes.description}>
                Connect to a data source for your project.
              </Typography>
            </div>
            <ConfigurePrometheus
              configure={configure}
              CallbackToSetVars={(vars: DataSourceDetails) => {
                setDataSourceVars(vars);
              }}
            />
          </div>
        ) : (
          <div>
            <div className={classes.config}>
              <Typography className={classes.heading}>
                Configure data source / {selectedDataSourceName}
              </Typography>
              <Typography className={classes.description}>
                Configure data source information.
              </Typography>
            </div>
            {dataSourceID ? (
              <ConfigurePrometheus
                configure={configure}
                dataSourceID={dataSourceID}
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
              variant="success"
              disabled={disabled}
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
        width="55%"
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
              ? `A new data source is successfully connected`
              : success === true && configure === true
              ? `Data source information is successfully updated`
              : `There was a problem with connecting your data source`}
          </Typography>

          <Typography
            align="center"
            variant="body1"
            className={classes.modalBody}
          >
            {success === true && configure === false ? (
              <div>
                You will see the data source connected in the datasource table.
              </div>
            ) : success === true && configure === true ? (
              <div>
                You will see the data source information updated in the
                datasource table.
              </div>
            ) : (
              <div>Try back again or check your entered details.</div>
            )}
          </Typography>

          {success === true ? (
            <ButtonFilled
              variant="success"
              onClick={() => history.push('/analytics')}
            >
              <div>Back to Data Source</div>
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
                onClick={() => history.push('/analytics')}
              >
                <div>Back to Data Source</div>
              </ButtonFilled>
            </div>
          )}
        </div>
      </Modal>
    </Scaffold>
  );
};

export default DataSourceConfigurePage;
