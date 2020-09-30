import React from 'react';
import ButtonFilled from '../../../../components/Button/ButtonFilled';
import Unimodal from '../../../../containers/layouts/Unimodal';
import Invite from './Invite';
import useStyles from './styles';

// NewUserModal displays a modal on creating a new user
const InviteNew: React.FC = () => {
  const classes = useStyles();

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
        <ButtonFilled handleClick={handleOpen} isDisabled={false} isPrimary>
          <div>Invite new member</div>
        </ButtonFilled>
      </div>

      <Unimodal
        isOpen={open}
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
