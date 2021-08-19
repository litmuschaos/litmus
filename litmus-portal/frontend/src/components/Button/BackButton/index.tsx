import {
  IconButton,
  IconButtonProps,
  Typography,
  useTheme,
} from '@material-ui/core';
import { Icon } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { history } from '../../../redux/configureStore';
import useStyles from './styles';

const BackButton: React.FC<IconButtonProps> = ({ onClick }) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <IconButton
      size="medium"
      className={classes.btn}
      onClick={onClick ?? (() => history.goBack())}
    >
      <Icon name="chevronLeft" size="lg" color={theme.palette.text.hint} />
      <Typography className={classes.text}>{t('button.backButton')}</Typography>
    </IconButton>
  );
};

export default BackButton;
