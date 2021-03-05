/* eslint-disable no-unused-expressions */
import { useQuery } from '@apollo/client';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from '@material-ui/core';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Loader from '../../../../components/Loader';
import { LIST_DASHBOARD } from '../../../../graphql/queries';
import {
  DashboardList,
  ListDashboardResponse,
  ListDashboardVars,
} from '../../../../models/graphql/dashboardsDetails';
import { RootState } from '../../../../redux/reducers';
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
  agent: { sort: boolean; ascending: boolean };
  dataSourceType: { sort: boolean; ascending: boolean };
  dashboardType: { sort: boolean; ascending: boolean };
}

interface Filter {
  range: RangeType;
  selectedDataSourceType: string;
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
    selectedDataSourceType: 'All',
    selectedDashboardType: 'All',
    sortData: {
      name: { sort: false, ascending: true },
      lastViewed: { sort: true, ascending: false },
      agent: { sort: false, ascending: true },
      dataSourceType: { sort: false, ascending: true },
      dashboardType: { sort: false, ascending: true },
    },
    selectedAgentName: 'All',
    searchTokens: [''],
  });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
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

  // Apollo query to get the dashboard data
  const { data, loading, error } = useQuery<DashboardList, ListDashboardVars>(
    LIST_DASHBOARD,
    {
      variables: { projectID: selectedProjectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  const getDataSourceType = (searchingData: ListDashboardResponse[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.ds_type)) {
        uniqueList.push(data.ds_type);
      }
    });
    return uniqueList;
  };

  const getDashboardType = (searchingData: ListDashboardResponse[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.db_type)) {
        uniqueList.push(data.db_type);
      }
    });
    return uniqueList;
  };

  const getAgentName = (searchingData: ListDashboardResponse[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.cluster_name)) {
        uniqueList.push(data.cluster_name);
      }
    });
    return uniqueList;
  };

  const payload: ListDashboardResponse[] = data
    ? !data.ListDashboard
      ? []
      : data.ListDashboard.filter((db: ListDashboardResponse) => {
          return filter.searchTokens.every(
            (s: string) =>
              db.db_name.toLowerCase().includes(s) ||
              db.db_type.toLowerCase().includes(s) ||
              db.ds_type.toLowerCase().includes(s) ||
              db.cluster_name.toLowerCase().includes(s)
          );
        })
          .filter((data) => {
            return filter.selectedDataSourceType === 'All'
              ? true
              : data.ds_type === filter.selectedDataSourceType;
          })
          .filter((data) => {
            return filter.selectedDashboardType === 'All'
              ? true
              : data.db_type === filter.selectedDashboardType;
          })
          .filter((data) => {
            return filter.selectedAgentName === 'All'
              ? true
              : data.cluster_name === filter.selectedAgentName;
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
          .sort((a: ListDashboardResponse, b: ListDashboardResponse) => {
            // Sorting based on unique fields
            if (filter.sortData.name.sort) {
              const x = a.db_name;
              const y = b.db_name;
              return filter.sortData.name.ascending
                ? sortAlphaAsc(x, y)
                : sortAlphaDesc(x, y);
            }
            if (filter.sortData.lastViewed.sort) {
              const x = parseInt(a.updated_at, 10);
              const y = parseInt(b.updated_at, 10);
              return filter.sortData.lastViewed.ascending
                ? sortNumAsc(y, x)
                : sortNumDesc(y, x);
            }
            if (filter.sortData.dashboardType.sort) {
              const x = a.db_type;
              const y = b.db_type;
              return filter.sortData.dashboardType.ascending
                ? sortAlphaAsc(x, y)
                : sortAlphaDesc(x, y);
            }
            if (filter.sortData.dataSourceType.sort) {
              const x = a.ds_type;
              const y = b.ds_type;
              return filter.sortData.dataSourceType.ascending
                ? sortAlphaAsc(x, y)
                : sortAlphaDesc(x, y);
            }
            if (filter.sortData.agent.sort) {
              const x = a.cluster_name;
              const y = b.cluster_name;
              return filter.sortData.agent.ascending
                ? sortAlphaAsc(x, y)
                : sortAlphaDesc(x, y);
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
            dataSourceTypes={getDataSourceType(payload)}
            dashboardTypes={getDashboardType(payload)}
            agentNames={getAgentName(payload)}
            callbackToSetDataSourceType={(dataSourceType: string) => {
              setFilter({
                ...filter,
                selectedDataSourceType: dataSourceType,
              });
            }}
            callbackToSetDashboardType={(dashboardType: string) => {
              setFilter({
                ...filter,
                selectedDashboardType: dashboardType,
              });
            }}
            callbackToSetAgentName={(agentName: string) => {
              setFilter({
                ...filter,
                selectedAgentName: agentName,
              });
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
            }}
          />
        </section>
      </Paper>
      <Paper>
        <section className="table section">
          <TableContainer className={classes.tableMain}>
            <Table aria-label="simple table">
              <TableHeader
                callBackToSort={(sortConfigurations: SortData) => {
                  setFilter({
                    ...filter,
                    sortData: sortConfigurations,
                  });
                }}
              />
              <TableBody>
                {error ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography align="center">
                        {t(
                          'analyticsDashboardViews.kubernetesDashboard.table.error'
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Loader />
                      <Typography align="center">
                        {t(
                          'analyticsDashboardViews.kubernetesDashboard.table.loading'
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : !payload.length ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography align="center">
                        {t(
                          'analyticsDashboardViews.kubernetesDashboard.table.noRecords'
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : payload.length >= 0 ? (
                  payload
                    .slice(0)
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((data: ListDashboardResponse) => {
                      return (
                        <TableRow
                          hover
                          tabIndex={-1}
                          key={data.db_id}
                          className={classes.tableRow}
                        >
                          <TableData data={data} />
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography align="center">
                        {t(
                          'analyticsDashboardViews.kubernetesDashboard.table.noRecords'
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
          />
        </section>
      </Paper>
    </div>
  );
};

export default DashboardTable;
