import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import React from 'react';
import useStyles from './styles';
/* DelUser, NewUserModal, ResetModal need to be shifted */

interface UnimodalProps {
  isOpen: boolean;
  handleClose: () => void;
  hasCloseBtn: boolean;
  isDark?: boolean;
  textAlign?: string;
}

const Unimodal: React.FC<UnimodalProps> = ({
  children,
  isOpen,
  handleClose,
  hasCloseBtn,
  isDark,
  textAlign,
}) => {
  const isDarkBg = isDark ?? false;
  const styleProps = { textAlign, isDarkBg };
  const classes = useStyles(styleProps);

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      disableBackdropClick
      disableEscapeKeyDown
      data-cy="modal"
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      className={classes.uniModalStyle}
    >
      <div className={classes.modalContainer}>
        {hasCloseBtn && (
          <div className={classes.modalContainerClose}>
            <Button
              variant="outlined"
              color="secondary"
              className={classes.closeButton}
              onClick={handleClose}
            >
              &#x2715;
            </Button>
          </div>
        )}
        {children}
      </div>
    </Modal>
  );
};

export default Unimodal;
