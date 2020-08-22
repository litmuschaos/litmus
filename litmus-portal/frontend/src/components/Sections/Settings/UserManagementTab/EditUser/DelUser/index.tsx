import { IconButton, MenuItem, Typography } from '@material-ui/core';
import React from 'react';
import ButtonFilled from '../../../../../Button/ButtonFilled';
import ButtonOutline from '../../../../../Button/ButtonOutline';
import useStyles from './styles';
import Unimodal from '../../../../../../containers/layouts/Unimodal';

// props for DelUser component
interface DelUserProps {
  handleModal?: () => void;
  tableDelete: boolean;
  handleTable?: () => void;
}

// DelUser displays the modal for deteing a user
const DelUser: React.FC<DelUserProps> = ({ handleModal, tableDelete }) => {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      {tableDelete ? (
        <>
          <MenuItem
            value="delete"
            onClick={() => {
              setOpen(true);
            }}
          >
            <IconButton disabled>
              <img alt="delete" src="./icons/bin.svg" />
            </IconButton>
            <Typography>Delete User</Typography>
          </MenuItem>
        </>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={() => {
            setOpen(true);
          }}
          className={classes.delDiv}
          onClick={() => {
            setOpen(true);
          }}
        >
          <img src="./icons/bin.svg" alt="delete" className={classes.bin} />
          <Typography>Delete user </Typography>
        </div>
      )}
      <Unimodal isOpen={open} handleClose={handleClose} hasCloseBtn={false}>
        <div className={classes.body}>
          <img src="./icons/userDel.svg" alt="lock" />
          <div className={classes.text}>
            <Typography className={classes.typo} align="center">
              Are you sure
              <strong> to remove the current user?</strong>
            </Typography>
          </div>
          <div className={classes.textSecond}>
            <Typography className={classes.typoSub} align="center">
              The user will lose access to the portal
            </Typography>
          </div>
          <div className={classes.buttonGroup}>
            <ButtonOutline isDisabled={false} handleClick={handleClose}>
              <> No</>
            </ButtonOutline>

            <ButtonFilled
              isDisabled={false}
              isPrimary
              handleClick={tableDelete ? handleModal : handleModal}
            >
              <>Yes</>
            </ButtonFilled>
          </div>
        </div>
      </Unimodal>
    </div>
  );
};
export default DelUser;
