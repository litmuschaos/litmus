/* eslint-disable no-unused-expressions */
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Input,
  InputAdornment,
  Table,
  TableCell,
  TableContainer,
  TableRow,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { ButtonFilled } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Loader from '../../../../../components/Loader';
import { ALL_USERS, GET_PROJECT, SEND_INVITE } from '../../../../../graphql';
import {
  MemberInviteNew,
  UserInvite,
} from '../../../../../models/graphql/invite';
import {
  ProjectDetail,
  ProjectDetailVars,
} from '../../../../../models/graphql/user';
import { RootState } from '../../../../../redux/reducers';
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
  user_uid: string;
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

  const userData = useSelector((state: RootState) => state.userData);

  // for setting the role of the user while sending invitation
  const [roles, setRoles] = useState<Role[]>([]);

  // Array to store the list of selected users to be invited
  const [selected, setSelected] = React.useState<SelectedUser[]>([]);

  // Sets the user role while inviting
  const setUserRole = (user_uid: string, role: string) => {
    setSelected(
      selected.map((r) => (r.user_uid === user_uid ? { ...r, role } : r))
    );
    if (roles.find((ele) => ele.user_uid === user_uid)) {
      setRoles(
        roles.map((r) => (r.user_uid === user_uid ? { user_uid, role } : r))
      );
    } else {
      setRoles([...roles, { user_uid, role }]);
    }
  };

  const { loading, data: dataB } = useQuery<ProjectDetail, ProjectDetailVars>(
    GET_PROJECT,
    {
      variables: { projectID: userData.selectedProjectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  useQuery(ALL_USERS, {
    skip: !dataB,
    onCompleted: (data) => {
      const memberList = new Map();
      const users: UserInvite[] = [];
      if (dataB !== undefined) {
        dataB.getProject.members.forEach((member) => {
          if (
            member.invitation === 'Accepted' ||
            member.invitation === 'Pending'
          ) {
            memberList.set(member.user_id, 1);
          }
        });
        // check for displaying only those users who are not the part of team
        data &&
          data.users.forEach((user: UserInvite) => {
            if (!memberList.has(user.id)) users.push(user);
          });
        setRows([...users]);
      }
    },
  });

  // mutation to send invitation to selected users
  const [SendInvite, { error: errorB, loading: loadingB }] = useMutation<
    MemberInviteNew
  >(SEND_INVITE, {
    refetchQueries: [
      {
        query: GET_PROJECT,
        variables: { projectID: userData.selectedProjectID },
      },
    ],
  });

  // Checks if the user the already selected or not
  const isSelected = (user: UserInvite) => {
    const user_uids = new Map();
    selected.map((el) => user_uids.set(el.user_uid, el.role));
    return user_uids.has(user.id);
  };

  const handleClick = (
    event: React.MouseEvent<unknown>,
    selectedUser: UserInvite
  ) => {
    const selectedIds = selected.map((el) => el.user_uid);
    const isUserAlreadySelected = selectedIds.indexOf(selectedUser.id);
    let newSelected: SelectedUser[] = [];
    if (isUserAlreadySelected === -1) {
      const userrole = () => {
        const r = roles.find((ele) => ele.user_uid === selectedUser.id);
        if (r) {
          return r.role;
        }
        return 'Viewer';
      };
      newSelected = newSelected.concat(selected, {
        user_name: selectedUser.username,
        user_uid: selectedUser.id,
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
          {loadingB ? (
            <>
              <Loader />
            </>
          ) : (
            <Typography>
              {errorB ? (
                <Typography>{errorB.message}</Typography>
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
                    <ButtonFilled disabled={false} onClick={handleModal}>
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
                      maxWidth: '21.38rem',
                      minWidth: '21.38rem',
                    },
                  }}
                />
              </div>
              <div
                data-cy="inviteNewMemberSendInviteButton"
                className={classes.InviteBtn}
              >
                <ButtonFilled
                  className={classes.btnFilled}
                  disabled={!selected.length}
                  onClick={() => {
                    setShowsuccess(true);
                    selected.map(
                      (s) =>
                        !errorB &&
                        !loadingB &&
                        SendInvite({
                          variables: {
                            member: {
                              project_id: userData.selectedProjectID,
                              user_name: s.user_name,
                              role: s.role,
                            },
                          },
                        })
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
                      data-cy="inviteNewMemberCheckBox"
                      role="checkbox"
                      key={row.id}
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
