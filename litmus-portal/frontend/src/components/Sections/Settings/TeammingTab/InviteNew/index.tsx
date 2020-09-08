import React from 'react';
import Unimodal from '../../../../../containers/layouts/Unimodal';
import ButtonFilled from '../../../../Button/ButtonFilled';
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
    <div>
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
        <div className={classes.body}>
          <Invite handleModal={handleClose} />
        </div>
      </Unimodal>
    </div>
  );
};
export default InviteNew;
