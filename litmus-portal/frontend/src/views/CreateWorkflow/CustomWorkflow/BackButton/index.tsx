import { Button, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';

interface BackButtonProps {
  isDisabled: boolean;
  gotoStep: (page: number) => void;
}

const BackButton: React.FC<BackButtonProps> = ({ isDisabled, gotoStep }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Button
      size="medium"
      className={classes.btn}
      disabled={isDisabled}
      onClick={() => gotoStep(1)}
    >
      <img src="/icons/back.svg" alt="back" />
      <Typography className={classes.text}>
        {t('customWorkflow.backBtn.back')}
      </Typography>
    </Button>
  );
};

export default BackButton;
