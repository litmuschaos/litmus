/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from '@apollo/client';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { Search } from 'litmus-ui';
import React, { useState } from 'react';
import Loader from '../../../components/Loader';
import { GLOBAL_PROJECT_DATA } from '../../../graphql';
import { Pagination } from '../../../models/graphql/workflowListData';
import useStyles from './styles';

const UsageTable = () => {
  const classes = useStyles();
  const [paginationData, setPaginationData] = useState<Pagination>({
    page: 0,
    limit: 10,
  });
  const [search, setSearch] = useState<string | null>(null);
  const { data, loading } = useQuery(GLOBAL_PROJECT_DATA, {
    variables: {
      query: {
        DateRange: {
          start_date: Math.trunc(
            new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ).getTime() / 1000
          ).toString(),
          end_date: Math.trunc(new Date().getTime() / 1000).toString(),
        },
        Pagination: {
          page: paginationData.page,
          limit: paginationData.limit,
        },
      },
    },
  });

  // Filter the users based on search results
  const filteredData = data?.UsageQuery.Projects.filter((project: any) => {
    if (!loading && search === null) return project;
    if (
      !loading &&
      search !== null &&
      project.Name.toLowerCase().includes(search.toLowerCase())
    )
      return project;
    return null;
  });

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className={classes.headerSection}>
            {/* Search Bar */}
            <Search
              className={classes.search}
              data-cy="projectSearch"
              id="input-with-icon-textfield"
              placeholder="Search Projects"
              value={search}
              onChange={(event: any) => setSearch(event.target.value)}
            />
          </div>

          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Projects</TableCell>
                  <TableCell align="right">Project Owner</TableCell>
                  <TableCell align="right">Agents</TableCell>
                  <TableCell align="right">Workflow Schedules</TableCell>
                  <TableCell align="right">Workflow runs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData?.length > 0 ? (
                  filteredData.map((project: any) => (
                    <TableRow key={project.Name}>
                      <TableCell component="th" scope="row">
                        {project.Name}
                      </TableCell>
                      <TableCell align="right">
                        {project.Members.Owner.Name}
                      </TableCell>
                      <TableCell align="right">
                        {project.Agents.Total}
                      </TableCell>
                      <TableCell align="right">
                        {project.Workflows.Schedules}
                      </TableCell>
                      <TableCell align="right">
                        {project.Workflows.Runs}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <div className={classes.noProjects}>
                    <TableRow>
                      <Typography className={classes.center}>
                        <strong>No Projects Found</strong>
                      </Typography>
                    </TableRow>
                  </div>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default UsageTable;
