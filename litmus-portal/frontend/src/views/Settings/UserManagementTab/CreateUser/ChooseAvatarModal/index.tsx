import { Avatar, Badge, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import ButtonFilled from '../../../../../components/Button/ButtonFilled';
import useStyles from './styles';

// Props for ChooseAvatarModal component
interface ChooseAvatarModalProps {
  handleSubmit: () => void;
  setAvatar: React.Dispatch<React.SetStateAction<string>>;
  avatar: string;
}

// avatar file path index
const maleAvatars = [
  './avatars/male1.svg',
  './avatars/male2.svg',
  './avatars/male3.svg',
  './avatars/male4.svg',
];

const femaleAvatars = [
  './avatars/female1.svg',
  './avatars/female2.svg',
  './avatars/female3.svg',
  './avatars/female4.svg',
];

// ChooseAvatarModal displays a modal on clicking Edit Photo
const ChooseAvatarModal: React.FC<ChooseAvatarModalProps> = ({
  handleSubmit,
  setAvatar,
  avatar,
}) => {
  const classes = useStyles();

  // is the avatar still default, helps is enabling button
  const [isDefault, setIsDefault] = useState<boolean>(true);

  const handleChange: (src: string) => void = (src) => {
    setAvatar(src);
    setIsDefault(false);
  };

  return (
    <div>
      <img src={avatar} alt="Selected Avatar" height="100px" />
      <Typography className={classes.typo}>Change your Avatar</Typography>
      <Typography className={classes.typosm}>
        You can now use your new password to login to your account
      </Typography>
      <div className={classes.selectorbg}>
        <div className={classes.avline}>
          {maleAvatars.map((av) => {
            if (av === avatar) {
              return (
                <Badge
                  key={av}
                  overlap="circle"
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  badgeContent={
                    <Avatar
                      className={classes.checkmark}
                      alt="check mark"
                      src="./avatars/checkmark.svg"
                    />
                  }
                >
                  <Avatar
                    data-cy="avatar"
                    className={classes.selav}
                    alt="User"
                    src={av}
                    onClick={() => handleChange(av)}
                  />
                </Badge>
              );
            }
            return (
              <Avatar
                key={av}
                data-cy="avatar"
                className={classes.av}
                alt="User"
                src={av}
                onClick={() => handleChange(av)}
              />
            );
          })}
        </div>
        <div className={classes.avline}>
          {femaleAvatars.map((av) => {
            if (av === avatar) {
              return (
                <Badge
                  key={av}
                  overlap="circle"
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  badgeContent={
                    <Avatar
                      className={classes.checkmark}
                      alt="check mark"
                      src="./avatars/checkmark.svg"
                    />
                  }
                >
                  <Avatar
                    data-cy="avatar"
                    className={classes.selav}
                    alt="User"
                    src={av}
                    onClick={() => handleChange(av)}
                  />
                </Badge>
              );
            }
            return (
              <Avatar
                key={av}
                data-cy="avatar"
                className={classes.av}
                alt="User"
                src={av}
                onClick={() => handleChange(av)}
              />
            );
          })}
        </div>
      </div>
      <ButtonFilled isDisabled={isDefault} isPrimary handleClick={handleSubmit}>
        Choose an avatar
      </ButtonFilled>
    </div>
  );
};
export default ChooseAvatarModal;
