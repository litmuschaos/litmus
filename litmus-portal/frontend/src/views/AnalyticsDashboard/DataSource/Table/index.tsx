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
import { LIST_DATASOURCE } from '../../../../graphql/queries';
import {
  DataSourceList,
  ListDataSourceResponse,
  ListDataSourceVars,
} from '../../../../models/graphql/dataSourceDetails';
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
  lastConfigured: { sort: boolean; ascending: boolean };
  name: { sort: boolean; ascending: boolean };
  status: { sort: boolean; ascending: boolean };
  dataSourceType: { sort: boolean; ascending: boolean };
}

interface Filter {
  range: RangeType;
  selectedDataSourceType: string;
  sortData: SortData;
  selectedStatus: string;
  searchTokens: string[];
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
      status: { sort: false, ascending: true },
      dataSourceType: { sort: false, ascending: true },
    },
    selectedStatus: 'All',
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

  // Apollo query to get the data source data
  const { data, loading, error } = useQuery<DataSourceList, ListDataSourceVars>(
    LIST_DATASOURCE,
    {
      variables: { projectID: selectedProjectID },
      fetchPolicy: 'cache-and-network',
      pollInterval: 10000,
    }
  );

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
          return filter.searchTokens.every(
            (s: string) =>
              ds.ds_name.toLowerCase().includes(s) ||
              (ds.ds_type !== undefined &&
                ds.ds_type.toLowerCase().includes(s)) ||
              (ds.health_status !== undefined &&
                ds.health_status.toLowerCase().includes(s))
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
            if (filter.sortData.status.sort) {
              const x = a.health_status;
              const y = b.health_status;
              return filter.sortData.status.ascending
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
            statuses={getStatus(payload)}
            callbackToSetDataSourceType={(dataSourceType: string) => {
              setFilter({
                ...filter,
                selectedDataSourceType: dataSourceType,
              });
            }}
            callbackToSetStatus={(status: string) => {
              setFilter({
                ...filter,
                selectedStatus: status,
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
                        {t('analyticsDashboard.dataSourceTable.fetchError')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Loader />
                      <Typography align="center">
                        {t('analyticsDashboard.dataSourceTable.loading')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : !payload.length ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography align="center">
                        {t('analyticsDashboard.dataSourceTable.noRecords')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : payload.length ? (
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
                          <TableData data={data} />
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
          />
        </section>
      </Paper>
    </div>
  );
};

export default DataSourceTable;
