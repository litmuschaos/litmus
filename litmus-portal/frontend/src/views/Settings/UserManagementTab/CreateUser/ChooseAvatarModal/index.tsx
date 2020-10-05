import { Avatar, Badge, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  // is the avatar still default, helps is enabling button
  const [isDefault, setIsDefault] = useState<boolean>(true);

  const handleChange = (src: string) => {
    setAvatar(src);
    setIsDefault(false);
  };

  return (
    <div>
      <img src={avatar} alt="Selected Avatar" height="100px" />
      <Typography className={classes.typo}>
        {t('settings.userManagementTab.createUser.chooseAvatarModal.title')}
      </Typography>
      <Typography className={classes.info}>
        {t('settings.userManagementTab.createUser.chooseAvatarModal.info')}
      </Typography>
      <div className={classes.selectorbg}>
        <div className={classes.avatarline}>
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
                    className={classes.selectedavatar}
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
                className={classes.avatar}
                alt="User"
                src={av}
                onClick={() => handleChange(av)}
              />
            );
          })}
        </div>
        <div className={classes.avatarline}>
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
                    className={classes.selectedavatar}
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
                className={classes.avatar}
                alt="User"
                src={av}
                onClick={() => handleChange(av)}
              />
            );
          })}
        </div>
      </div>
      <ButtonFilled isDisabled={isDefault} isPrimary handleClick={handleSubmit}>
        {t('settings.userManagementTab.createUser.chooseAvatarModal.button')}
      </ButtonFilled>
    </div>
  );
};
export default ChooseAvatarModal;
