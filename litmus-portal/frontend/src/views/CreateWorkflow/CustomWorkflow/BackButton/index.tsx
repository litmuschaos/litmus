import { Button, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';

interface BackButtonProps {
  isDisabled: boolean;
  onClick: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ isDisabled, onClick }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Button
      size="medium"
      className={classes.btn}
      disabled={isDisabled}
      onClick={onClick}
    >
      <img src="/icons/back.svg" alt="back" />
      <Typography className={classes.text}>
        {t('customWorkflow.backBtn.back')}
      </Typography>
    </Button>
  );
};

export default BackButton;
