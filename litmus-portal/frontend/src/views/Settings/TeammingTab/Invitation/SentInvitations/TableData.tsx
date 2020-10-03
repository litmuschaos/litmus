import { useMutation } from '@apollo/client/react/hooks/useMutation';
import { Avatar, TableCell } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import ButtonFilled from '../../../../../components/Button/ButtonFilled';
import ButtonOutline from '../../../../../components/Button/ButtonOutline';
import Loader from '../../../../../components/Loader';
import { CANCEL_INVITE, SEND_INVITE } from '../../../../../graphql/mutations';
import { GET_USER } from '../../../../../graphql/quries';
import { MemberInviteNew } from '../../../../../models/graphql/invite';
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
  // const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  // const [role, setRole] = useState<string>('Viewer');
  // const handleClose = () => {
  //   setAnchorEl(null);
  // };

  const username = useSelector((state: RootState) => state.userData.username);

  // mutation to send invitation to selected users
  const [SendInvite, { loading: loadingB }] = useMutation<MemberInviteNew>(
    SEND_INVITE,
    {
      refetchQueries: [{ query: GET_USER, variables: { username } }],
    }
  );

  const [CancelInvite, { loading: loadingA }] = useMutation<MemberInviteNew>(
    CANCEL_INVITE,
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
              {row.user_name
                ? userAvatar(row.user_name)
                : userAvatar(row.user_name)}
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
              <div>{row.role}</div>
            </div>
          </div>
          <div className={classes.buttonDiv}>
            <div>
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
                isDisabled={false}
              >
                {loadingA ? <Loader size={20} /> : 'Cancel Invite'}
              </ButtonOutline>
            </div>
            <div>
              <ButtonFilled
                isPrimary
                handleClick={() =>
                  SendInvite({
                    variables: {
                      member: {
                        project_id: userData.selectedProjectID,
                        user_name: row.user_name,
                        role: 'Viewer',
                      },
                    },
                  })
                }
              >
                {loadingB ? <Loader size={20} /> : 'Resend Invite'}
              </ButtonFilled>
            </div>
          </div>
        </div>
      </TableCell>
    </>
  );
};
export default TableData;
