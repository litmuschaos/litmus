/* eslint-disable no-unused-expressions */
import { useMutation, useQuery } from '@apollo/client';
import {
  Drawer,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ButtonFilled, ButtonOutlined, TextButton } from 'litmus-ui';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../../components/Loader';
import { DELETE_DATASOURCE } from '../../../../graphql';
import { LIST_DATASOURCE } from '../../../../graphql/queries';
import {
  DataSourceList,
  DeleteDataSourceInput,
  ListDataSourceResponse,
  ListDataSourceVars,
} from '../../../../models/graphql/dataSourceDetails';
import { getProjectID } from '../../../../utils/getSearchParams';
import {
  sortAlphaAsc,
  sortAlphaDesc,
  sortNumAsc,
  sortNumDesc,
} from '../../../../utils/sort';
import useStyles from './styles';
import TableData from './TableData';
import TableHeader from './TableHeader';
import TableToolBar from './TableToolbar';

interface RangeType {
  startDate: string;
  endDate: string;
}

interface SortData {
  lastConfigured: { sort: boolean; ascending: boolean };
  name: { sort: boolean; ascending: boolean };
}

interface Filter {
  range: RangeType;
  selectedDataSourceType: string;
  sortData: SortData;
  selectedStatus: string;
  searchTokens: string[];
}

interface ForceDeleteVars {
  connectedDashboards: string[];
  dsID: string;
  dsName: string;
}

const DataSourceTable: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState<Filter>({
    range: { startDate: 'all', endDate: 'all' },
    selectedDataSourceType: 'All',
    sortData: {
      name: { sort: false, ascending: true },
      lastConfigured: { sort: true, ascending: false },
    },
    selectedStatus: 'All',
    searchTokens: [''],
  });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const projectID = getProjectID();
  const [success, setSuccess] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [drawerState, setDrawerState] = React.useState(false);
  const [showAllDashboards, setShowAllDashboards] = React.useState(false);
  const [forceDeleteVars, setForceDeleteVars] = React.useState<ForceDeleteVars>(
    {
      connectedDashboards: [],
      dsID: '',
      dsName: '',
    }
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Apollo query to get the data source data
  const { data, loading, error, refetch } = useQuery<
    DataSourceList,
    ListDataSourceVars
  >(LIST_DATASOURCE, {
    variables: { projectID },
    fetchPolicy: 'cache-and-network',
    pollInterval: 10000,
  });

  const alertStateHandler = (successState: boolean) => {
    setSuccess(successState);
    setIsAlertOpen(true);
    if (successState) {
      refetch();
    }
  };

  const [deleteDataSource] = useMutation<boolean, DeleteDataSourceInput>(
    DELETE_DATASOURCE,
    {
      onCompleted: () => alertStateHandler(true),
      onError: () => alertStateHandler(false),
    }
  );

  const cleanDrawerState = () => {
    setForceDeleteVars({
      connectedDashboards: [],
      dsID: '',
      dsName: '',
    });
    setShowAllDashboards(false);
    setDrawerState(false);
  };

  const getDataSourceType = (searchingData: ListDataSourceResponse[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.ds_type)) {
        uniqueList.push(data.ds_type);
      }
    });
    return uniqueList;
  };

  const getStatus = (searchingData: ListDataSourceResponse[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.health_status)) {
        uniqueList.push(data.health_status);
      }
    });
    return uniqueList;
  };

  const payload: ListDataSourceResponse[] = data
    ? !data.ListDataSource
      ? []
      : data.ListDataSource.filter((ds: ListDataSourceResponse) => {
          return filter.searchTokens.every((s: string) =>
            ds.ds_name.toLowerCase().includes(s)
          );
        })
          .filter((data) => {
            return filter.selectedDataSourceType === 'All'
              ? true
              : data.ds_type === filter.selectedDataSourceType;
          })
          .filter((data) => {
            return filter.selectedStatus === 'All'
              ? true
              : data.health_status === filter.selectedStatus;
          })
          .filter((data) => {
            return filter.range.startDate === 'all' ||
              (filter.range.startDate && filter.range.endDate === undefined)
              ? true
              : parseInt(data.updated_at, 10) * 1000 >=
                  new Date(moment(filter.range.startDate).format()).getTime() &&
                  parseInt(data.updated_at, 10) * 1000 <=
                    new Date(
                      new Date(moment(filter.range.endDate).format()).setHours(
                        23,
                        59,
                        59
                      )
                    ).getTime();
          })
          .sort((a: ListDataSourceResponse, b: ListDataSourceResponse) => {
            // Sorting based on unique fields
            if (filter.sortData.name.sort) {
              const x = a.ds_name;
              const y = b.ds_name;

              return filter.sortData.name.ascending
                ? sortAlphaAsc(x, y)
                : sortAlphaDesc(x, y);
            }
            if (filter.sortData.lastConfigured.sort) {
              const x = parseInt(a.updated_at, 10);
              const y = parseInt(b.updated_at, 10);
              return filter.sortData.lastConfigured.ascending
                ? sortNumAsc(y, x)
                : sortNumDesc(y, x);
            }
            return 0;
          })
    : [];

  return (
    <div className={classes.root}>
      <Paper>
        <section className="Heading section">
          <TableToolBar
            searchToken={filter.searchTokens[0]}
            handleSearch={(
              event: React.ChangeEvent<{ value: unknown }> | undefined,
              token: string | undefined
            ) =>
              setFilter({
                ...filter,
                searchTokens: (event !== undefined
                  ? ((event.target as HTMLInputElement).value as string)
                  : token || ''
                )
                  .toLowerCase()
                  .split(' ')
                  .filter((s) => s !== ''),
              })
            }
            dataSourceTypes={getDataSourceType(data?.ListDataSource ?? [])}
            statuses={getStatus(data?.ListDataSource ?? [])}
            callbackToSetDataSourceType={(dataSourceType: string) =>
              setFilter({
                ...filter,
                selectedDataSourceType: dataSourceType,
              })
            }
            callbackToSetStatus={(status: string) =>
              setFilter({
                ...filter,
                selectedStatus: status,
              })
            }
            callbackToSetRange={(
              selectedStartDate: string,
              selectedEndDate: string
            ) =>
              setFilter({
                ...filter,
                range: {
                  startDate: selectedStartDate,
                  endDate: selectedEndDate,
                },
              })
            }
          />
        </section>
      </Paper>
      <Paper>
        <section className="table section">
          <TableContainer
            className={`${classes.tableMain} ${
              !payload.length || loading ? classes.minHeight : ''
            }`}
          >
            <Table aria-label="simple table">
              <TableHeader
                callBackToSort={(sortConfigurations: SortData) =>
                  setFilter({
                    ...filter,
                    sortData: sortConfigurations,
                  })
                }
              />
              <TableBody>
                {error ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography align="center">
                        {t('analyticsDashboard.dataSourceTable.fetchError')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div
                        className={`${classes.noRecords} ${classes.loading}`}
                      >
                        <Loader />
                        <Typography align="center">
                          {t('analyticsDashboard.dataSourceTable.loading')}
                        </Typography>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !payload.length ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className={classes.noRecords}>
                        <img
                          src="./icons/dataSourceUnavailable.svg"
                          className={classes.unavailableIcon}
                          alt="Data Source"
                        />
                        <Typography className={classes.noRecordsText}>
                          {t('analyticsDashboard.dataSourceTable.noRecords')}
                        </Typography>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : payload.length > 0 ? (
                  payload
                    .slice(0)
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((data: ListDataSourceResponse) => {
                      return (
                        <TableRow
                          hover
                          tabIndex={-1}
                          key={data.ds_id}
                          className={classes.tableRow}
                        >
                          <TableData
                            data={data}
                            drawerStateHandler={(
                              ds_id,
                              ds_name,
                              dashboards
                            ) => {
                              setForceDeleteVars({
                                connectedDashboards: dashboards,
                                dsID: ds_id,
                                dsName: ds_name,
                              });
                              setDrawerState(true);
                            }}
                            alertStateHandler={alertStateHandler}
                          />
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography align="center">
                        {t('analyticsDashboard.dataSourceTable.noRecords')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={payload.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
            className={classes.tablePagination}
            SelectProps={{
              MenuProps: {
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'right',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
                getContentAnchorEl: null,
                classes: { paper: classes.menuList },
              },
            }}
            classes={{ menuItem: classes.menuListItem }}
          />
        </section>
      </Paper>
      {isAlertOpen && (
        <Snackbar
          open={isAlertOpen}
          autoHideDuration={3000}
          onClose={() => setIsAlertOpen(false)}
        >
          <Alert
            onClose={() => setIsAlertOpen(false)}
            severity={success ? 'success' : 'error'}
          >
            {success
              ? t('analyticsDashboard.dataSourceTable.deletionSuccess')
              : t('analyticsDashboard.dataSourceTable.deletionError')}
          </Alert>
        </Snackbar>
      )}
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open={drawerState}
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
              {t('analyticsDashboard.dataSourceTable.delete')}
              <b>
                <i>{` ${forceDeleteVars.dsName} `}</i>
              </b>
            </Typography>
            <ButtonOutlined
              className={classes.closeButton}
              onClick={() => cleanDrawerState()}
            >
              &#x2715;
            </ButtonOutlined>
          </div>
          <blockquote className={classes.warningBlock}>
            <Typography className={classes.warningText} align="left">
              {t('analyticsDashboard.dataSourceTable.warning.text')}
            </Typography>
          </blockquote>
          <Typography className={classes.drawerBodyText} align="left">
            {t('analyticsDashboard.dataSourceTable.warning.info')}
          </Typography>
          <Typography
            className={classes.drawerBodyText}
            style={{ fontWeight: 500 }}
            align="left"
          >
            {t(
              'analyticsDashboard.dataSourceTable.warning.connectedDashboards'
            )}
          </Typography>
          <div className={classes.dashboardsList}>
            {(showAllDashboards
              ? forceDeleteVars.connectedDashboards
              : forceDeleteVars.connectedDashboards.slice(0, 3)
            ).map((name: string, index: number) => (
              <Typography
                className={`${classes.drawerBodyText} ${classes.drawerListItem}`}
                align="left"
                key={`${name}-dashboard`}
              >
                {`${index + 1}. ${name}`}
              </Typography>
            ))}
          </div>
          {forceDeleteVars.connectedDashboards.length - 3 >= 1 && (
            <TextButton
              onClick={() => setShowAllDashboards(!showAllDashboards)}
              className={classes.cancelButton}
              variant="highlight"
            >
              <Typography className={classes.buttonText}>
                {showAllDashboards
                  ? t('analyticsDashboard.dataSourceTable.warning.showLess')
                  : `+${forceDeleteVars.connectedDashboards.length - 3} ${t(
                      'analyticsDashboard.dataSourceTable.warning.dashboards'
                    )}`}
              </Typography>
            </TextButton>
          )}
          <div className={classes.flexButtons}>
            <TextButton
              onClick={() => cleanDrawerState()}
              className={classes.cancelButton}
            >
              <Typography className={classes.buttonText}>
                {t('analyticsDashboard.dataSourceTable.modal.cancel')}
              </Typography>
            </TextButton>
            <ButtonFilled
              onClick={() => {
                deleteDataSource({
                  variables: {
                    deleteDSInput: {
                      ds_id: forceDeleteVars.dsID,
                      force_delete: true,
                    },
                  },
                });
                cleanDrawerState();
              }}
              variant="error"
            >
              <Typography
                className={`${classes.buttonText} ${classes.confirmButtonText}`}
              >
                {t('analyticsDashboard.dataSourceTable.modal.forceDelete')}
              </Typography>
            </ButtonFilled>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default DataSourceTable;
