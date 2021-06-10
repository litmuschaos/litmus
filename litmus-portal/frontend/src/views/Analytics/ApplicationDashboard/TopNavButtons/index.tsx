import { Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';

interface TopNavButtonsProps {
  isInfoToggledState: Boolean;
  switchIsInfoToggled: (toggleState: Boolean) => void;
}
const TopNavButtons: React.FC<TopNavButtonsProps> = ({
  isInfoToggledState,
  switchIsInfoToggled,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [isInfoToggled, setIsInfoToggled] =
    React.useState<Boolean>(isInfoToggledState);

  return (
    <div className={classes.button}>
      {isInfoToggled ? (
        <ButtonFilled
          onClick={() => {
            setIsInfoToggled(false);
            switchIsInfoToggled(false);
          }}
        >
          <img
            src="/icons/infoWhite.svg"
            alt="Info Icon"
            className={classes.icon}
          />
          <Typography className={classes.infoText}>
            {t('analyticsDashboard.monitoringDashboardPage.infoButtonText')}
          </Typography>
        </ButtonFilled>
      ) : (
        <ButtonOutlined
          onClick={() => {
            setIsInfoToggled(true);
            switchIsInfoToggled(true);
          }}
        >
          <img src="/icons/info.svg" alt="Info Icon" className={classes.icon} />
          <Typography className={classes.infoText}>
            {t('analyticsDashboard.monitoringDashboardPage.infoButtonText')}
          </Typography>
        </ButtonOutlined>
      )}
    </div>
  );
};

export default TopNavButtons;
