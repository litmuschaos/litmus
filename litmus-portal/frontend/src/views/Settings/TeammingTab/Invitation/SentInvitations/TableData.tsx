import { useMutation } from '@apollo/client/react/hooks/useMutation';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  TableCell,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ButtonFilled from '../../../../../components/Button/ButtonFilled';
import ButtonOutline from '../../../../../components/Button/ButtonOutline';
import Loader from '../../../../../components/Loader';
import {
  REMOVE_INVITATION,
  SEND_INVITE,
} from '../../../../../graphql/mutations';
import { GET_USER } from '../../../../../graphql/quries';
import {
  MemberInvitation,
  MemberInviteNew,
} from '../../../../../models/graphql/invite';
import { Member } from '../../../../../models/graphql/user';
import { RootState } from '../../../../../redux/reducers';
import userAvatar from '../../../../../utils/user';
import useStyles from './styles';

interface TableDataProps {
  row: Member;
}

const TableData: React.FC<TableDataProps> = ({ row }) => {
  const userData = useSelector((state: RootState) => state.userData);
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [role, setRole] = useState<string>(row.role);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const username = useSelector((state: RootState) => state.userData.username);
  const { t } = useTranslation();

  // mutation to send invitation to selected users
  const [SendInvite, { loading: loadingB }] = useMutation<MemberInviteNew>(
    SEND_INVITE,
    { refetchQueries: [{ query: GET_USER, variables: { username } }] }
  );

  const [CancelInvite, { loading: loadingA }] = useMutation<MemberInvitation>(
    REMOVE_INVITATION,
    {
      refetchQueries: [{ query: GET_USER, variables: { username } }],
    }
  );

  return (
    <>
      <TableCell>
        <div className={classes.rowDiv}>
          <div className={classes.firstCol}>
            <Avatar
              data-cy="avatar"
              alt="User"
              className={classes.avatarBackground}
              style={{ alignContent: 'right' }}
            >
              {row.name ? userAvatar(row.name) : userAvatar(row.user_name)}
            </Avatar>
            <div className={classes.detail}>
              <div className={classes.flexstatus}>
                <div> {row.user_name}</div>

                <div
                  className={
                    row.invitation === 'Pending'
                      ? classes.pending
                      : classes.declined
                  }
                >
                  {row.invitation}
                </div>
              </div>
              <div>{row.email}</div>
            </div>
          </div>
          <div className={classes.buttonDiv}>
            <div className={classes.dropDown}>
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
            <div data-cy="cancelInviteDoneButton">
              <ButtonOutline
                handleClick={() =>
                  CancelInvite({
                    variables: {
                      data: {
                        project_id: userData.selectedProjectID,
                        user_name: row.user_name,
                      },
                    },
                  })
                }
                isDisabled={row.invitation === 'Declined' || loadingA}
              >
                {loadingA ? <Loader size={20} /> : 'Cancel'}
              </ButtonOutline>
            </div>
            <div data-cy="resendInviteDoneButton">
              <ButtonFilled
                isDisabled={loadingB}
                isPrimary
                handleClick={() =>
                  SendInvite({
                    variables: {
                      member: {
                        project_id: userData.selectedProjectID,
                        user_name: row.user_name,
                        role,
                      },
                    },
                  })
                }
              >
                {loadingB ? <Loader size={20} /> : 'Resend'}
              </ButtonFilled>
            </div>
          </div>
        </div>
      </TableCell>
    </>
  );
};
export default TableData;
