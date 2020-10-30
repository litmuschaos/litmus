import React from 'react';
import BackButton from '../../components/Button/BackButton';
import ButtonFilled from '../../components/Button/ButtonFilled';
import ButtonOutline from '../../components/Button/ButtonOutline';
import useStyles from './styles';

interface TopNavButtonsProps {
  isAnalyticsToggled: boolean;
  isExportToggled: boolean;
  isInfoToggled: boolean;
}

interface Props {
  isToggled: TopNavButtonsProps;
  setIsToggled: React.Dispatch<React.SetStateAction<TopNavButtonsProps>>;
}

const TopNavButtons: React.FC<Props> = ({ isToggled, setIsToggled }) => {
  const classes = useStyles();

  const setFilledButtonState = (buttonName: string, buttonIcon: string) => {
    return (
      <ButtonFilled
        styles={{ height: '2.2rem' }}
        isPrimary
        handleClick={() =>
          setIsToggled({
            isAnalyticsToggled: false,
            isExportToggled: false,
            isInfoToggled: false,
          })
        }
      >
        <img
          src={`/icons/${buttonIcon}.svg`}
          alt={`${buttonName} Icon`}
          className={classes.icon}
        />
        {buttonName}
      </ButtonFilled>
    );
  };

  const setButtonOutlinedState = (
    buttonName: string,
    buttonIcon: string,
    setIsToggleValues: TopNavButtonsProps
  ) => {
    return (
      <ButtonOutline
        styles={{ height: '2.2rem' }}
        isDisabled={false}
        handleClick={() => setIsToggled(setIsToggleValues)}
      >
        <img
          src={`/icons/${buttonIcon}.svg`}
          alt={`${buttonName} Icon`}
          className={classes.icon}
        />
        {buttonName}
      </ButtonOutline>
    );
  };
  /*
  const AnalyticsButton = () =>
    isToggled.isAnalyticsToggled
      ? setFilledButtonState('Analytics', 'show-analytics')
      : setButtonOutlinedState('Analytics', 'show-analytics', {
          isAnalyticsToggled: true,
          isExportToggled: false,
          isInfoToggled: false,
        });

  const ExportButton = () =>
    isToggled.isExportToggled
      ? setFilledButtonState('Export', 'export')
      : setButtonOutlinedState('Export', 'export', {
          isAnalyticsToggled: false,
          isExportToggled: true,
          isInfoToggled: false,
        });
*/
  const InfoButton = () =>
    isToggled.isInfoToggled
      ? setFilledButtonState('Info', 'alignment')
      : setButtonOutlinedState('Info', 'alignment', {
          isAnalyticsToggled: false,
          isExportToggled: false,
          isInfoToggled: true,
        });

  return (
    <div className={classes.button}>
      <div>
        <BackButton isDisabled={false} />
      </div>
      <div>
        {/* AnalyticsButton() */}
        {/* ExportButton() */}
        {InfoButton()}
      </div>
    </div>
  );
};

export default TopNavButtons;
