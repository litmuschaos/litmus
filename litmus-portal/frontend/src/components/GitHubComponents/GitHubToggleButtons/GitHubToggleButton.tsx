import { Button, Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface MyHubToggleProps {
  isPublicToggled: boolean;
  isPrivateToggled: boolean;
}

interface Props {
  isToggled: MyHubToggleProps;
  setIsToggled: React.Dispatch<React.SetStateAction<MyHubToggleProps>>;
}

const GitHubToggleButton: React.FC<Props> = ({ isToggled, setIsToggled }) => {
  const classes = useStyles();
  const setFilledButtonState = (buttonName: string) => {
    return (
      <Button
        className={classes.toggleActive}
        onClick={() =>
          isToggled.isPublicToggled
            ? setIsToggled({
                isPublicToggled: true,
                isPrivateToggled: false,
              })
            : isToggled.isPrivateToggled
            ? setIsToggled({
                isPublicToggled: false,
                isPrivateToggled: true,
              })
            : setIsToggled({
                isPublicToggled: false,
                isPrivateToggled: false,
              })
        }
      >
        <Typography className={classes.toggleFont}>{buttonName}</Typography>
      </Button>
    );
  };

  const setButtonOutlinedState = (
    buttonName: string,
    setIsToggleValues: MyHubToggleProps
  ) => {
    return (
      <Button
        className={classes.toggleInactive}
        onClick={() => setIsToggled(setIsToggleValues)}
      >
        <Typography className={classes.toggleFont}>{buttonName}</Typography>
      </Button>
    );
  };

  const PublicButton = () =>
    isToggled.isPublicToggled
      ? setFilledButtonState('Public')
      : setButtonOutlinedState('Public', {
          isPublicToggled: true,
          isPrivateToggled: false,
        });

  const PrivateButton = () =>
    isToggled.isPrivateToggled
      ? setFilledButtonState('Private')
      : setButtonOutlinedState('Private', {
          isPublicToggled: false,
          isPrivateToggled: true,
        });

  return (
    <div>
      <div>
        {PublicButton()}
        {PrivateButton()}
      </div>
    </div>
  );
};

export default GitHubToggleButton;
