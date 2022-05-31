import { ApolloError, useMutation } from '@apollo/client';
import { IconButton, Menu, MenuItem, Typography } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { ButtonFilled, LightPills, Modal, TextButton } from 'litmus-ui';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TextPopOver from '../../../../components/TextPopOver';
import { DELETE_DATASOURCE } from '../../../../graphql';
import {
  DeleteDataSourceInput,
  ListDataSourceResponse,
} from '../../../../models/graphql/dataSourceDetails';
import useActions from '../../../../redux/actions';
import * as DataSourceActions from '../../../../redux/actions/dataSource';
import { history } from '../../../../redux/configureStore';
import { ReactComponent as ExternalLinkIcon } from '../../../../svg/externalLink.svg';
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
  const { t } = useTranslation();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const dataSource = useActions(DataSourceActions);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [mutate, setMutate] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);

  // Function to convert UNIX time in format of dddd, DD MMM YYYY, HH:mm
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('dddd, DD MMM YYYY, HH:mm');
    return resDate;
  };
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
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
          drawerStateHandler(data.dsID, data.dsName, dashboardNames);
        }
      },
    }
  );

  useEffect(() => {
    if (mutate === true) {
      deleteDataSource({
        variables: {
          projectID: getProjectID(),
          input: {
            dsID: data.dsID,
            forceDelete: false,
          },
        },
      });
    }
  }, [mutate]);

  return (
    <>
      <StyledTableCell className={classes.tableDataStatus}>
        {data.healthStatus === 'Active' ? (
          <LightPills variant="success" label={data.healthStatus} />
        ) : data.healthStatus === 'Not Ready' ? (
          <LightPills variant="warning" label={data.healthStatus} />
        ) : (
          <LightPills variant="danger" label={data.healthStatus} />
        )}
      </StyledTableCell>
      <StyledTableCell className={classes.columnDivider}>
        <Typography
          className={`${classes.tableObjects} ${classes.dataSourceNameCol}`}
          style={{ fontWeight: 500 }}
        >
          {data.dsName}
        </Typography>
      </StyledTableCell>
      <StyledTableCell className={classes.dividerPadding}>
        <Typography
          className={`${classes.tableObjects} ${classes.flexObject}`}
          style={{ maxWidth: '5rem' }}
        >
          <img
            src="./icons/prometheus.svg"
            alt="Prometheus"
            className={classes.inlineIcon}
          />
          {data.dsType}
        </Typography>
      </StyledTableCell>
      <StyledTableCell>
        <Typography
          className={`${classes.tableObjects} ${classes.flexObject}`}
          style={{ maxWidth: '13.5rem' }}
        >
          <img src="./icons/calendarIcon.svg" alt="Calender" />
          {formatDate(data.updatedAt)}
        </Typography>
      </StyledTableCell>

      <StyledTableCell>
        <TextButton
          className={classes.button}
          onClick={() => window.open(data.dsURL)}
          endIcon={<ExternalLinkIcon className={classes.inlineIcon} />}
          classes={{ label: classes.buttonLabel }}
        >
          <TextPopOver
            text={data.dsURL}
            className={`${classes.tableObjects} ${classes.dataSourceUrlColData}`}
          />
        </TextButton>
      </StyledTableCell>

      <StyledTableCell>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
          data-cy="browseDataSourceOptions"
        >
          <MoreVertIcon className={classes.headerIcon} />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          getContentAnchorEl={null}
          classes={{ paper: classes.menuList }}
        >
          <MenuItem
            value="Configure"
            onClick={() => {
              dataSource.selectDataSource({
                selectedDataSourceID: data.dsID,
                selectedDataSourceName: data.dsName,
              });
              history.push({
                pathname: '/analytics/datasource/configure',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
            className={classes.menuItem}
          >
            <div className={classes.flexDisplay}>
              <img
                src="./icons/cogwheel.svg"
                alt="Configure"
                className={classes.btnImg}
              />
              <Typography
                data-cy="configureDatasource"
                className={classes.btnText}
              >
                {t('monitoringDashboard.dataSourceTable.configure')}
              </Typography>
            </div>
          </MenuItem>

          <MenuItem
            value="Delete"
            onClick={() => {
              setOpenModal(true);
              handleClose();
            }}
            className={classes.menuItem}
          >
            <div className={classes.flexDisplay}>
              <img
                src="./icons/delete.svg"
                alt="Delete"
                className={classes.btnImg}
              />
              <Typography
                data-cy="deleteDatasource"
                className={`${classes.btnText} ${classes.deleteText}`}
              >
                {t('monitoringDashboard.dataSourceTable.delete')}
              </Typography>
            </div>
          </MenuItem>
        </Menu>
      </StyledTableCell>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        width="45%"
        height="fit-content"
        data-cy="deleteDataSourceModal"
      >
        <div className={classes.modal}>
          <Typography className={classes.modalHeading} align="left">
            {t('monitoringDashboard.dataSourceTable.modal.removeDataSource')}
          </Typography>

          <Typography className={classes.modalBodyText} align="left">
            {t(
              'monitoringDashboard.dataSourceTable.modal.removeDataSourceConfirmation'
            )}
            <b>
              <i>{` ${data.dsName} `}</i>
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
              <Typography className={classes.buttonText}>
                {t('monitoringDashboard.dataSourceTable.modal.cancel')}
              </Typography>
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
                {t('monitoringDashboard.dataSourceTable.modal.delete')}
              </Typography>
            </ButtonFilled>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default TableData;
