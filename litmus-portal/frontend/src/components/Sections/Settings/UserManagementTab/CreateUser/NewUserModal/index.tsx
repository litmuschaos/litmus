import { Typography } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import config from '../../../../../../config';
import { RootState } from '../../../../../../redux/reducers';
import ButtonFilled from '../../../../../Button/ButtonFilled';
import useStyles from './styles';
import Unimodal from '../../../../../../containers/layouts/Unimodal';

// Props for NewUserModal component
interface NewUserModalProps {
  showModal: boolean;
  username: string;
  password: string;
  name: string;
  email: string;
}

// NewUserModal displays a modal on creating a new user
const NewUserModal: React.FC<NewUserModalProps> = ({
  showModal,
  username,
  password,
  name,
  email,
}) => {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const { userData } = useSelector((state: RootState) => state);

  const handleClose = () => {
    setOpen(false);
    window.location.reload();
  };
  const handleOpen = () => {
    if (showModal) setOpen(true);
    fetch(`${config.auth.url}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userData.token}`,
      },
      body: JSON.stringify({ email, username, name, password }),
    })
      .then((response) => {
        response.json();
      })

      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      <div className={classes.button}>
        <ButtonFilled
          isPrimary={false}
          isDisabled={false}
          handleClick={handleOpen}
        >
          <>Create</>
        </ButtonFilled>
      </div>

      <Unimodal isOpen={open} handleClose={handleClose} hasCloseBtn={false}>
        <div className={classes.body}>
          <img src="./icons/checkmark.svg" alt="checkmark" />
          <div className={classes.text}>
            <Typography className={classes.typo} align="center">
              A new user was <strong>successfully created </strong>
            </Typography>
          </div>
          <div className={classes.textSecond}>
            <Typography className={classes.typoSub}>
              A new user was successfully created.Now information about it will
              be displayed on the user management screen of the application.
            </Typography>
          </div>
          <div className={classes.buttonModal}>
            <ButtonFilled
              isPrimary
              isDisabled={false}
              handleClick={handleClose}
            >
              <>Done</>
            </ButtonFilled>
          </div>
        </div>
      </Unimodal>
    </div>
  );
};
export default NewUserModal;
