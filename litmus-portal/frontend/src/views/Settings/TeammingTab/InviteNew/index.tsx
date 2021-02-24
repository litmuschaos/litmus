import { ButtonFilled } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Unimodal from '../../../../containers/layouts/Unimodal';
import Invite from './Invite';
import useStyles from './styles';

// NewUserModal displays a modal on creating a new user
const InviteNew: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <div data-cy="inviteNewMemberButton">
      <div className={classes.button}>
        <ButtonFilled onClick={handleOpen}>
          <div>{t('settings.teamingTab.inviteNew.header')}</div>
        </ButtonFilled>
      </div>

      <Unimodal
        data-cy="modal"
        open={open}
        handleClose={handleClose}
        hasCloseBtn
        textAlign="center"
      >
        <div data-cy="inviteNewMemberModal" className={classes.body}>
          <Invite handleModal={handleClose} />
        </div>
      </Unimodal>
    </div>
  );
};
export default InviteNew;
