import { ApolloError, useMutation } from '@apollo/client';
import { Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, LightPills, Modal } from 'litmus-ui';
import moment from 'moment';
import React, { useEffect } from 'react';
import { DELETE_DATASOURCE } from '../../../../graphql';
import {
  DeleteDataSourceInput,
  deleteDSInput,
  ListDataSourceResponse,
} from '../../../../models/graphql/dataSourceDetails';
import useActions from '../../../../redux/actions';
import * as DataSourceActions from '../../../../redux/actions/dataSource';
import * as TabActions from '../../../../redux/actions/tabs';
import { history } from '../../../../redux/configureStore';
import { ReactComponent as CogWheelIcon } from '../../../../svg/cogwheel.svg';
import { ReactComponent as CrossMarkIcon } from '../../../../svg/crossmark.svg';
import { ReactComponent as BinIcon } from '../../../../svg/delete.svg';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import useStyles, { StyledTableCell } from './styles';

interface TableDataProps {
  data: ListDataSourceResponse;
}

const TableData: React.FC<TableDataProps> = ({ data }) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const dataSource = useActions(DataSourceActions);
  const tabs = useActions(TabActions);
  const [mutate, setMutate] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [
    connectedDashboardsMessage,
    setConnectedDashboardsMessage,
  ] = React.useState<string>('');
  const [open, setOpen] = React.useState(false);
  const [
    dataSourceSelectedForDeleting,
    setDataSourceSelectedForDeleting,
  ] = React.useState<deleteDSInput>({
    ds_id: '',
    force_delete: false,
  });
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
        setConnectedDashboardsMessage('');
        setSuccess(true);
        setMutate(false);
        setOpen(true);
      },
      onError: (error: ApolloError) => {
        setConnectedDashboardsMessage(error.message);
        setMutate(false);
        setOpen(true);
      },
    }
  );

  useEffect(() => {
    if (mutate === true) {
      deleteDataSource({
        variables: { deleteDSInput: dataSourceSelectedForDeleting },
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
          <LightPills variant="danger" label={data.health_status} />
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
      <StyledTableCell
        onClick={() => {
          const deleteDataSourceInput: deleteDSInput = {
            force_delete: false,
            ds_id: data.ds_id,
          };
          setDataSourceSelectedForDeleting(deleteDataSourceInput);
          setOpen(true);
        }}
      >
        <Typography variant="body2" align="center">
          <BinIcon className={classes.binIcon} />
        </Typography>
        <Typography variant="body2" align="center" className={classes.delete}>
          Delete
        </Typography>
      </StyledTableCell>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setConfirm(false);
        }}
        width="60%"
        modalActions={
          <ButtonOutlined
            className={classes.closeButton}
            onClick={() => {
              setOpen(false);
              setConfirm(false);
            }}
          >
            &#x2715;
          </ButtonOutlined>
        }
      >
        <div className={classes.modal}>
          {confirm === true ? (
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
          ) : (
            <div />
          )}

          {confirm === true ? (
            <Typography
              className={classes.modalHeading}
              align="center"
              variant="h3"
            >
              {success === true
                ? `The data source is successfully deleted.`
                : success === false &&
                  dataSourceSelectedForDeleting?.force_delete === false
                ? `${connectedDashboardsMessage}`
                : `There was a problem deleting your data source.`}
            </Typography>
          ) : (
            <div />
          )}

          {confirm === true ? (
            <Typography
              align="center"
              variant="body1"
              className={classes.modalBody}
            >
              {success === true ? (
                <div>
                  You will see the data source deleted in the datasource table.
                </div>
              ) : success === false &&
                dataSourceSelectedForDeleting?.force_delete === false ? (
                <div>
                  Dashboard(s) configured to use this data source will be
                  deleted.
                </div>
              ) : (
                <div>
                  Error encountered while deleting the data source. Please try
                  again.
                </div>
              )}
            </Typography>
          ) : (
            <div />
          )}

          {success === true && confirm === true ? (
            <ButtonFilled
              variant="success"
              onClick={() => {
                setConfirm(false);
                setOpen(false);
                tabs.changeAnalyticsDashboardTabs(3);
                window.location.reload();
              }}
            >
              <div>Back to Data Source</div>
            </ButtonFilled>
          ) : success === false && confirm === true ? (
            <div className={classes.flexButtons}>
              {dataSourceSelectedForDeleting?.force_delete === false ? (
                <ButtonFilled
                  variant="error"
                  onClick={() => {
                    setDataSourceSelectedForDeleting({
                      ds_id: dataSourceSelectedForDeleting.ds_id,
                      force_delete: true,
                    });
                    setOpen(false);
                    setMutate(true);
                  }}
                >
                  <div>Force Delete</div>
                </ButtonFilled>
              ) : (
                <ButtonOutlined
                  className={classes.buttonOutlineWarning}
                  onClick={() => {
                    setOpen(false);
                    setMutate(true);
                  }}
                  disabled={false}
                >
                  <div>Try Again</div>
                </ButtonOutlined>
              )}

              <ButtonFilled
                onClick={() => {
                  setConfirm(false);
                  setOpen(false);
                  tabs.changeAnalyticsDashboardTabs(3);
                  window.location.reload();
                }}
              >
                <div>Back to Data Source</div>
              </ButtonFilled>
            </div>
          ) : (
            <div>
              <Typography align="center">
                <img
                  src="/icons/delete_large_icon.svg"
                  alt="delete"
                  className={classes.icon}
                />
              </Typography>

              <Typography
                className={classes.modalHeading}
                align="center"
                variant="h3"
              >
                Are you sure to remove this data source?
              </Typography>

              <Typography
                align="center"
                variant="body1"
                className={classes.modalBody}
              >
                The following action cannot be reverted.
              </Typography>

              <div className={classes.flexButtons}>
                <ButtonOutlined
                  onClick={() => {
                    setOpen(false);
                    history.push({
                      pathname: '/analytics',
                      search: `?projectID=${projectID}&projectRole=${projectRole}`,
                    });
                  }}
                  disabled={false}
                >
                  <div>No</div>
                </ButtonOutlined>

                <ButtonFilled
                  variant="error"
                  onClick={() => {
                    setConfirm(true);
                    setOpen(false);
                    setMutate(true);
                  }}
                >
                  <div>Yes</div>
                </ButtonFilled>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
export default TableData;
