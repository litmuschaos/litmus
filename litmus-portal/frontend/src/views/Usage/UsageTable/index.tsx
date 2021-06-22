import { useQuery } from '@apollo/client';
import {
  IconButton,
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
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Loader from '../../../components/Loader';
import { GLOBAL_PROJECT_DATA } from '../../../graphql';
import { Pagination } from '../../../models/graphql/workflowListData';
import useStyles from './styles';

interface SortInput {
  Field:
    | 'Project'
    | 'Owner'
    | 'Agents'
    | 'Schedules'
    | 'WorkflowRuns'
    | 'ExperimentRuns'
    | 'TeamMembers';
  Descending?: boolean;
}

const UsageTable = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [paginationData, setPaginationData] = useState<Pagination>({
    page: 0,
    limit: 10,
  });
  const [sortData, setSortData] = useState<SortInput>({
    Field: 'Project',
    Descending: false,
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
        Sort: sortData,
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
                {/* Projects */}
                <TableCell className={classes.projectName}>
                  <div style={{ display: 'flex' }}>
                    <Typography className={classes.tableHeadName}>
                      {t('usage.table.project')}
                    </Typography>
                    <div className={classes.sortIconDiv}>
                      <IconButton
                        aria-label="sort project ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Field: 'Project',
                            Descending: false,
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort project descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Field: 'Project',
                            Descending: true,
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* Owners */}
                <TableCell align="left">
                  <div style={{ display: 'flex' }}>
                    <Typography className={classes.tableHeadName}>
                      {t('usage.table.owner')}
                    </Typography>
                    <div className={classes.sortIconDiv}>
                      <IconButton
                        aria-label="sort owner ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Field: 'Owner',
                            Descending: false,
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort owner descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Field: 'Owner',
                            Descending: true,
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* Agents */}
                <TableCell align="center">
                  <div style={{ display: 'flex' }}>
                    <Typography className={classes.tableHeadName}>
                      {t('usage.table.agents')}
                    </Typography>
                    <div className={classes.sortIconDiv}>
                      <IconButton
                        aria-label="sort agent ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Field: 'Agents',
                            Descending: false,
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort agents descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Field: 'Agents',
                            Descending: true,
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* Schedules */}
                <TableCell align="center">
                  <div style={{ display: 'flex' }}>
                    <Typography className={classes.tableHeadName}>
                      {t('usage.table.schedules')}
                    </Typography>
                    <div className={classes.sortIconDiv}>
                      <IconButton
                        aria-label="sort schedules ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Field: 'Schedules',
                            Descending: false,
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort schedules descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Field: 'Schedules',
                            Descending: true,
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* WorkflowRuns */}
                <TableCell align="center">
                  <div style={{ display: 'flex' }}>
                    <Typography className={classes.tableHeadName}>
                      {t('usage.table.wfRuns')}
                    </Typography>
                    <div className={classes.sortIconDiv}>
                      <IconButton
                        aria-label="sort WorkflowRuns ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Field: 'WorkflowRuns',
                            Descending: false,
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort WorkflowRuns descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Field: 'WorkflowRuns',
                            Descending: true,
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* ExperimentRuns */}
                <TableCell align="center">
                  <div style={{ display: 'flex' }}>
                    <Typography className={classes.tableHeadName}>
                      {t('usage.table.expRuns')}
                    </Typography>
                    <div className={classes.sortIconDiv}>
                      <IconButton
                        aria-label="sort ExperimentRuns ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Field: 'ExperimentRuns',
                            Descending: false,
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort ExperimentRuns descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Field: 'ExperimentRuns',
                            Descending: true,
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* Team Mambers */}
                <TableCell align="center">
                  <div style={{ display: 'flex' }}>
                    <Typography className={classes.tableHeadName}>
                      {t('usage.table.team')}
                    </Typography>
                    <div className={classes.sortIconDiv}>
                      <IconButton
                        aria-label="sort TeamMembers ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Field: 'TeamMembers',
                            Descending: false,
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort TeamMembers descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            Field: 'TeamMembers',
                            Descending: true,
                          })
                        }
                        className={classes.imgSize}
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>
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
