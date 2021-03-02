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
import { useTranslation } from 'react-i18next';
import { UserInvite } from '../../../../../models/graphql/invite';
import userAvatar from '../../../../../utils/user';
import useStyles from './styles';

interface TableDataProps {
  row: UserInvite;
  labelId: string;
  handleCheck: (event: React.MouseEvent<unknown>, row: UserInvite) => void;
  isItemSelected: boolean;
  sendInvite: (user_uid: string, role: string) => void;
}
const TableData: React.FC<TableDataProps> = ({
  row,
  labelId,
  handleCheck,
  isItemSelected,
  sendInvite,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [role, setRole] = useState<string>('Viewer');
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <TableCell id={labelId} className={classes.tableCell}>
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
                  ? userAvatar(row.name)
                  : userAvatar(row.name)
                : row.username.split(' ')[1]
                ? userAvatar(row.username)
                : userAvatar(row.username)}
            </Avatar>
            <div className={classes.detail}>
              <div> {row.username}</div>
              <div className={classes.email}>{row.email}</div>
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
                  sendInvite(row.id, 'Editor');
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
                      <strong>
                        {t(
                          'settings.teamingTab.invitation.sentInvitation.menuItem.editorRole.label'
                        )}
                      </strong>
                    </Typography>
                  </div>
                  <div>
                    <Typography className={classes.menuDesc}>
                      {t(
                        'settings.teamingTab.invitation.sentInvitation.menuItem.editorRole.body'
                      )}
                    </Typography>
                  </div>
                </div>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setRole('Viewer');
                  setAnchorEl(null);
                  sendInvite(row.id, 'Viewer');
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
                      <strong>
                        {t(
                          'settings.teamingTab.invitation.sentInvitation.menuItem.viewerRole.label'
                        )}
                      </strong>
                    </Typography>
                  </div>
                  <div>
                    <Typography className={classes.menuDesc}>
                      {t(
                        'settings.teamingTab.invitation.sentInvitation.menuItem.viewerRole.body'
                      )}
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
