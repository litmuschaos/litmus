import { ApolloError, useMutation } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonFilled, LightPills, Modal, TextButton } from 'litmus-ui';
import moment from 'moment';
import React, { useEffect } from 'react';
import { DELETE_DATASOURCE } from '../../../../graphql';
import {
  DeleteDataSourceInput,
  ListDataSourceResponse,
} from '../../../../models/graphql/dataSourceDetails';
import useActions from '../../../../redux/actions';
import * as DataSourceActions from '../../../../redux/actions/dataSource';
import { history } from '../../../../redux/configureStore';
import { ReactComponent as CogWheelIcon } from '../../../../svg/cogwheel.svg';
import { ReactComponent as BinIcon } from '../../../../svg/delete.svg';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import useStyles, { StyledTableCell } from './styles';

interface TableDataProps {
  data: ListDataSourceResponse;
  drawerStateHandler: (
    ds_id: string,
    ds_name: string,
    dashboards: string[]
  ) => void;
  alertStateHandler: (successState: boolean) => void;
}

const TableData: React.FC<TableDataProps> = ({
  data,
  drawerStateHandler,
  alertStateHandler,
}) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const dataSource = useActions(DataSourceActions);
  const [mutate, setMutate] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  // Function to convert UNIX time in format of dddd, DD MMM YYYY, HH:mm
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('dddd, DD MMM YYYY, HH:mm');
    return resDate;
  };

  const [deleteDataSource] = useMutation<boolean, DeleteDataSourceInput>(
    DELETE_DATASOURCE,
    {
      onCompleted: () => {
        setMutate(false);
        alertStateHandler(true);
      },
      onError: (error: ApolloError) => {
        setMutate(false);
        alertStateHandler(false);
        if (error.message.includes('dashboard(s)')) {
          const dashboardList: string = error.message.split(':')[1].trim();
          const dashboardNames: string[] = dashboardList
            .substring(1, dashboardList.length - 1)
            .split(',');
          drawerStateHandler(data.ds_id, data.ds_name, dashboardNames);
        }
      },
    }
  );

  useEffect(() => {
    if (mutate === true) {
      deleteDataSource({
        variables: {
          deleteDSInput: {
            ds_id: data.ds_id,
            force_delete: false,
          },
        },
      });
    }
  }, [mutate]);

  return (
    <>
      <StyledTableCell className={classes.tableDataStatus}>
        {data.health_status === 'Active' ? (
          <LightPills variant="success" label={data.health_status} />
        ) : data.health_status === 'Not Ready' ? (
          <LightPills variant="warning" label={data.health_status} />
        ) : (
          <LightPills
            variant="danger"
            label={data.health_status !== '' ? data.health_status : 'Inactive'}
          />
        )}
      </StyledTableCell>
      <StyledTableCell className={classes.dataSourceName}>
        <Typography variant="body2">
          <strong>{data.ds_name}</strong>
        </Typography>
      </StyledTableCell>
      <StyledTableCell className={classes.dataSourceType}>
        <Typography variant="body2">
          <strong>{data.ds_type}</strong>
        </Typography>
      </StyledTableCell>
      <StyledTableCell className={classes.dataSourceName}>
        <Typography variant="body2">{formatDate(data.updated_at)}</Typography>
      </StyledTableCell>
      <StyledTableCell
        onClick={() => {
          dataSource.selectDataSource({
            selectedDataSourceID: data.ds_id,
            selectedDataSourceName: data.ds_name,
          });
          history.push({
            pathname: '/analytics/datasource/configure',
            search: `?projectID=${projectID}&projectRole=${projectRole}`,
          });
        }}
      >
        <Typography variant="body2" align="center">
          <CogWheelIcon className={classes.cogWheelIcon} />
        </Typography>
        <Typography variant="body2" align="center">
          Configure
        </Typography>
      </StyledTableCell>
      <StyledTableCell onClick={() => setOpenModal(true)}>
        <Typography variant="body2" align="center">
          <BinIcon className={classes.binIcon} />
        </Typography>
        <Typography variant="body2" align="center" className={classes.delete}>
          Delete
        </Typography>
      </StyledTableCell>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        width="45%"
        height="fit-content"
      >
        <div className={classes.modal}>
          <Typography className={classes.modalHeading} align="left">
            Remove data source ?
          </Typography>

          <Typography className={classes.modalBodyText} align="left">
            Are you sure you want to remove the data source
            <b>
              <i>{` ${data.ds_name} `}</i>
            </b>
            ?
          </Typography>

          <div
            className={`${classes.flexButtons} ${classes.flexButtonsPadding}`}
          >
            <TextButton
              onClick={() => setOpenModal(false)}
              className={classes.cancelButton}
            >
              <Typography className={classes.buttonText}>Cancel</Typography>
            </TextButton>
            <ButtonFilled
              onClick={() => {
                setMutate(true);
                setOpenModal(false);
              }}
              variant="error"
            >
              <Typography
                className={`${classes.buttonText} ${classes.confirmButtonText}`}
              >
                Delete
              </Typography>
            </ButtonFilled>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default TableData;
