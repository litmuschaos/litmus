import { useMutation, useQuery } from '@apollo/client';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  TableCell,
  Typography,
} from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, LightPills, Modal } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Loader from '../../../../components/Loader';
import {
  GET_PROJECT,
  GET_USER,
  REMOVE_INVITATION,
  SEND_INVITE,
} from '../../../../graphql';
import {
  MemberInvitation,
  MemberInviteNew,
} from '../../../../models/graphql/invite';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
  Member,
} from '../../../../models/graphql/user';
import { CurrentUserData } from '../../../../models/userData';
import { RootState } from '../../../../redux/reducers';
import userAvatar from '../../../../utils/user';
import useStyles from './styles';

interface TableDataProps {
  row: Member;
  index: number;
}
const InvitedTableData: React.FC<TableDataProps> = ({ row }) => {
  const classes = useStyles();
  const userData = useSelector((state: RootState) => state.userData);
  const { t } = useTranslation();

  const [open, setOpen] = React.useState(false);
  const [role, setRole] = useState<string>(row.role);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [SendInvite] = useMutation<MemberInviteNew>(SEND_INVITE, {
    refetchQueries: [
      {
        query: GET_PROJECT,
        variables: { projectID: userData.selectedProjectID },
      },
    ],
  });

  // mutation to remove member
  const [removeMember, { loading }] = useMutation<MemberInvitation>(
    REMOVE_INVITATION,
    {
      onCompleted: () => {
        setOpen(false);
      },
      onError: () => {},
      refetchQueries: [
        {
          query: GET_PROJECT,
          variables: { projectID: userData.selectedProjectID },
        },
      ],
    }
  );

  const [memberDetails, setMemberDetails] = useState<CurrentUserData>();

  // Query to get user details
  useQuery<CurrentUserDetails, CurrentUserDedtailsVars>(GET_USER, {
    variables: { username: row.user_name },
    onCompleted: (data) => {
      setMemberDetails({
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
      <TableCell className={classes.firstTC} component="th" scope="row">
        <div className={classes.firstCol}>
          <Avatar
            data-cy="avatar"
            alt="User"
            className={classes.avatarBackground}
          >
            {userAvatar(memberDetails ? memberDetails.name : '')}
          </Avatar>
          {memberDetails ? memberDetails.name : ''}
        </div>
      </TableCell>
      <TableCell className={classes.otherTC}>
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
                setRole(row.role);
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
      <TableCell className={classes.otherTC}>
        {memberDetails ? memberDetails.email : ''}
      </TableCell>
      <TableCell className={classes.otherTC}>
        <LightPills
          variant={row.invitation === 'Pending' ? 'warning' : 'danger'}
          label={row.invitation}
        />
      </TableCell>

      <TableCell className={classes.buttonTC} key={row.user_id}>
        <div className={classes.lastCell}>
          <IconButton
            onClick={() => {
              setOpen(true);
            }}
          >
            <img alt="delete" src="./icons/deleteBox.svg" height="45" />
          </IconButton>
          <ButtonFilled
            disabled={false}
            onClick={() => {
              SendInvite({
                variables: {
                  member: {
                    project_id: userData.selectedProjectID,
                    user_name: row.user_name,
                    role,
                  },
                },
              });
            }}
          >
            {t('settings.teamingTab.invitation.sentInvitation.resend')}
          </ButtonFilled>
        </div>
      </TableCell>
      <Modal
        data-cy="modal"
        open={open}
        width="43.75rem"
        disableBackdropClick
        disableEscapeKeyDown
        onClose={() => {
          setOpen(false);
        }}
        modalActions={
          <div className={classes.closeModal}>
            <IconButton
              onClick={() => {
                setOpen(false);
              }}
            >
              <img src="./icons/closeBtn.svg" alt="close" />
            </IconButton>
          </div>
        }
      >
        <div className={classes.body}>
          <img src="./icons/userDel.svg" alt="lock" />
          <div className={classes.text}>
            <Typography className={classes.typo} align="center">
              {t('settings.teamingTab.deleteModal.header')}
              <strong>
                {' '}
                <span className={classes.userName}>
                  {memberDetails
                    ? memberDetails.name
                    : t('settings.teamingTab.deleteModal.text')}
                </span>
              </strong>
            </Typography>
          </div>
          <div className={classes.textSecond}>
            <Typography className={classes.typoSub} align="center">
              <>{t('settings.teamingTab.deleteModal.body')}</>
            </Typography>
          </div>
          <div className={classes.buttonGroup}>
            <ButtonOutlined
              onClick={() => {
                setOpen(false);
              }}
            >
              <>{t('settings.teamingTab.deleteModal.noButton')}</>
            </ButtonOutlined>
            <div className={classes.yesButton}>
              <ButtonFilled
                disabled={loading}
                onClick={() => {
                  removeMember({
                    variables: {
                      data: {
                        project_id: userData.selectedProjectID,
                        user_name: row.user_name,
                      },
                    },
                  });
                }}
              >
                <>
                  {loading ? (
                    <div>
                      <Loader size={20} />
                    </div>
                  ) : (
                    <>{t('settings.teamingTab.deleteModal.yesButton')}</>
                  )}
                </>
              </ButtonFilled>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default InvitedTableData;
