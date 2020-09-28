import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import moment from 'moment';
import React, { useState } from 'react';
import HeaderSection from './HeaderSection';
import useStyles from './styles';

interface FilterOptions {
  search: string;
  status: string;
  cluster: string;
}

interface SortData {
  lastRun: { sort: boolean; ascending: boolean };
  name: { sort: boolean; ascending: boolean };
  noOfSteps: { sort: boolean; ascending: boolean };
}

interface DateData {
  dateValue: string;
  fromDate: string;
  toDate: string;
}

const BrowseCluster = () => {
  const classes = useStyles();
  // States for filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'All',
    cluster: 'All',
  });

  const [popAnchorEl, setPopAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const isOpen = Boolean(popAnchorEl);

  const [open, setOpen] = React.useState<boolean>(false);

  const handlePopOverClose = () => {
    setPopAnchorEl(null);
    setOpen(false);
  };
  const handlePopOverClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopAnchorEl(event.currentTarget);
    setOpen(true);
  };

  // State for start date and end date
  const [dateRange, setDateRange] = React.useState<DateData>({
    dateValue: 'Select a period',
    fromDate: new Date(0).toString(),
    toDate: new Date(new Date().setHours(23, 59, 59)).toString(),
  });

  // Functions passed as props in the headerSeaction
  const changeSearch = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setFilters({ ...filters, search: event.target.value as string });
  };

  const changeStatus = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    setFilters({ ...filters, status: event.target.value as string });
  };

  const changeCluster = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    setFilters({ ...filters, cluster: event.target.value as string });
  };

  // Function to set the date range for filtering
  const dateChange = (selectFromDate: string, selectToDate: string) => {
    setDateRange({
      dateValue: `${moment(selectFromDate)
        .format('DD.MM.YYYY')
        .toString()}-${moment(selectToDate).format('DD.MM.YYYY').toString()}`,
      fromDate: new Date(new Date(selectFromDate).setHours(0, 0, 0)).toString(),
      toDate: new Date(new Date(selectToDate).setHours(23, 59, 59)).toString(),
    });
  };

  return (
    <div>
      <section className="Heading section">
        {/* Header Section */}
        <HeaderSection
          searchValue={filters.search}
          changeSearch={changeSearch}
          statusValue={filters.status}
          changeStatus={changeStatus}
          clusterValue={filters.cluster}
          changeCluster={changeCluster}
          popOverClick={handlePopOverClick}
          popOverClose={handlePopOverClose}
          isOpen={isOpen}
          popAnchorEl={popAnchorEl}
          isDateOpen={open}
          displayDate={dateRange.dateValue}
          selectDate={dateChange}
        />
      </section>
      <section className="table section">
        <TableContainer className={classes.tableMain}>
          <Table stickyHeader aria-label="simple table">
            <TableHead>
              <TableRow>
                {/* Status */}
                <TableCell className={classes.headerStatus}>
                  <div className={classes.tableCell}>
                    <Typography>Status</Typography>
                    <div className={classes.sortDiv}>
                      <img
                        src="/icons/arrow_downward.svg"
                        alt="ConnectTarget icon"
                      />
                    </div>
                  </div>
                </TableCell>
                {/* Workflow Name */}
                <TableCell className={classes.workflowName}>
                  <div className={classes.tableCell}>
                    <Typography>Target Cluster</Typography>
                    <div className={classes.sortDiv}>
                      <img
                        src="/icons/arrow_downward.svg"
                        alt="ConnectTarget icon"
                      />
                    </div>
                  </div>
                </TableCell>

                {/* Target Cluster */}
                <TableCell>
                  <Typography className={classes.targetCluster}>
                    Connection Data
                  </Typography>
                </TableCell>

                {/* Reliability */}
                <TableCell className={classes.headData}>
                  # of workflows
                </TableCell>

                {/* No of Experiments */}
                <TableCell className={classes.headData}>
                  <div className={classes.tableCell}>
                    <Typography># of schedules</Typography>
                  </div>
                </TableCell>

                {/* Last Run */}
                <TableCell className={classes.headData}>
                  <div className={classes.tableCell}>
                    <Typography>Last Run</Typography>
                  </div>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>

            {/* Body */}
            <TableBody>
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography align="center">No records available</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </div>
  );
};

export default BrowseCluster;
