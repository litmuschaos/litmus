import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import React from 'react';
import ButtonFilled from '../../../../../components/Button/ButtonFilled';
import config from '../../../../../config';
import Unimodal from '../../../../../containers/layouts/Unimodal';
import getToken from '../../../../../utils/getToken';
import useStyles from './styles';

// props for ResetModal component
interface ResetModalProps {
  resetPossible: boolean;
  new_password: string;
  username: string;
  handleModal: () => void;
}

// ResetModal displays modal for resetting the password
const ResetModal: React.FC<ResetModalProps> = ({
  resetPossible,
  username,
  new_password,
  handleModal,
}) => {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = () => {
    if (resetPossible) setOpen(true);

    fetch(`${config.auth.url}/reset/password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ username, new_password }),
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
      <div>
        <div className={classes.buttonFilled}>
          <ButtonFilled
            isPrimary={false}
            isDisabled={false}
            handleClick={handleClick}
          >
            <Typography>Save</Typography>
          </ButtonFilled>
        </div>

        <Unimodal isOpen={open} handleClose={handleClose} hasCloseBtn={false}>
          <div className={classes.body}>
            <img src="./icons/checkmark.svg" alt="checkmark" />
            <div className={classes.textSucess}>
              <Typography className={classes.typo} align="center">
                The user’s password was <strong>successfully reset </strong>
              </Typography>
            </div>
            <div className={classes.text1Sucess}>
              <Typography className={classes.typoSub} align="center">
                The user needs to login with the new credentials.
              </Typography>
            </div>

            <Button
              data-cy="closeButton"
              variant="contained"
              className={classes.buttonModalSucess}
              onClick={handleModal}
            >
              Done
            </Button>
          </div>
        </Unimodal>
      </div>
    </div>
  );
};
export default ResetModal;
