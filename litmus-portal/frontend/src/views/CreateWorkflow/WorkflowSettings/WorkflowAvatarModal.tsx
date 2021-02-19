import { Avatar, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import useStyles from './styles';

interface WorkflowAvatarModalProps {
  setAvatar: React.Dispatch<React.SetStateAction<string>>;
  setAvatarModal: React.Dispatch<React.SetStateAction<boolean>>;
  avatar: string;
}

const WorkflowAvatarModal: React.FC<WorkflowAvatarModalProps> = ({
  setAvatar,
  setAvatarModal,
  avatar,
}) => {
  // Avatar for experiment icons
  const expAvatars = [
    './avatars/cassandra.svg',
    './avatars/generic.svg',
    './avatars/kafka.svg',
    './avatars/litmus.svg',
    './avatars/longhorn.svg',
    './avatars/coredns.svg',
  ];

  const classes = useStyles();

  const [avatarIcon, setAvatarIcon] = useState(avatar);
  const [avatarChanged, setAvatarChanged] = useState(true);
  const workflow = useActions(WorkflowActions);
  const handleChange = (src: string) => {
    setAvatarIcon(src);
  };

  const handleIconSave = () => {
    if (avatarIcon === avatar) {
      setAvatarChanged(false);
    } else {
      setAvatarModal(false);
      workflow.setWorkflowDetails({
        workflowIcon: avatarIcon,
      });
      setAvatar(avatarIcon);
    }
  };

  const { t } = useTranslation();
  return (
    <div className={classes.avatarModalDiv}>
      {avatarChanged ? (
        <>
          <Avatar
            data-cy="avatar"
            className={classes.selectAvatar}
            alt="User"
            src={avatarIcon}
          />

          <Typography className={classes.modalHeaderFont}>
            {t('createWorkflow.chooseWorkflow.changeImage')}
          </Typography>
          <Typography className={classes.modalDescriptionFont}>
            {t('createWorkflow.chooseWorkflow.changeImgDescription')}
          </Typography>

          <div className={classes.avatarSelection}>
            {expAvatars.map((av) => {
              return (
                <Avatar
                  data-cy="avatar"
                  className={classes.selectAvatar}
                  alt="User"
                  src={av}
                  onClick={() => handleChange(av)}
                />
              );
            })}
          </div>
          <div className={classes.modalButton}>
            <ButtonFilled onClick={handleIconSave}>
              {t('createWorkflow.chooseWorkflow.saveChanges')}
            </ButtonFilled>
          </div>
        </>
      ) : (
        <div>
          <Typography className={classes.imgNotChanged}>
            {t('createWorkflow.chooseWorkflow.imageNotChanged')}
          </Typography>
          <Typography className={classes.continue}>
            {t('createWorkflow.chooseWorkflow.continue')}
          </Typography>
          <ButtonFilled
            onClick={() => {
              setAvatarModal(false);
              workflow.setWorkflowDetails({
                workflowIcon: avatarIcon,
              });
            }}
          >
            {t('createWorkflow.chooseWorkflow.continueBtn')}
          </ButtonFilled>
        </div>
      )}
    </div>
  );
};

export default WorkflowAvatarModal;
