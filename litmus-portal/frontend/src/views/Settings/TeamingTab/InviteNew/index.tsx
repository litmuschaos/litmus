import { IconButton } from '@material-ui/core';
import { ButtonOutlined, Modal } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Invite from './Invite';
import useStyles from './styles';

// NewUserModal displays a modal on creating a new user
interface InviteNewProps {
  showModal: () => void;
  handleOpen: () => void;
  open: boolean;
}
const InviteNew: React.FC<InviteNewProps> = ({
  showModal,
  handleOpen,
  open,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div data-cy="inviteNewMemberButton">
      <div className={classes.button}>
        <ButtonOutlined onClick={handleOpen} disabled={false}>
          <div>{t('settings.teamingTab.inviteNew.header')}</div>
        </ButtonOutlined>
      </div>

      <Modal
        data-cy="modal"
        open={open}
        width="43.75rem"
        disableBackdropClick
        disableEscapeKeyDown
        onClose={showModal}
        modalActions={
          <div className={classes.closeModal}>
            <IconButton onClick={showModal}>
              <img src="./icons/closeBtn.svg" alt="close" />
            </IconButton>
          </div>
        }
      >
        <div data-cy="inviteNewMemberModal" className={classes.body}>
          <Invite handleModal={showModal} />
        </div>
      </Modal>
    </div>
  );
};
export default InviteNew;
