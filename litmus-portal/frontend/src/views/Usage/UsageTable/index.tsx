/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { Pagination } from '../../../models/graphql/workflowListData';
import { GLOBAL_PROJECT_DATA } from '../../../graphql';
import useStyles from './styles';
import Loader from '../../../components/Loader';

const UsageTable = () => {
  const classes = useStyles();
  const [paginationData, setPaginationData] = useState<Pagination>({
    page: 0,
    limit: 10,
  });
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
  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
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
              {data.UsageQuery.Projects.map((project: any) => (
                <TableRow key={project.Name}>
                  <TableCell component="th" scope="row">
                    {project.Name}
                  </TableCell>
                  <TableCell align="right">
                    {project.Members.Owner.Name}
                  </TableCell>
                  <TableCell align="right">{project.Agents.Total}</TableCell>
                  <TableCell align="right">
                    {project.Workflows.Schedules}
                  </TableCell>
                  <TableCell align="right">{project.Workflows.Runs}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default UsageTable;
