import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  TableCell,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { ButtonFilled, LightPills } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../../../../config';
import { InvitationStatus } from '../../../../models/graphql/invite';
import { Member, Role } from '../../../../models/graphql/user';
import { CurrentUserData } from '../../../../models/userData';
import { getToken } from '../../../../utils/auth';
import { getProjectID } from '../../../../utils/getSearchParams';
import { userInitials } from '../../../../utils/userInitials';
import RemoveMemberModal from './removeMemberModal';
import useStyles from './styles';

interface TableDataProps {
  row: Member;
  index: number;
  showModal: () => void;
  fetchData: () => void;
}
const InvitedTableData: React.FC<TableDataProps> = ({
  row,
  showModal,
  fetchData,
}) => {
  const classes = useStyles();
  const projectID = getProjectID();

  const { t } = useTranslation();
  const [role, setRole] = useState<string>(row.Role);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const SendInvite = (userid: string, role: string) => {
    fetch(`${config.auth.url}/send_invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        project_id: projectID,
        user_id: userid,
        role,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data);
        } else {
          fetchData();
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const [memberDetails, setMemberDetails] = useState<CurrentUserData>();
  const [cancelInviteOpen, setCancelInviteOpen] = useState<boolean>(false);

  React.useEffect(() => {
    fetch(`${config.auth.url}/getUser/${row.UserID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setMemberDetails({
          // TODO: Check if all are being used
          name: data.first_name,
          uid: data._id,
          username: data.username,
          role: data.role,
          email: data.email,
        });
      });
  }, []);

  return (
    <>
      <TableCell
        className={`${classes.firstTC} ${
          row.deactivated_at ? classes.dark : ''
        }`}
        component="th"
        scope="row"
      >
        <div className={classes.firstCol}>
          <Avatar
            data-cy="avatar"
            alt="User"
            className={`${
              row.deactivated_at ? classes.darkBg : classes.avatarBackground
            } `}
          >
            {memberDetails?.username && userInitials(memberDetails.username)}
          </Avatar>
          {memberDetails ? memberDetails.username : ''}
        </div>
      </TableCell>
      <TableCell
        className={`${classes.otherTC} ${
          row.deactivated_at ? classes.dark : ''
        }`}
      >
        <div className={classes.dropDown}>
          {role}
          <IconButton
            disabled={row.deactivated_at !== null}
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
                setRole(Role.EDITOR);
                setAnchorEl(null);
              }}
              className={classes.menuOpt}
            >
              <div className={classes.menuDiv}>
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
                setRole(Role.VIEWER);
                setAnchorEl(null);
              }}
              className={classes.menuOpt}
            >
              <div className={classes.menuDiv}>
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
      </TableCell>
      <TableCell
        className={`${classes.otherTC} ${
          row.deactivated_at ? classes.dark : ''
        }`}
      >
        {memberDetails ? memberDetails.email : ''}
      </TableCell>
      <TableCell className={classes.otherTC}>
        <LightPills
          variant={
            row.Invitation === InvitationStatus.PENDING ? 'warning' : 'danger'
          }
          label={row.Invitation}
        />
      </TableCell>

      <TableCell className={classes.buttonTC} key={row.UserID}>
        <div className={classes.lastCell}>
          {row.Invitation !== InvitationStatus.EXITED &&
            row.Invitation !== InvitationStatus.DECLINED && (
              <IconButton onClick={() => setCancelInviteOpen(true)}>
                <img alt="delete" src="./icons/deleteBox.svg" height="45" />
              </IconButton>
            )}
          <Tooltip
            classes={{
              tooltip: classes.tooltip,
            }}
            disableHoverListener={!row.deactivated_at}
            disableFocusListener
            placement="bottom"
            title="User has been deactivated"
          >
            <div data-cy="resendButton">
              <ButtonFilled
                disabled={row.deactivated_at !== null}
                onClick={() => {
                  SendInvite(row.UserID, role);
                }}
              >
                {t('settings.teamingTab.invitation.sentInvitation.resend')}
              </ButtonFilled>
            </div>
          </Tooltip>
        </div>
      </TableCell>
      {cancelInviteOpen && (
        <RemoveMemberModal
          open={cancelInviteOpen}
          handleClose={() => {
            showModal();
            setCancelInviteOpen(false);
          }}
          row={row}
          showModal={() => {
            showModal();
            setCancelInviteOpen(false);
          }}
          isRemove={false}
        />
      )}
    </>
  );
};
export default InvitedTableData;
