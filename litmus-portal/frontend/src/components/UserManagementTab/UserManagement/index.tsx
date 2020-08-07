import {
  createStyles,
  FormControl,
  IconButton,
  InputAdornment,
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
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';
import bin from '../../../assets/icons/bin.svg';
import user from '../../../assets/icons/user.svg';
import ButtonFilled from '../../Button/ButtonFilled';
import CreateUser from '../CreateUser';
import useStyles from './styles';

// StyledTableCell used to create custom table cell
const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.common.black,
    },
    body: {
      fontSize: 14,
    },
  })
)(TableCell);

// data for each user name
interface User {
  status: boolean;
  name: string;
}

// data for each user
interface Row {
  Name: User;
  username: string;
  email: string;
  userCreated: string;
}

// UserManagement displays users table
const UserManagement: React.FC = () => {
  const classes = useStyles();
  const [showDiv, setShowDiv] = React.useState<boolean>(false);

  // dummy data for now
  let selRow = [];
  selRow = [
    {
      Name: { status: false, name: 'Denver' },
      username: 'abcd',
      email: 'abc@gmail.com',
      userCreated: '2019-01-16',
    },
    {
      Name: { status: true, name: 'Richard' },
      username: 'Baran',
      email: 'abc@gmail.com',
      userCreated: '2019-01-16',
    },
    {
      Name: { status: true, name: 'Tommy' },
      username: 'abc',
      email: 'abc@gmail.com',
      userCreated: '2019-01-16',
    },
  ];

  // for each row in the table
  const [rows, setRows] = React.useState<Row[]>(selRow);

  // for filtered row
  const [selectRow, setSelectRows] = React.useState<Row[]>(selRow);

  // for displaying user in signed in/out or all kinds of users
  const [state, setState] = React.useState('All');

  // for checking signed in status
  function checkStatusActive(ele: Row) {
    return ele.Name.status === true;
  }

  // for checking signed out status
  function checkStatusPassive(ele: Row) {
    return ele.Name.status === false;
  }
  return (
    <div>
      {showDiv ? (
        <div>
          {/* for create new user div */}
          <CreateUser handleDiv={() => setShowDiv(false)} />
        </div>
      ) : (
        // for displaying user table
        <div className={classes.UMDiv}>
          <Typography className={classes.headerText}>
            <strong>User Management</strong>
          </Typography>
          <div className={classes.members}>
            <img src={user} alt="members" />
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
                      x.Name.name.toLowerCase().includes(e.target.value)
                    )
                  );
                }}
                InputProps={{
                  style: {
                    width: '15.75rem',
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
                    label="status"
                    disableUnderline
                    inputProps={{
                      name: 'status',
                      id: 'outlined-age-native-simple',
                    }}
                  >
                    <option
                      className={classes.opt}
                      aria-label="None"
                      value="all"
                    />
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
              <Table aria-label="custom pagination table">
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
                  {rows.map((row, ind) => (
                    <TableRow key={row.Name.name} className={classes.TR}>
                      <TableCell
                        className={classes.firstTC}
                        component="th"
                        scope="row"
                      >
                        <div className={classes.firstCol}>
                          {row.Name.status ? (
                            <div className={classes.Signed}>Signed in</div>
                          ) : (
                            <div className={classes.NotSigned}>Not Signed</div>
                          )}

                          {row.Name.name}
                        </div>
                      </TableCell>
                      <TableCell className={classes.otherTC}>
                        {row.username}
                      </TableCell>
                      <TableCell className={classes.otherTC}>
                        {row.email}
                      </TableCell>
                      <TableCell className={classes.otherTC}>
                        {row.userCreated}
                      </TableCell>
                      <TableCell className={classes.otherTC}>
                        <IconButton
                          onClick={() => {
                            // for deleting a row
                            setRows(
                              rows.filter(function (item, i) {
                                return i !== ind;
                              })
                            );
                            setSelectRows(
                              selectRow.filter(function (item) {
                                return row.username !== item.username;
                              })
                            );
                          }}
                        >
                          <img alt="delete" src={bin} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserManagement;
