import { ButtonOutlined, ButtonFilled } from 'litmus-ui';
import React from 'react';
import { useSelector } from 'react-redux';
import BackButton from '../../components/Button/BackButton';
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
        <BackButton isDisabled={false} />
      </div>
      <div>
        {isInfoToggled ? (
          <ButtonFilled
            className={classes.btnFilled}
            onClick={() =>
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
          <ButtonOutlined
            // styles={{ height: '2.2rem' }}
            onClick={() =>
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
          </ButtonOutlined>
        )}
      </div>
    </div>
  );
};

export default TopNavButtons;
