/* eslint-disable camelcase */
import {
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
  TableRow,
  TextField,
  Theme,
  Toolbar,
  Typography,
  withStyles,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SearchIcon from '@material-ui/icons/Search';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/reducers';
import ButtonFilled from '../../../Button/ButtonFilled';
import CreateUser from '../CreateUser';
import EditUser from '../EditUser';
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

interface UserData {
  _id: string; // eslint-disable-line no-eval
  username: string;
  email: string;
  name: string;
  logged_in: boolean; // eslint-disable-line no-eval
  created_at: string; // eslint-disable-line no-eval
  updated_at: string; // eslint-disable-line no-eval
  removed_at: string; // eslint-disable-line no-eval
  state: string;
}
// UserManagement displays users table
const UserManagement: React.FC = () => {
  const classes = useStyles();
  const [showDiv, setShowDiv] = React.useState<boolean>(false);

  const { userData } = useSelector((state: RootState) => state);
  // for response data
  const [rows, setRows] = useState<UserData[]>([]);

  // for filtered row
  const [selectRow, setSelectRows] = React.useState<UserData[]>(rows);

  useEffect(() => {
    fetch('http://3.9.117.22:30375/users', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userData.token}`,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((res) => {
        // console.log(res);
        setRows(res);
        setSelectRows(res);
      })

      .catch((err) => {
        console.error(err);
      });
  }, [1]);

  // for displaying user in signed in/out or all kinds of users
  const [state, setState] = React.useState<string>('All');

  const [editDiv, setEditDiv] = React.useState<boolean>(false);

  // for checking signed in status
  function checkStatusActive(ele: UserData) {
    return ele.logged_in === true;
  }

  // for checking signed out status
  function checkStatusPassive(ele: UserData) {
    return ele.logged_in === false;
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [ind, setInd] = React.useState<number>(-1);

  const [currRow, setCurrRow] = React.useState<UserData>(selectRow[0]);
  return (
    <div>
      {showDiv ? (
        <div>
          {/* for create new user div */}
          <CreateUser handleDiv={() => setShowDiv(false)} />
        </div>
      ) : (
        <div>
          {editDiv ? (
            <div>
              <EditUser
                handleDiv={() => setEditDiv(false)}
                email={currRow.email}
                fullName={currRow.name}
                userName={currRow.username}
              />
            </div>
          ) : (
            // for displaying user table
            <div className={classes.UMDiv}>
              <Typography className={classes.headerText}>
                <strong>User Management</strong>
              </Typography>
              <div className={classes.members}>
                <img src="./icons/user.svg" alt="members" />
                <Typography className={classes.memTypo}>
                  Members (<span>10</span>)
                </Typography>
              </div>
              <Typography className={classes.descText}>
                Create users , manage them and reset their password and username
                when required
              </Typography>
              <div>
                <Toolbar className={classes.toolbar}>
                  {/* Search user */}
                  <TextField
                    id="input-with-icon-textfield"
                    placeholder="Search..."
                    onChange={(e) => {
                      setRows(
                        selectRow.filter((x) =>
                          x.name.toLowerCase().includes(e.target.value)
                        )
                      );
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
                    <Typography className={classes.userStat}>
                      User Status
                    </Typography>

                    <FormControl className={classes.filterMenu}>
                      <Select
                        native
                        placeholder="User Status"
                        value={state}
                        /* filters on the basis of users' current state */
                        onChange={(e) => {
                          setState(e.target.value as string);
                          if (e.target.value === 'signedin') {
                            setRows(selectRow.filter(checkStatusActive));
                          } else if (e.target.value === 'signedout') {
                            setRows(selectRow.filter(checkStatusPassive));
                          } else if (e.target.value === 'all') {
                            setRows(selectRow);
                          }
                        }}
                        label="User Status"
                        disableUnderline
                        inputProps={{
                          name: 'User Status',
                          id: 'outlined-age-native-simple',
                        }}
                      >
                        <option value="all">All</option>
                        <option value="signedout">Not signed</option>
                        <option value="signedin">Signed in</option>
                      </Select>
                    </FormControl>
                    <div className={classes.buttonDiv}>
                      <ButtonFilled
                        handleClick={() => {
                          setShowDiv(true);
                        }}
                        data-cy="gotItButton"
                        isPrimary
                      >
                        <div className={classes.buttonTxt}>Create new user</div>
                      </ButtonFilled>
                    </div>
                  </div>
                </Toolbar>
                {/* user table */}
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
                        <StyledTableCell>Username</StyledTableCell>
                        <StyledTableCell>Email</StyledTableCell>
                        <StyledTableCell>User Created</StyledTableCell>
                        <StyledTableCell />
                        <TableHead />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows ? (
                        rows.map((row, index) => (
                          <TableRow key={row.name} className={classes.TR}>
                            <TableCell
                              className={classes.firstTC}
                              component="th"
                              scope="row"
                            >
                              <div className={classes.firstCol}>
                                {row.logged_in ? (
                                  <div className={classes.Signed}>
                                    Signed in
                                  </div>
                                ) : (
                                  <div className={classes.NotSigned}>
                                    Not Signed
                                  </div>
                                )}

                                {row.name}
                              </div>
                            </TableCell>
                            <TableCell className={classes.otherTC}>
                              {row.username}
                            </TableCell>
                            <TableCell className={classes.otherTC}>
                              {row.email}
                            </TableCell>
                            <TableCell className={classes.otherTC}>
                              {row.created_at}
                            </TableCell>

                            <TableCell
                              className={classes.lastTC}
                              key={row.username}
                            >
                              <IconButton
                                aria-label="more"
                                aria-controls="long-menu"
                                aria-haspopup="true"
                                onClick={(event) => {
                                  setInd(index);
                                  setCurrRow(row);
                                  setAnchorEl(event.currentTarget);
                                }}
                                className={classes.optionBtn}
                              >
                                <MoreVertIcon />
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
                                    setEditDiv(true);
                                    setAnchorEl(null);
                                  }}
                                >
                                  <IconButton disabled>
                                    <img alt="delete" src="./icons/Edit.svg" />
                                  </IconButton>
                                  Edit Profile
                                </MenuItem>

                                <MenuItem
                                  value="delete"
                                  disabled
                                  onClick={() => {
                                    // for deleting a row
                                    setRows(
                                      rows.filter(function (item, i) {
                                        return i !== ind;
                                      })
                                    );

                                    setSelectRows(
                                      selectRow.filter(function (item) {
                                        return (
                                          currRow.username !== item.username
                                        );
                                      })
                                    );

                                    setAnchorEl(null);
                                  }}
                                >
                                  <IconButton disabled>
                                    <img alt="delete" src="./icons/bin.svg" />
                                  </IconButton>
                                  <Typography>Delete User</Typography>
                                </MenuItem>
                              </Menu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <></>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default UserManagement;
