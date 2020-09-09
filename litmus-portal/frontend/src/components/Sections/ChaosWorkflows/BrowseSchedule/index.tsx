import { useQuery } from '@apollo/client';
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  MenuItem,
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
import { WORKFLOW_DETAILS } from '../../../../graphql';
import {
  ExecutionData,
  Workflow,
  WorkflowDataVars,
  WorkflowRun,
} from '../../../../models/workflowData';
import { RootState } from '../../../../redux/reducers';
import {
  sortAlphaAsc,
  sortAlphaDesc,
  sortNumAsc,
  sortNumDesc,
} from '../../../../utils/sort';
import Loader from '../../../Loader';
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
  const { data, loading, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    { variables: { projectID: selectedProjectID } }
  );

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

  const filteredData = data?.getWorkFlowRuns
    .filter((dataRow) =>
      dataRow.workflow_name.toLowerCase().includes(filter.search)
    )
    .filter((dataRow) =>
      filter.cluster === 'All'
        ? true
        : dataRow.cluster_name.toLowerCase().includes(filter.cluster)
    )
    .sort((a: WorkflowRun, b: WorkflowRun) => {
      // Sorting based on unique fields
      if (sortData.name.sort) {
        const x = a.workflow_name;
        const y = b.workflow_name;

        return sortData.name.ascending
          ? sortAlphaAsc(x, y)
          : sortAlphaDesc(x, y);
      }
      if (sortData.startDate.sort) {
        const x = parseInt(
          (JSON.parse(a.execution_data) as ExecutionData).startedAt,
          10
        );

        const y = parseInt(
          (JSON.parse(b.execution_data) as ExecutionData).startedAt,
          10
        );

        return sortData.startDate.ascending
          ? sortNumAsc(y, x)
          : sortNumDesc(y, x);
      }
      return 0;
    });
  const deleteRow = () => {
    // Delete Mutation Here
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
              <MenuItem value="Predefined">Cluset pre-defined</MenuItem>
              <MenuItem value="Kubernetes">Kubernetes Cluster</MenuItem>
            </Select>
          </FormControl>
        </div>
      </section>
      <section className="table section">
        {/* Table Header */}
        <TableContainer className={classes.tableMain}>
          <Table stickyHeader aria-label="simple table">
            <TableHead>
              <TableRow className={classes.tableHead}>
                {/* WorkFlow Name */}
                <TableCell className={classes.workflowName}>
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography style={{ paddingLeft: 65, paddingTop: 10 }}>
                      Workflow Name
                    </Typography>
                    <div className={classes.sortDiv}>
                      <IconButton
                        aria-label="sort name ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            name: { sort: true, ascending: true },
                            startDate: { sort: false, ascending: true },
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
                            name: { sort: true, ascending: false },
                            startDate: { sort: false, ascending: false },
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
                    <Typography style={{ paddingTop: 10 }}>
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
                  <TableCell colSpan={7}>
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
                  .map((data) => (
                    <TableRow key={data.workflow_run_id}>
                      <TableData data={data} deleteRow={deleteRow} />
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
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
      </section>
    </div>
  );
};

export default BrowseSchedule;
