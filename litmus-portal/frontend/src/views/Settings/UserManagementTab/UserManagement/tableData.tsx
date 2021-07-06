import { useMutation } from '@apollo/client';
import {
  IconButton,
  Menu,
  MenuItem,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { LightPills } from 'litmus-ui';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import config from '../../../../config';
import { UPDATE_USER_STATE } from '../../../../graphql';
import {
  UpdateUserStateInput,
  UserData,
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

  const formatDate = (date: string) => {
    const day = moment(date).format('Do MMM, YYYY LT');
    return day;
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [disableUser, setDisableUser] = React.useState<boolean>(false);

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
    fetch(`${config.auth.url}/updatestatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        username: row?.username,
        is_disable: row?.removed_at ? false : true,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          // isError.current = true;
        } else {
          UpdateUserState({
            variables: {
              username: row?.username,
              isDisable: row?.removed_at ? false : true,
            },
          });
        }
      })
      .catch((err) => {
        // isError.current = true;
        console.error(err);
      });
  };

  return (
    <TableRow data-cy="userTableRow" key={row.name} className={classes.TR}>
      <TableCell className={classes.firstTC} component="th" scope="row">
        <div className={classes.firstCol}>
          {row.logged_in ? (
            <LightPills
              variant="success"
              label={t('settings.userManagementTab.label.options.signedIn')}
            />
          ) : (
            <LightPills
              variant="danger"
              label={t('settings.userManagementTab.label.options.notSignedIn')}
            />
          )}
          {row.name}
        </div>
      </TableCell>

      <TableCell className={classes.otherTC}>{row.username}</TableCell>
      <TableCell className={classes.otherTC}>{row.email}</TableCell>
      <TableCell className={classes.otherTC}>
        <div className={classes.dateDiv}>
          <img
            className={classes.calIcon}
            src="./icons/calendarIcon.svg"
            alt="calendar"
          />
          {formatDate(row.created_at)}
        </div>
      </TableCell>
      <TableCell className={classes.lastTC} key={row.username}>
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
              if (row.removed_at) {
                setDisableUser(false);
              } else {
                setDisableUser(true);
              }
              handleSubmit();
            }}
          >
            <IconButton>
              <img alt="delete" src="./icons/bin.svg" />
            </IconButton>
            <Typography>
              {row.removed_at ? 'Enable User' : 'Disable User'}
            </Typography>
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
};
export default TableData;
