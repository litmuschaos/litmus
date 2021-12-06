/* eslint-disable no-unused-expressions */
import {
  Input,
  InputAdornment,
  Table,
  TableCell,
  TableContainer,
  TableRow,
  Toolbar,
  Typography,
  useTheme,
} from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../../../components/Loader';
import config from '../../../../../config';
import { UserInvite } from '../../../../../models/graphql/invite';
import { Project } from '../../../../../models/graphql/user';
import { getToken } from '../../../../../utils/auth';
import { getProjectID } from '../../../../../utils/getSearchParams';
import useStyles from './styles';
import TableData from './TableData';

interface FilterOptions {
  search: string;
}

interface InviteProps {
  handleModal: () => void;
}

interface SelectedUser {
  user_name: string;
  user_id: string;
  role: string;
}

interface Role {
  user_uid: string;
  role: string;
}

const Invite: React.FC<InviteProps> = ({ handleModal }) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();

  // for response data
  const [rows, setRows] = useState<UserInvite[]>([]);

  const projectID = getProjectID();

  // for setting the role of the user while sending invitation
  const [roles, setRoles] = useState<Role[]>([]);
  const [project, setProject] = useState<Project>();

  // Array to store the list of selected users to be invited
  const [selected, setSelected] = React.useState<SelectedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sendInviteLoading, setSendInviteLoading] = useState<boolean>(false);
  const [sendInviteError, setSendInviteError] = useState<string>('');

  // Sets the user role while inviting
  const setUserRole = (user_uid: string, role: string) => {
    setSelected(
      selected.map((r) => (r.user_id === user_uid ? { ...r, role } : r))
    );
    if (roles.find((ele) => ele.user_uid === user_uid)) {
      setRoles(
        roles.map((r) => (r.user_uid === user_uid ? { user_uid, role } : r))
      );
    } else {
      setRoles([...roles, { user_uid, role }]);
    }
  };

  const getProject = () => {
    setLoading(true);
    fetch(`${config.auth.url}/get_project/${projectID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data);
        } else {
          setProject(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  React.useEffect(() => {
    getProject();
  }, []);

  useEffect(() => {
    fetch(`${config.auth.url}/users`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((res) => {
        // setUsers(res);
        const memberList = new Map();
        const users: UserInvite[] = [];
        if (project !== undefined) {
          project.Members.forEach((member) => {
            if (
              member.Invitation === 'Accepted' ||
              member.Invitation === 'Pending'
            ) {
              memberList.set(member.UserID, 1);
            }
          });
          // check for displaying only those users who are not the part of team
          res &&
            res.forEach((user: UserInvite) => {
              if (!memberList.has(user._id) && !user.deactivated_at)
                users.push(user);
            });
          setRows([...users]);
        }
      })

      .catch((err) => {
        console.error(err);
      });
  }, [project]);

  const SendInvite = (userid: string, role: string) => {
    setSendInviteLoading(true);
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
          setSendInviteError(data.error);
        } else {
          setSendInviteLoading(false);
          setSendInviteError('');
        }
      })
      .catch((err) => {
        console.error(err);
        setSendInviteError('');
      });
  };

  // Checks if the user the already selected or not
  const isSelected = (user: UserInvite) => {
    const user_uids = new Map();
    selected.map((el) => user_uids.set(el.user_id, el.role));
    return user_uids.has(user._id);
  };

  const handleClick = (
    event: React.MouseEvent<unknown>,
    selectedUser: UserInvite
  ) => {
    const selectedIds = selected.map((el) => el.user_id);
    const isUserAlreadySelected = selectedIds.indexOf(selectedUser._id);
    let newSelected: SelectedUser[] = [];
    if (isUserAlreadySelected === -1) {
      const userrole = () => {
        const r = roles.find((ele) => ele.user_uid === selectedUser._id);
        if (r) {
          return r.role;
        }
        return 'Viewer';
      };
      newSelected = newSelected.concat(selected, {
        user_name: selectedUser.username,
        user_id: selectedUser._id,
        role: userrole(),
      });
    } else if (isUserAlreadySelected === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (isUserAlreadySelected === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (isUserAlreadySelected > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, isUserAlreadySelected),
        selected.slice(isUserAlreadySelected + 1)
      );
    }
    setSelected(newSelected);
  };

  // States for filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
  });

  const filteredData = !loading
    ? rows.filter((dataRow) => {
        return dataRow.username
          .toLowerCase()
          .includes(filters.search.toLowerCase());
      })
    : [];

  const [showsuccess, setShowsuccess] = useState<boolean>(false);

  return (
    <div>
      {showsuccess ? (
        <>
          {sendInviteLoading ? (
            <>
              <Loader />
            </>
          ) : (
            <Typography>
              {sendInviteError ? (
                <Typography>{sendInviteError}</Typography>
              ) : (
                <div
                  data-cy="inviteNewMemberSuccessModal"
                  className={classes.body}
                >
                  <img src="./icons/checkmark.svg" alt="checkmark" />
                  <div className={classes.text}>
                    <Typography className={classes.typo}>
                      {t('settings.teamingTab.inviteNew.invite.successHeader')}{' '}
                      <strong>
                        {t(
                          'settings.teamingTab.inviteNew.invite.successHeaderStrong'
                        )}
                      </strong>
                    </Typography>
                  </div>
                  <div className={classes.textSecond}>
                    <Typography className={classes.typoSub}>
                      {t('settings.teamingTab.inviteNew.invite.info')}
                    </Typography>
                  </div>
                  <div
                    data-cy="inviteNewMemberSuccessModalDoneButton"
                    className={classes.buttonModal}
                  >
                    <ButtonFilled onClick={handleModal}>
                      <>
                        {t('settings.teamingTab.inviteNew.invite.button.done')}
                      </>
                    </ButtonFilled>
                  </div>
                </div>
              )}
            </Typography>
          )}
        </>
      ) : (
        <div>
          <Typography className={classes.Header}>
            {t('settings.teamingTab.inviteNew.invite.header')}{' '}
            <strong>
              {t('settings.teamingTab.inviteNew.invite.headerStrong')}
            </strong>
          </Typography>
          <Toolbar className={classes.toolbar}>
            <div
              data-cy="inviteNewMemberSearch"
              className={classes.inviteSomeone}
            >
              <div>
                <Input
                  id="input-with-icon-textfield"
                  placeholder={t(
                    'settings.teamingTab.inviteNew.invite.label.someone'
                  )}
                  onChange={(e) => {
                    setFilters({
                      search: e.target.value,
                    });
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <img src="./icons/user-invite.svg" alt="user" />
                    </InputAdornment>
                  }
                  disableUnderline
                  inputProps={{
                    className: classes.input,
                    style: {
                      color: theme.palette.text.primary,
                    },
                  }}
                />
              </div>
              <div data-cy="inviteNewMemberSendInviteButton">
                <ButtonFilled
                  disabled={!selected.length}
                  onClick={() => {
                    setShowsuccess(true);
                    selected.map(
                      (s) =>
                        !(sendInviteError !== '') &&
                        !sendInviteLoading &&
                        SendInvite(s.user_id, s.role)
                    );
                  }}
                >
                  <div>
                    {t('settings.teamingTab.inviteNew.invite.button.send')}
                  </div>
                </ButtonFilled>
              </div>
            </div>
          </Toolbar>
          <TableContainer
            data-cy="inviteNewMemberTable"
            className={classes.table}
          >
            <Table stickyHeader aria-label="sticky table">
              {filteredData && filteredData.length > 0 ? (
                filteredData.map((row, index) => {
                  const isItemSelected = isSelected(row);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      data-cy="inviteNewMemberRow"
                      role="checkbox"
                      key={row._id}
                      aria-checked={isItemSelected}
                      selected={isItemSelected}
                    >
                      <TableData
                        row={row}
                        isItemSelected={isItemSelected}
                        handleCheck={handleClick}
                        labelId={labelId}
                        sendInvite={setUserRole}
                      />
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className={classes.tableCell}>
                    <Typography align="center">
                      {t('settings.teamingTab.inviteNew.invite.noUsers')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
};

export default Invite;
