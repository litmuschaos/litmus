import { useMutation, useQuery } from '@apollo/client';
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
import {
  ALL_USERS,
  GET_PROJECT,
  GET_USER,
  SEND_INVITE,
} from '../../../../graphql';
import {
  InvitationStatus,
  MemberInviteNew,
} from '../../../../models/graphql/invite';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
  Member,
  Role,
} from '../../../../models/graphql/user';
import { CurrentUserData } from '../../../../models/userData';
import { getProjectID } from '../../../../utils/getSearchParams';
import { userInitials } from '../../../../utils/userInitials';
import RemoveMemberModal from './removeMemberModal';
import useStyles from './styles';

interface TableDataProps {
  row: Member;
  index: number;
  showModal: () => void;
  modalOpen: boolean;
  handleModalOpen: () => void;
}
const InvitedTableData: React.FC<TableDataProps> = ({
  row,
  showModal,
  modalOpen,
  handleModalOpen,
}) => {
  const classes = useStyles();
  const projectID = getProjectID();

  const { t } = useTranslation();
  const [role, setRole] = useState<string>(row.role);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [SendInvite] = useMutation<MemberInviteNew>(SEND_INVITE, {
    onCompleted: () => {
      window.location.reload();
    },
    refetchQueries: [
      {
        query: GET_PROJECT,
        variables: { projectID },
      },
      {
        query: ALL_USERS,
      },
    ],
  });

  const [memberDetails, setMemberDetails] = useState<CurrentUserData>();

  // Query to get user details
  useQuery<CurrentUserDetails, CurrentUserDedtailsVars>(GET_USER, {
    variables: { username: row.user_name },
    onCompleted: (data) => {
      setMemberDetails({
        // TODO: Check if all are being used
        name: data.getUser.name,
        uid: data.getUser.id,
        username: data.getUser.username,
        role: data.getUser.role,
        email: data.getUser.email,
      });
    },
  });
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
            {userInitials(memberDetails ? memberDetails.username : '')}
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
            disabled={row.deactivated_at !== undefined}
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
                setRole(Role.editor);
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
                setRole(Role.viewer);
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
            row.invitation === InvitationStatus.pending ? 'warning' : 'danger'
          }
          label={row.invitation}
        />
      </TableCell>

      <TableCell className={classes.buttonTC} key={row.user_id}>
        <div className={classes.lastCell}>
          {row.invitation !== InvitationStatus.exited &&
            row.invitation !== InvitationStatus.declined && (
              <IconButton onClick={handleModalOpen}>
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
            <div>
              <ButtonFilled
                disabled={row.deactivated_at !== undefined}
                onClick={() => {
                  SendInvite({
                    variables: {
                      member: {
                        project_id: projectID,
                        user_id: row.user_id,
                        role,
                      },
                    },
                  });
                }}
              >
                {t('settings.teamingTab.invitation.sentInvitation.resend')}
              </ButtonFilled>
            </div>
          </Tooltip>
        </div>
      </TableCell>
      {modalOpen && (
        <RemoveMemberModal
          open={modalOpen}
          handleClose={showModal}
          row={row}
          showModal={showModal}
          isRemove={false}
        />
      )}
    </>
  );
};
export default InvitedTableData;
