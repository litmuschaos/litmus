import { useQuery } from '@apollo/client';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@material-ui/core';
import { Search } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import { GLOBAL_PROJECT_DATA } from '../../../graphql';
import { Pagination } from '../../../models/graphql/workflowListData';
import useStyles from './styles';

const UsageTable = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [paginationData, setPaginationData] = useState<Pagination>({
    page: 0,
    limit: 10,
  });
  const [search, setSearch] = useState<string>('');
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
        SearchProject: search,
      },
    },
  });

  return (
    <div className={classes.table}>
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

      <Paper>
        <TableContainer className={classes.tableMain}>
          <Table stickyHeader aria-label="simple table">
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell className={classes.projectName}>
                  {t('usage.table.project')}
                </TableCell>
                <TableCell align="left">{t('usage.table.owner')}</TableCell>
                <TableCell align="center">{t('usage.table.agents')}</TableCell>
                <TableCell align="center">
                  {t('usage.table.schedules')}
                </TableCell>
                <TableCell align="center">{t('usage.table.wfRuns')}</TableCell>
                <TableCell align="center">{t('usage.table.expRuns')}</TableCell>
                <TableCell align="center">{t('usage.table.team')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <Loader />
              ) : data?.UsageQuery.Projects.length > 0 ? (
                data?.UsageQuery.Projects.map((project: any) => (
                  <TableRow key={project.Name} className={classes.projectData}>
                    <TableCell
                      component="th"
                      scope="row"
                      className={classes.tableDataProjectName}
                    >
                      {project.Name}
                    </TableCell>
                    <TableCell align="left">
                      {project.Members.Owner.Username}
                    </TableCell>
                    <TableCell align="center">{project.Agents.Total}</TableCell>
                    <TableCell align="center">
                      {project.Workflows.Schedules}
                    </TableCell>
                    <TableCell align="center">
                      {project.Workflows.Runs}
                    </TableCell>
                    <TableCell align="center">
                      {project.Workflows.Runs}
                    </TableCell>
                    <TableCell align="center">
                      {project.Members.Total}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography className={classes.center}>
                      <strong>{t('usage.table.noProject')}</strong>
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={data?.UsageQuery.Projects.length ?? 0}
          rowsPerPage={paginationData.limit}
          page={paginationData.page}
          onChangePage={(_, page) =>
            setPaginationData({ ...paginationData, page })
          }
          onChangeRowsPerPage={(event) => {
            setPaginationData({
              ...paginationData,
              page: 0,
              limit: parseInt(event.target.value, 10),
            });
          }}
        />
      </Paper>
    </div>
  );
};

export default UsageTable;
