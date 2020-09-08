import { useQuery } from '@apollo/client/react/hooks';
import {
  Avatar,
  createStyles,
  FormControl,
  IconButton,
  InputAdornment,
  Menu,
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
  TextField,
  Theme,
  Toolbar,
  Typography,
  withStyles,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { GET_USER } from '../../../../graphql';
import { Member, Project } from '../../../../models/project';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
} from '../../../../models/user';
import { RootState } from '../../../../redux/reducers';
import userAvatar from '../../../../utils/user';
import DelUser from '../UserManagementTab/EditUser/DelUser';
import Invitation from './Invitation';
import InviteNew from './InviteNew';
import useStyles from './styles';

// StyledTableCell used to create custom table cell
const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.common.black,
    },
    body: {
      fontSize: '0.875rem',
    },
  })
)(TableCell);

interface FilterOptions {
  search: string;
  role: string;
}

interface PaginationData {
  pageNo: number;
  rowsPerPage: number;
}
// TeammingTab displays team member table
const TeammingTab: React.FC = () => {
  const classes = useStyles();
  const { userData } = useSelector((state: RootState) => state);

  // for response data
  const [rows, setRows] = useState<Member[]>([]);

  // query for getting all the data for the logged in user
  const { data } = useQuery<CurrentUserDetails, CurrentUserDedtailsVars>(
    GET_USER,
    {
      variables: { username: userData.username },
    }
  );

  // State for pagination
  const [paginationData, setPaginationData] = useState<PaginationData>({
    pageNo: 0,
    rowsPerPage: 5,
  });

  // States for filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    role: 'all',
  });

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // logic for displaying the team members of the user
  let memberList: Member[] = [];
  let users: Member[] = [];
  useEffect(() => {
    if (data?.getUser.username === userData.username) {
      const projectList: Project[] = data?.getUser.projects;

      projectList.forEach((project) => {
        if (project.id === userData.selectedProjectID) {
          memberList = project.members;
        }
      });

      memberList.forEach((member) => {
        if (
          member.invitation === 'Accepted' &&
          member.user_name !== userData.username
        ) {
          users = users.concat(rows, member);
        }

        setRows(users);
      });
    }
  }, [data]);

  // for data filtering based on user role
  const filteredData =
    rows &&
    rows
      .filter((dataRow) => dataRow?.name.toLowerCase().includes(filters.search))
      .filter((dataRow) => {
        if (filters.role === 'all') return true;
        if (filters.role === 'Editor') return dataRow.role === 'Editor';
        if (filters.role === 'Viewer') return dataRow.role === 'Viewer';
        return dataRow.role === 'Owner';
      });

  // for closing the menu option
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Function to display date in format Do MMM,YYYY Hr:MM AM/PM
  const formatDate = (date: string) => {
    const day = moment(date).format('Do MMM,YYYY LT');
    return day;
  };

  return (
    <div>
      <div className={classes.UMDiv}>
        <div className={classes.members}>
          <img src="./icons/user.svg" alt="members" />
          <Typography className={classes.memTypo}>
            Members (<span>{rows ? rows.length : 0}</span>)
          </Typography>
        </div>
        <Typography className={classes.descText}>
          Manage your team, invite a member to your project or change the role
          of members in the teamed
        </Typography>
        <div>
          <Toolbar className={classes.toolbar}>
            {/* Search user */}
            <div className={classes.toolbarDiv}>
              <div className={classes.toolbarFirstCol}>
                <TextField
                  id="input-with-icon-textfield"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      search: e.target.value,
                    });
                    setPaginationData({ ...paginationData, pageNo: 0 });
                  }}
                  InputProps={{
                    style: {
                      maxWidth: '15.75rem',
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                {/* filter menu */}
                <div className={classes.filter}>
                  <Typography className={classes.userRole}>Role</Typography>

                  <FormControl className={classes.filterMenu}>
                    <Select
                      native
                      placeholder="User Status"
                      value={filters.role}
                      /* filters on the basis of users' current state */
                      onChange={(e) => {
                        setFilters({
                          ...filters,
                          role: e.target.value as string,
                        });
                        setPaginationData({ ...paginationData, pageNo: 0 });
                      }}
                      label="Role"
                      disableUnderline
                      inputProps={{
                        name: 'Role',
                        id: 'outlined-age-native-simple',
                      }}
                    >
                      <option value="all" className={classes.filterOpt}>
                        All
                      </option>
                      <option value="Editor" className={classes.filterOpt}>
                        Editor
                      </option>
                      <option value="Viewer" className={classes.filterOpt}>
                        Viewer
                      </option>
                      <option value="Owner" className={classes.filterOpt}>
                        Owner
                      </option>
                    </Select>
                  </FormControl>
                </div>
              </div>
              <div className={classes.buttonDiv}>
                <Invitation />
                <InviteNew />
              </div>
            </div>
          </Toolbar>
          {/* user table */}
          <Paper className={classes.root}>
            <TableContainer
              className={classes.table}
              elevation={0}
              component={Paper}
            >
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow className={classes.TR}>
                    <StyledTableCell className={classes.styledTC}>
                      Name
                    </StyledTableCell>
                    <StyledTableCell>Role</StyledTableCell>
                    <StyledTableCell>Email</StyledTableCell>
                    <StyledTableCell>Joined to team</StyledTableCell>
                    <StyledTableCell />
                    <TableHead />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData && filteredData.length > 0 ? (
                    filteredData
                      .slice(
                        paginationData.pageNo * paginationData.rowsPerPage,
                        paginationData.pageNo * paginationData.rowsPerPage +
                          paginationData.rowsPerPage
                      )
                      .map((row, index) => (
                        <TableRow key={row.name} className={classes.TR}>
                          <TableCell
                            className={classes.firstTC}
                            component="th"
                            scope="row"
                          >
                            <div className={classes.firstCol}>
                              <Avatar
                                data-cy="avatar"
                                alt="User"
                                className={classes.avatarBackground}
                              >
                                {row?.name.split(' ')[1]
                                  ? userAvatar(row.name, false)
                                  : userAvatar(row.name, true)}
                              </Avatar>
                              {row.name}
                            </div>
                          </TableCell>
                          <TableCell className={classes.otherTC}>
                            {row.role}
                            {row.role === 'editor' || row.role === 'viewer' ? (
                              <>
                                <IconButton
                                  disabled
                                  aria-label="more"
                                  aria-controls="long-menu"
                                  aria-haspopup="true"
                                  onClick={(event) => {
                                    setAnchorEl(event.currentTarget);
                                  }}
                                  className={classes.optionBtn}
                                >
                                  <img
                                    src="./icons/right-arrow.svg"
                                    alt="more"
                                  />
                                </IconButton>
                                <Menu
                                  keepMounted
                                  open={Boolean(anchorEl)}
                                  id="long-menu"
                                  anchorEl={anchorEl}
                                  onClose={handleClose}
                                >
                                  <MenuItem
                                    value={index}
                                    onClick={() => {
                                      setAnchorEl(null);
                                    }}
                                    className={classes.menuOpt}
                                  >
                                    <div className={classes.menuDiv}>
                                      <div>
                                        <Typography
                                          className={classes.menuHeader}
                                        >
                                          <strong>Editor</strong>
                                        </Typography>
                                      </div>
                                      <div>
                                        <Typography
                                          className={classes.menuDesc}
                                        >
                                          Can make changes in the project
                                        </Typography>
                                      </div>
                                    </div>
                                  </MenuItem>
                                  <MenuItem
                                    value={index}
                                    onClick={() => {
                                      setAnchorEl(null);
                                    }}
                                    className={classes.menuOpt}
                                  >
                                    <div className={classes.menuDiv}>
                                      <div>
                                        <Typography
                                          className={classes.menuHeader}
                                        >
                                          <strong>Viewer</strong>
                                        </Typography>
                                      </div>
                                      <div>
                                        <Typography
                                          className={classes.menuDesc}
                                        >
                                          Can make changes in the project
                                        </Typography>
                                      </div>
                                    </div>
                                  </MenuItem>
                                </Menu>
                              </>
                            ) : (
                              <></>
                            )}
                          </TableCell>
                          <TableCell className={classes.otherTC}>
                            {row.email}
                          </TableCell>
                          <TableCell className={classes.otherTC}>
                            <div className={classes.dateDiv}>
                              <img
                                className={classes.calIcon}
                                src="./icons/calendarIcon.svg"
                                alt="calendar"
                              />
                              {formatDate(row.joined_at)}
                            </div>
                          </TableCell>

                          <TableCell
                            className={classes.otherTC}
                            key={row.user_name}
                          >
                            <DelUser
                              handleTable={() => {}}
                              tableDelete={false}
                              teammingDel
                              disabled
                            />
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography align="center">
                          No users available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredData?.length ?? 0}
              rowsPerPage={paginationData.rowsPerPage}
              page={paginationData.pageNo}
              onChangePage={(_, page) =>
                setPaginationData({
                  ...paginationData,
                  pageNo: page,
                })
              }
              onChangeRowsPerPage={(event) =>
                setPaginationData({
                  ...paginationData,
                  pageNo: 0,
                  rowsPerPage: parseInt(event.target.value, 10),
                })
              }
            />
          </Paper>
        </div>
      </div>
    </div>
  );
};
export default TeammingTab;
