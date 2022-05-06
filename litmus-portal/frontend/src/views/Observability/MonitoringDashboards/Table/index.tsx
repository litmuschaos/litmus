/* eslint-disable no-unused-expressions */
import { useQuery } from '@apollo/client';
import {
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
import { ButtonFilled, TextButton } from 'litmus-ui';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../../components/Loader';
import { GET_DASHBOARD, GET_DATASOURCE } from '../../../../graphql/queries';
import {
  GetDashboard,
  GetDashboardRequest,
  GetDashboardResponse,
} from '../../../../models/graphql/dashboardsDetails';
import {
  DataSourceList,
  ListDataSourceResponse,
  ListDataSourceVars,
} from '../../../../models/graphql/dataSourceDetails';
import useActions from '../../../../redux/actions';
import * as TabActions from '../../../../redux/actions/tabs';
import { history } from '../../../../redux/configureStore';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
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
  lastViewed: { sort: boolean; ascending: boolean };
  name: { sort: boolean; ascending: boolean };
}

interface Filter {
  range: RangeType;
  selectedDashboardType: string;
  sortData: SortData;
  selectedAgentName: string;
  searchTokens: string[];
}

const DashboardTable: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState<Filter>({
    range: { startDate: 'all', endDate: 'all' },
    selectedDashboardType: 'All',
    sortData: {
      name: { sort: false, ascending: true },
      lastViewed: { sort: true, ascending: false },
    },
    selectedAgentName: 'All',
    searchTokens: [''],
  });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const tabs = useActions(TabActions);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [activeDataSourceAvailable, setActiveDataSourceAvailable] =
    React.useState(false);

  // Apollo query to get the dashboard data
  const { data, loading, error, refetch } = useQuery<
    GetDashboard,
    GetDashboardRequest
  >(GET_DASHBOARD, {
    variables: { projectID },
    fetchPolicy: 'cache-and-network',
  });

  // Apollo query to get the data source data
  const { data: dataSourceList, loading: loadingDataSources } = useQuery<
    DataSourceList,
    ListDataSourceVars
  >(GET_DATASOURCE, {
    variables: { projectID },
    fetchPolicy: 'cache-and-network',
  });

  const alertStateHandler = (successState: boolean) => {
    setSuccess(successState);
    setIsAlertOpen(true);
    if (successState) {
      refetch();
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getDashboardType = (searchingData: GetDashboardResponse[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.dbTypeName)) {
        uniqueList.push(data.dbTypeName);
      }
    });
    return uniqueList;
  };

  const getAgentName = (searchingData: GetDashboardResponse[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.clusterName)) {
        uniqueList.push(data.clusterName);
      }
    });
    return uniqueList;
  };

  const payload: GetDashboardResponse[] = data
    ? !data.listDashboard
      ? []
      : data.listDashboard
          .filter((db: GetDashboardResponse) => {
            return filter.searchTokens.every((s: string) =>
              db.dbName.toLowerCase().includes(s)
            );
          })
          .filter((data) => {
            return filter.selectedDashboardType === 'All'
              ? true
              : data.dbTypeName === filter.selectedDashboardType;
          })
          .filter((data) => {
            return filter.selectedAgentName === 'All'
              ? true
              : data.clusterName === filter.selectedAgentName;
          })
          .filter((data) => {
            return filter.range.startDate === 'all' ||
              (filter.range.startDate && filter.range.endDate === undefined)
              ? true
              : parseInt(data.viewedAt, 10) * 1000 >=
                  new Date(moment(filter.range.startDate).format()).getTime() &&
                  parseInt(data.viewedAt, 10) * 1000 <=
                    new Date(
                      new Date(moment(filter.range.endDate).format()).setHours(
                        23,
                        59,
                        59
                      )
                    ).getTime();
          })
          .sort((a: GetDashboardResponse, b: GetDashboardResponse) => {
            // Sorting based on unique fields
            if (filter.sortData.name.sort) {
              const x = a.dbName;
              const y = b.dbName;
              return filter.sortData.name.ascending
                ? sortAlphaAsc(x, y)
                : sortAlphaDesc(x, y);
            }
            if (filter.sortData.lastViewed.sort) {
              const x = parseInt(a.viewedAt, 10);
              const y = parseInt(b.viewedAt, 10);
              return filter.sortData.lastViewed.ascending
                ? sortNumAsc(x, y)
                : sortNumDesc(x, y);
            }
            return 0;
          })
    : [];

  useEffect(() => {
    if (dataSourceList && dataSourceList.listDataSource) {
      const activeDataSources: ListDataSourceResponse[] =
        dataSourceList.listDataSource.filter(
          (dataSource) => dataSource.healthStatus === 'Active'
        ) ?? [];
      if (activeDataSources.length) {
        setActiveDataSourceAvailable(true);
      }
    }
  }, [dataSourceList]);

  return (
    <div className={classes.root}>
      <div className={classes.tabHeaderFlex}>
        <Typography className={classes.tabHeaderText}>
          {t('monitoringDashboard.monitoringDashboardTable.dashboards')}
        </Typography>
        <ButtonFilled
          onClick={() =>
            history.push({
              pathname: '/analytics/dashboard/create',
              search: `?projectID=${projectID}&projectRole=${projectRole}`,
            })
          }
          className={classes.createButton}
          disabled={
            loadingDataSources ||
            (!activeDataSourceAvailable && !loadingDataSources)
          }
          data-cy="createDashboard"
        >
          <Typography
            className={`${classes.buttonText} ${
              loadingDataSources ||
              (!activeDataSourceAvailable && !loadingDataSources)
                ? classes.disabledText
                : ''
            }`}
          >
            {t('monitoringDashboard.monitoringDashboardTable.createDashboard')}
          </Typography>
        </ButtonFilled>
      </div>
      {!activeDataSourceAvailable && !loadingDataSources && (
        <blockquote className={classes.warningBlock}>
          <Typography className={classes.warningText} align="left">
            {dataSourceList?.listDataSource.length
              ? t(
                  'monitoringDashboard.monitoringDashboardTable.warning.noActiveDataSource'
                )
              : t(
                  'monitoringDashboard.monitoringDashboardTable.warning.noAvailableDataSource'
                )}
          </Typography>
          <div className={classes.warningActions}>
            {dataSourceList && dataSourceList.listDataSource.length > 0 && (
              <>
                <TextButton
                  onClick={() => tabs.changeObservabilityDashboardTabs(3)}
                  variant="highlight"
                  className={classes.warningButton}
                >
                  <Typography
                    className={classes.buttonText}
                    style={{ fontWeight: 500 }}
                  >
                    {t(
                      'monitoringDashboard.monitoringDashboardTable.warning.configureExisting'
                    )}
                  </Typography>
                </TextButton>
                <Typography className={classes.orText}>
                  {t('monitoringDashboard.monitoringDashboardTable.warning.or')}
                </Typography>
              </>
            )}
            <TextButton
              onClick={() =>
                history.push({
                  pathname: '/analytics/datasource/create',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                })
              }
              variant="highlight"
              className={classes.warningButton}
            >
              <Typography
                className={classes.buttonText}
                style={{ fontWeight: 500 }}
              >
                {t(
                  'monitoringDashboard.monitoringDashboardTable.warning.addNew'
                )}
              </Typography>
            </TextButton>
          </div>
        </blockquote>
      )}
      <Paper>
        <section className="Heading section">
          <TableToolBar
            searchToken={filter.searchTokens[0]}
            handleSearch={(
              event: React.ChangeEvent<{ value: unknown }> | undefined,
              token: string | undefined
            ) => {
              setFilter({
                ...filter,
                searchTokens: (event !== undefined
                  ? ((event.target as HTMLInputElement).value as string)
                  : token || ''
                )
                  .toLowerCase()
                  .split(' ')
                  .filter((s) => s !== ''),
              });
              setPage(0);
            }}
            dashboardTypes={getDashboardType(data?.listDashboard ?? [])}
            agentNames={getAgentName(data?.listDashboard ?? [])}
            callbackToSetDashboardType={(dashboardType: string) => {
              setFilter({
                ...filter,
                selectedDashboardType: dashboardType,
              });
              setPage(0);
            }}
            callbackToSetAgentName={(agentName: string) => {
              setFilter({
                ...filter,
                selectedAgentName: agentName,
              });
              setPage(0);
            }}
            callbackToSetRange={(
              selectedStartDate: string,
              selectedEndDate: string
            ) => {
              setFilter({
                ...filter,
                range: {
                  startDate: selectedStartDate,
                  endDate: selectedEndDate,
                },
              });
              setPage(0);
            }}
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
                        {t(
                          'monitoringDashboard.monitoringDashboardTable.error'
                        )}
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
                          {t(
                            'monitoringDashboard.monitoringDashboardTable.loading'
                          )}
                        </Typography>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !payload.length ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className={classes.noRecords}>
                        <img
                          src="./icons/dashboardUnavailable.svg"
                          className={classes.unavailableIcon}
                          alt="Dashboard"
                        />
                        <Typography className={classes.noRecordsText}>
                          {t(
                            'monitoringDashboard.monitoringDashboardTable.noRecords'
                          )}
                        </Typography>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : payload.length > 0 ? (
                  payload
                    .slice(0)
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((data: GetDashboardResponse) => {
                      return (
                        <TableRow
                          hover
                          tabIndex={-1}
                          key={data.dbID}
                          className={classes.tableRow}
                        >
                          <TableData
                            data={data}
                            alertStateHandler={alertStateHandler}
                          />
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography align="center">
                        {t(
                          'monitoringDashboard.monitoringDashboardTable.noRecords'
                        )}
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
              ? t(
                  'monitoringDashboard.monitoringDashboardTable.deletionSuccess'
                )
              : t('monitoringDashboard.monitoringDashboardTable.deletionError')}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

export default DashboardTable;
