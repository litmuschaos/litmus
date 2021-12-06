import { IconButton, Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../../components/Loader';
import config from '../../../../config';
import { Member } from '../../../../models/graphql/user';
import { getToken } from '../../../../utils/auth';
import { getProjectID } from '../../../../utils/getSearchParams';
import useStyles from './styles';

interface RemoveMemberModalProps {
  row: Member;
  showModal: () => void;
  handleClose: () => void;
  open: boolean;
  isRemove: boolean;
}
const RemoveMemberModal: React.FC<RemoveMemberModalProps> = ({
  row,
  showModal,
  handleClose,
  open,
  isRemove,
}) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const [loading, setLoading] = useState<boolean>(false);

  const { t } = useTranslation();

  const removeMember = (userid: string, role: string) => {
    setLoading(true);
    fetch(`${config.auth.url}/remove_invitation`, {
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
          console.error(data.error);
        } else {
          showModal();
          handleClose();
          setLoading(false);
          // window.location.reload();
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // mutation to remove member
  // const [removeMember, { loading }] = useMutation<MemberInvitation>(
  //   REMOVE_INVITATION,
  //   {
  //     onCompleted: () => {
  //       showModal();
  //       handleClose();
  //       window.location.reload();
  //     },
  //     refetchQueries: [
  //       {
  //         query: GET_PROJECT,
  //         variables: { projectID },
  //       },
  //       {
  //         query: ALL_USERS,
  //       },
  //     ],
  //   }
  // );

  return (
    <Modal
      data-cy="modal"
      open={open}
      width="50%"
      height="70%"
      disableBackdropClick
      disableEscapeKeyDown
      onClose={() => {
        showModal();
        handleClose();
      }}
      modalActions={
        <div className={classes.closeModal}>
          <IconButton
            onClick={() => {
              showModal();
              handleClose();
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
            {isRemove
              ? t('settings.teamingTab.deleteUser.header')
              : t('settings.teamingTab.deleteModal.header')}
            <strong> {row.UserName}?</strong>
          </Typography>
        </div>
        <div className={classes.textSecond}>
          {isRemove && (
            <Typography className={classes.typoSub} align="center">
              {t('settings.teamingTab.deleteUser.body')}
            </Typography>
          )}
        </div>
        <div className={classes.buttonGroup}>
          <ButtonOutlined
            onClick={() => {
              showModal();
              handleClose();
            }}
          >
            {t('settings.teamingTab.deleteUser.noButton')}
          </ButtonOutlined>

          <div className={classes.yesButton} data-cy="yesButton">
            <ButtonFilled
              disabled={loading}
              onClick={() => {
                removeMember(row.UserID, row.Role);
              }}
            >
              <>
                {loading ? (
                  <div>
                    <Loader size={20} />
                  </div>
                ) : (
                  <>{t('settings.teamingTab.deleteUser.yesButton')}</>
                )}
              </>
            </ButtonFilled>
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default RemoveMemberModal;
