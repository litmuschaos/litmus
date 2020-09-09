import {
  Avatar,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  TableCell,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import userAvatar from '../../../../../../utils/user';
import useStyles from './styles';

interface TableDataProps {
  row: any;
  labelId: string;
  handleCheck: (event: React.MouseEvent<unknown>, name: any) => void;
  isItemSelected: boolean;
  sendInvite: (username: string, role: string) => void;
}
const TableData: React.FC<TableDataProps> = ({
  row,
  labelId,
  handleCheck,
  isItemSelected,
  sendInvite,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [role, setRole] = useState<string>('Viewer');
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <TableCell id={labelId}>
        <div className={classes.rowDiv}>
          <div className={classes.firstCol}>
            <Checkbox
              onClick={(event) => handleCheck(event, row)}
              checked={isItemSelected}
              inputProps={{ 'aria-labelledby': labelId }}
            />
            <Avatar
              data-cy="avatar"
              alt="User"
              className={classes.avatarBackground}
              style={{ alignContent: 'right' }}
            >
              {row.name !== null
                ? row.name.split(' ')[1]
                  ? userAvatar(row.name, false)
                  : userAvatar(row.name, true)
                : row.username.split(' ')[1]
                ? userAvatar(row.username, false)
                : userAvatar(row.username, true)}
            </Avatar>
            <div className={classes.detail}>
              <div> {row.username}</div>
              <div>{row.email}</div>
            </div>
          </div>
          <div>
            {role}
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={(event) => {
                setAnchorEl(event.currentTarget);
              }}
              className={classes.optionBtn}
            >
              <img src="./icons/down-arrow.svg" alt="more" />
            </IconButton>
            <Menu
              keepMounted
              open={Boolean(anchorEl)}
              id="long-menu"
              anchorEl={anchorEl}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => {
                  setRole('Editor');
                  setAnchorEl(null);
                  sendInvite(row.username, 'Editor');
                }}
                className={classes.menuOpt}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div>
                    <Typography className={classes.menuHeader}>
                      <strong>Editor</strong>
                    </Typography>
                  </div>
                  <div>
                    <Typography className={classes.menuDesc}>
                      Can make changes in the project
                    </Typography>
                  </div>
                </div>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setRole('Viewer');
                  setAnchorEl(null);
                  sendInvite(row.username, 'Viewer');
                }}
                className={classes.menuOpt}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div>
                    <Typography className={classes.menuHeader}>
                      <strong>Viewer</strong>
                    </Typography>
                  </div>
                  <div>
                    <Typography className={classes.menuDesc}>
                      Can make changes in the project
                    </Typography>
                  </div>
                </div>
              </MenuItem>
            </Menu>
          </div>
        </div>
      </TableCell>
    </>
  );
};
export default TableData;
