import React from 'react';
import { useSelector } from 'react-redux';
import BackButton from '../../components/Button/BackButton';
import ButtonFilled from '../../components/Button/ButtonFilled';
import ButtonOutline from '../../components/Button/ButtonOutline';
import useActions from '../../redux/actions';
import * as ToggleButtonAction from '../../redux/actions/button';
import { RootState } from '../../redux/reducers';
import useStyles from './styles';

const TopNavButtons: React.FC = () => {
  const classes = useStyles();

  const isInfoToggled = useSelector(
    (state: RootState) => state.toggleInfoButton.isInfoToggled
  );
  const toggleButtonAction = useActions(ToggleButtonAction);

  return (
    <div className={classes.button}>
      <div>
        <BackButton />
      </div>
      <div>
        {isInfoToggled ? (
          <ButtonFilled
            styles={{ height: '2.2rem' }}
            isPrimary
            handleClick={() =>
              toggleButtonAction.toggleInfoButton({
                isInfoToggled: false,
              })
            }
          >
            <img
              src="/icons/alignmentToggle.svg"
              alt="Info Icon"
              className={classes.icon}
            />
            Info
          </ButtonFilled>
        ) : (
          <ButtonOutline
            styles={{ height: '2.2rem' }}
            isDisabled={false}
            handleClick={() =>
              toggleButtonAction.toggleInfoButton({
                isInfoToggled: true,
              })
            }
          >
            <img
              src="/icons/alignment.svg"
              alt="Info Icon"
              className={classes.icon}
            />
            Info
          </ButtonOutline>
        )}
      </div>
    </div>
  );
};

export default TopNavButtons;
