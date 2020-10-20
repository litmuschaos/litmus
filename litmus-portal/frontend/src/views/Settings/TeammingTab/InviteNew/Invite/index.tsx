import { useMutation, useQuery } from '@apollo/client/react/hooks';
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
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ButtonFilled from '../../../../../components/Button/ButtonFilled';
import Loader from '../../../../../components/Loader';
import { ALL_USERS, GET_USER, SEND_INVITE } from '../../../../../graphql';
import {
  MemberInviteNew,
  UserInvite,
} from '../../../../../models/graphql/invite';
import {
  CurrentUserDedtailsVars,
  CurrentUserDetails,
  Project,
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
  role: string;
  project_id: string;
}

interface Role {
  username: string;
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
  const setUserRole = (username: string, role: string) => {
    setSelected(
      selected.map((r) => (r.user_name === username ? { ...r, role } : r))
    );
    if (roles.find((ele) => ele.username === username)) {
      setRoles(
        roles.map((r) => (r.username === username ? { username, role } : r))
      );
    } else {
      setRoles([...roles, { username, role }]);
    }
  };

  // query for getting all the data for the logged in user
  const { data: dataB } = useQuery<CurrentUserDetails, CurrentUserDedtailsVars>(
    GET_USER,
    {
      variables: { username: userData.username },
      fetchPolicy: 'cache-and-network',
    }
  );

  // query to list all the users
  const memberList = new Map();
  const { data: dataA } = useQuery(ALL_USERS, {
    skip: !dataB,
    onCompleted: () => {
      const users: UserInvite[] = [];
      if (dataA !== undefined) {
        if (dataB?.getUser.username === userData.username) {
          const projectList: Project[] = dataB?.getUser.projects;
          projectList.forEach(
            (project) =>
              project.id === userData.selectedProjectID &&
              project.members.map(
                (member) =>
                  member.invitation !== 'Declined' &&
                  memberList.set(member.user_name, 1)
              )
          );
          // login for displaying only those users who are not the part of team
          dataA.users.map(
            (data: UserInvite) =>
              !memberList.has(data.username) && users.push(data)
          );
        }
        setRows(users);
      }
    },
  });

  // mutation to send invitation to selected users
  const [SendInvite, { error: errorB, loading: loadingB }] = useMutation<
    MemberInviteNew
  >(SEND_INVITE, {
    refetchQueries: [
      { query: GET_USER, variables: { username: userData.username } },
    ],
  });

  // Checks if the user the already selected or not
  const isSelected = (user: UserInvite) => {
    const usernames = new Map();
    selected.map((el) => usernames.set(el.user_name, el.role));
    return usernames.has(user.username);
  };

  const handleClick = (event: React.MouseEvent<unknown>, user: UserInvite) => {
    const names = selected.map((el) => el.user_name);
    const selectedIndex = names.indexOf(user.username);
    let newSelected: SelectedUser[] = [];

    if (selectedIndex === -1) {
      const userrole = () => {
        const r = roles.find((ele) => ele.username === user.username);
        if (r) {
          return r.role;
        }
        return 'Viewer';
      };
      newSelected = newSelected.concat(selected, {
        user_name: user.username,
        role: userrole(),
        project_id: 'abc',
      });
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  // States for filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
  });

  const filteredData = rows.filter((dataRow) =>
    dataRow?.username.toLowerCase().includes(filters.search.toLowerCase())
  );

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
            <>
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
                    <ButtonFilled
                      isPrimary
                      isDisabled={false}
                      handleClick={handleModal}
                    >
                      <>
                        {t('settings.teamingTab.inviteNew.invite.button.done')}
                      </>
                    </ButtonFilled>
                  </div>
                </div>
              )}
            </>
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
                    style: {
                      color: theme.palette.personalDetailsBodyColor,
                      maxWidth: '31.75rem',
                      minWidth: '31.375rem',
                    },
                  }}
                />
              </div>
              <div
                data-cy="inviteNewMemberSendInviteButton"
                className={classes.InviteBtn}
              >
                <ButtonFilled
                  isPrimary
                  isDisabled={!selected.length}
                  handleClick={() => {
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
                      key={row.username}
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
                  <TableCell colSpan={2}>
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
