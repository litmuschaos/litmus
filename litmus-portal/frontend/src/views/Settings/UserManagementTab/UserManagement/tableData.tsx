import { useMutation } from '@apollo/client';
import {
  IconButton,
  Menu,
  MenuItem,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import config from '../../../../config';
import { UPDATE_USER_STATE } from '../../../../graphql';
import {
  UpdateUserStateInput,
  UserData,
  UserRole,
} from '../../../../models/graphql/user';
import { getToken } from '../../../../utils/auth';
import useStyles from './styles';

interface TableDataProps {
  row: UserData;
  handleCurrRow: (currRow: UserData) => void;
  handleEditDiv: () => void;
}
const TableData: React.FC<TableDataProps> = ({
  row,
  handleEditDiv,
  handleCurrRow,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('DD MMM YYYY, HH:mm');
    return resDate;
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Mutation to create a user in litmusDB
  const [UpdateUserState] = useMutation<UpdateUserStateInput>(
    UPDATE_USER_STATE,
    {
      onCompleted: () => window.location.reload(),
    }
  );

  // Submit entered data to /update endpoint
  const handleSubmit = () => {
    fetch(`${config.auth.url}/updatestate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        username: row?.username,
        is_deactivate: !row?.deactivated_at,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data);
        } else {
          UpdateUserState({
            variables: {
              uid: row?._id,
              isDeactivate: !row?.deactivated_at,
            },
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <TableRow data-cy="userTableRow" key={row.name} className={classes.TR}>
      <TableCell className={classes.firstTC} component="th" scope="row">
        <div className={classes.firstCol}>
          <Tooltip
            classes={{
              tooltip: classes.tooltip,
            }}
            disableFocusListener
            placement="bottom"
            title={row.deactivated_at ? 'Deactivated' : 'Active'}
          >
            {!row.deactivated_at ? (
              <svg viewBox="0 0 5 5">
                <circle className={classes.statusActive} />
              </svg>
            ) : (
              <svg viewBox="0 0 5 5">
                <circle className={classes.statusDeactivated} />
              </svg>
            )}
          </Tooltip>

          <Typography>{row.username}</Typography>
        </div>
      </TableCell>

      <TableCell className={classes.otherTC}>
        <Typography>{row.name ? row.name : '--'}</Typography>
      </TableCell>
      <TableCell className={classes.otherTC}>
        <Typography>{row.email ? row.email : '--'}</Typography>
      </TableCell>
      <TableCell className={classes.otherTC}>
        <div className={classes.dateDiv}>
          <img
            className={classes.calIcon}
            src="./icons/calendarIcon.svg"
            alt="calendar"
          />
          <Typography>{formatDate(row.created_at)}</Typography>
        </div>
      </TableCell>
      <TableCell className={classes.lastTC} key={row.username}>
        {row.username !== UserRole.admin && (
          <>
            <IconButton
              data-cy="editUser"
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={(event) => {
                handleCurrRow(row);
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
                data-cy="editProfile"
                onClick={() => {
                  handleEditDiv();
                  setAnchorEl(null);
                }}
              >
                <IconButton disabled>
                  <img alt="delete" src="./icons/Edit.svg" />
                </IconButton>
                {t('settings.userManagementTab.editProfile')}
              </MenuItem>

              <MenuItem
                value="delete"
                onClick={() => {
                  handleSubmit();
                }}
              >
                <IconButton disabled>
                  <img
                    alt="update state"
                    src={
                      row.deactivated_at
                        ? './icons/UserEnable.svg'
                        : './icons/UserDisable.svg'
                    }
                  />
                </IconButton>
                <Typography>
                  {row.deactivated_at ? 'Activate User' : 'Deactivate User'}
                </Typography>
              </MenuItem>
            </Menu>
          </>
        )}
      </TableCell>
    </TableRow>
  );
};
export default TableData;
