import Button from '@material-ui/core/Button';
import Modal, { ModalProps } from '@material-ui/core/Modal';
import React from 'react';
import useStyles from './styles';
/* DelUser, NewUserModal, ResetModal need to be shifted */

interface UnimodalProps extends ModalProps {
  handleClose: () => void;
  hasCloseBtn: boolean;
  isDark?: boolean;
  textAlign?: string;
  'data-cy'?: string;
}

const Unimodal: React.FC<UnimodalProps> = ({
  children,
  open,
  disableBackdropClick,
  disableEscapeKeyDown,
  handleClose,
  hasCloseBtn,
  isDark,
  textAlign,
  'data-cy': dataCy,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
}) => {
  const isDarkBg = isDark ?? false;
  const styleProps = { textAlign, isDarkBg };
  const classes = useStyles(styleProps);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      disableBackdropClick={disableBackdropClick}
      disableEscapeKeyDown={disableEscapeKeyDown}
      data-cy={dataCy}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
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
