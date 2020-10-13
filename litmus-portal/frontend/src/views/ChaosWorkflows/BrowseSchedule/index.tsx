import { useMutation, useQuery } from '@apollo/client';
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SearchIcon from '@material-ui/icons/Search';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Loader from '../../../components/Loader';
import { SCHEDULE_DETAILS, DELETE_SCHEDULE } from '../../../graphql';
import {
  DeleteSchedule,
  ScheduleDataVars,
  Schedules,
  ScheduleWorkflow,
} from '../../../models/graphql/scheduleData';
import { RootState } from '../../../redux/reducers';
import {
  sortAlphaAsc,
  sortAlphaDesc,
  sortNumAsc,
  sortNumDesc,
} from '../../../utils/sort';
import useStyles from './styles';
import TableData from './TableData';

interface FilterOption {
  search: string;
  cluster: string;
}
interface PaginationData {
  pageNo: number;
  rowsPerPage: number;
}
interface SortData {
  startDate: { sort: boolean; ascending: boolean };
  name: { sort: boolean; ascending: boolean };
}

const BrowseSchedule = () => {
  const classes = useStyles();
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );

  // Apollo query to get the scheduled data
  const { data, loading, error } = useQuery<Schedules, ScheduleDataVars>(
    SCHEDULE_DETAILS,
    {
      variables: { projectID: selectedProjectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  // Apollo mutation to delete the selected schedule
  const [deleteSchedule] = useMutation<DeleteSchedule>(DELETE_SCHEDULE, {
    refetchQueries: [
      { query: SCHEDULE_DETAILS, variables: { projectID: selectedProjectID } },
    ],
  });

  // State for search and filtering
  const [filter, setFilter] = React.useState<FilterOption>({
    search: '',
    cluster: 'All',
  });

  // State for pagination
  const [paginationData, setPaginationData] = useState<PaginationData>({
    pageNo: 0,
    rowsPerPage: 5,
  });

  // State for sorting
  const [sortData, setSortData] = useState<SortData>({
    name: { sort: false, ascending: true },
    startDate: { sort: true, ascending: true },
  });

  const getClusters = (searchingData: ScheduleWorkflow[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.cluster_name)) {
        uniqueList.push(data.cluster_name);
      }
    });
    return uniqueList;
  };

  const filteredData = data?.getScheduledWorkflows
    .filter((dataRow) =>
      dataRow.workflow_name.toLowerCase().includes(filter.search.toLowerCase())
    )
    .filter((dataRow) =>
      filter.cluster === 'All'
        ? true
        : dataRow.cluster_name
            .toLowerCase()
            .includes(filter.cluster.toLowerCase())
    )
    .sort((a: ScheduleWorkflow, b: ScheduleWorkflow) => {
      // Sorting based on unique fields
      if (sortData.name.sort) {
        const x = a.workflow_name;
        const y = b.workflow_name;
        return sortData.name.ascending
          ? sortAlphaAsc(x, y)
          : sortAlphaDesc(x, y);
      }
      if (sortData.startDate.sort) {
        const x = parseInt(a.updated_at, 10);
        const y = parseInt(b.updated_at, 10);
        return sortData.startDate.ascending
          ? sortNumAsc(y, x)
          : sortNumDesc(y, x);
      }
      return 0;
    });

  const deleteRow = (wfid: string) => {
    deleteSchedule({
      variables: { workflow_id: wfid },
    });
  };
  return (
    <div>
      <section className="Heading section">
        <div className={classes.headerSection}>
          {/* Search Field */}
          <InputBase
            id="input-with-icon-adornment"
            placeholder="Search"
            className={classes.search}
            value={filter.search}
            onChange={(event) =>
              setFilter({ ...filter, search: event.target.value as string })
            }
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
          />
          {/* Select Cluster */}
          <FormControl
            variant="outlined"
            className={classes.formControl}
            color="secondary"
            focused
          >
            <InputLabel className={classes.selectText}>
              Target Cluster
            </InputLabel>
            <Select
              value={filter.cluster}
              onChange={(event) =>
                setFilter({ ...filter, cluster: event.target.value as string })
              }
              label="Target Cluster"
              className={classes.selectText}
            >
              <MenuItem value="All">All</MenuItem>
              {(data ? getClusters(data?.getScheduledWorkflows) : []).map(
                (cluster: any) => (
                  <MenuItem value={cluster}>{cluster}</MenuItem>
                )
              )}
            </Select>
          </FormControl>
        </div>
      </section>
      <Paper className={classes.root}>
        {/* Table Header */}
        <TableContainer
          data-cy="browseScheduleTable"
          className={classes.tableMain}
        >
          <Table stickyHeader aria-label="simple table">
            <TableHead>
              <TableRow className={classes.tableHead}>
                {/* WorkFlow Name */}
                <TableCell className={classes.workflowName}>
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography style={{ paddingLeft: 30, paddingTop: 12 }}>
                      Schedule Name
                    </Typography>
                    <div className={classes.sortDiv}>
                      <IconButton
                        aria-label="sort name ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            name: { sort: false, ascending: false },
                            startDate: { sort: false, ascending: false },
                          })
                        }
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort name descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            name: { sort: false, ascending: true },
                            startDate: { sort: true, ascending: true },
                          })
                        }
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* Starting Date */}
                <TableCell className={classes.headerStatus}>
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography style={{ paddingTop: 12 }}>
                      Starting Date
                    </Typography>
                    <div className={classes.sortDiv}>
                      <IconButton
                        aria-label="sort last run ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            startDate: { sort: true, ascending: true },
                            name: { sort: false, ascending: true },
                          })
                        }
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort last run descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            startDate: { sort: true, ascending: false },
                            name: { sort: false, ascending: true },
                          })
                        }
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* Regularity */}
                <TableCell>
                  <Typography className={classes.regularity}>
                    Regularity
                  </Typography>
                </TableCell>

                {/* Cluster */}
                <TableCell>
                  <Typography className={classes.targetCluster}>
                    Cluster
                  </Typography>
                </TableCell>

                {/* Show Experiments */}
                <TableCell>
                  <Typography className={classes.showExp}>
                    Show Experiments
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Loader />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell data-cy="browseScheduleError" colSpan={7}>
                    <Typography align="center">Unable to fetch data</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredData && filteredData.length ? (
                filteredData
                  .slice(
                    paginationData.pageNo * paginationData.rowsPerPage,
                    paginationData.pageNo * paginationData.rowsPerPage +
                      paginationData.rowsPerPage
                  )
                  .map((data: ScheduleWorkflow) => (
                    <TableRow
                      data-cy="browseScheduleData"
                      key={data.workflow_id}
                    >
                      <TableData data={data} deleteRow={deleteRow} />
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell data-cy="browseScheduleNoData" colSpan={7}>
                    <Typography align="center">No records available</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Section */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData?.length ?? 0}
          rowsPerPage={paginationData.rowsPerPage}
          page={paginationData.pageNo}
          onChangePage={(_, page) =>
            setPaginationData({ ...paginationData, pageNo: page })
          }
          onChangeRowsPerPage={(event) => {
            setPaginationData({
              ...paginationData,
              pageNo: 0,
              rowsPerPage: parseInt(event.target.value, 10),
            });
          }}
        />
      </Paper>
    </div>
  );
};

export default BrowseSchedule;
