import { Avatar, Typography } from '@material-ui/core';
import { ButtonOutlined, InputField, Modal } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import { WorkflowData } from '../../../models/redux/workflow';
import { RootState } from '../../../redux/reducers';
import { validateWorkflowName } from '../../../utils/validate';
import useStyles from './styles';
import WorkflowAvatarModal from './WorkflowAvatarModal';
import * as WorkflowActions from '../../../redux/actions/workflow';
import useActions from '../../../redux/actions';

const WorkflowSettings: React.FC = () => {
  const classes = useStyles();

  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );
  const workflow = useActions(WorkflowActions);
  const [workflowDetails, setWorkflowData] = useState({
    workflowName: workflowData.name,
    workflowDesc: 'Personal Description',
  });
  const [avatarModal, setAvatarModal] = useState(false);

  const { t } = useTranslation();

  // Workflow Name change handler
  const WorkflowNameChangeHandler = (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    setWorkflowData({
      workflowName: (event.target as HTMLInputElement).value,
      workflowDesc: workflowDetails.workflowDesc,
    });
    const parsedYaml = YAML.parse(workflowData.yaml);
    parsedYaml.metadata.name = event.target.value;
    workflow.setWorkflowDetails({
      name: event.target.value,
      yaml: YAML.stringify(parsedYaml),
    });
  };

  // Workflow Description change handler
  const WorkflowDescriptionChangeHandler = (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    setWorkflowData({
      workflowName: workflowDetails.workflowName,
      workflowDesc: (event.target as HTMLInputElement).value,
    });
    workflow.setWorkflowDetails({
      description: event.target.value,
    });
  };

  // Default avatar state
  const [avatar, setAvatar] = useState<string>(
    workflowData.workflowIcon === ''
      ? './avatars/kafka.svg'
      : workflowData.workflowIcon
  );

  const handleClose = () => {
    setAvatarModal(false);
  };

  return (
    <div className={classes.root}>
      <div className={classes.headerDiv}>
        <Typography className={classes.headerFont}>
          {t('createWorkflow.chooseWorkflow.settings')}
        </Typography>
        <Typography className={classes.descriptionFont}>
          {t('createWorkflow.chooseWorkflow.description')}
        </Typography>
      </div>
      <div className={classes.avatarDiv}>
        <div className={classes.avatarImgDiv}>
          <Avatar
            variant="square"
            className={classes.avatar}
            data-cy="avatar"
            alt="User"
            src={avatar}
          />
          <Typography
            className={classes.editText}
            onClick={() => setAvatarModal(true)}
          >
            {t('createWorkflow.chooseWorkflow.edit')}
          </Typography>
        </div>
        <div className={classes.inputDiv}>
          <div aria-details="spacer" style={{ width: '60%' }}>
            <InputField
              label={t('createWorkflow.chooseWorkflow.label.workflowName')}
              data-cy="inputWorkflow"
              fullWidth
              helperText={
                validateWorkflowName(workflowDetails.workflowName)
                  ? t('createWorkflow.chooseWorkflow.validate')
                  : ''
              }
              variant={
                validateWorkflowName(workflowDetails.workflowName)
                  ? 'error'
                  : 'primary'
              }
              onChange={WorkflowNameChangeHandler}
              value={workflowDetails.workflowName}
            />
          </div>
          <div aria-details="spacer" style={{ margin: '3rem 0' }} />
          <InputField
            id="filled-workflowdescription-input"
            label={t('createWorkflow.chooseWorkflow.label.desc')}
            fullWidth
            InputProps={{
              disableUnderline: true,
            }}
            data-cy="inputWorkflowDescription"
            value={workflowDetails.workflowDesc}
            onChange={WorkflowDescriptionChangeHandler}
            multiline
            rows={8}
          />
        </div>
      </div>
      {avatarModal ? (
        <Modal
          open={avatarModal}
          width="60%"
          onClose={() => setAvatarModal(false)}
          modalActions={
            <ButtonOutlined onClick={handleClose}>&#x2715;</ButtonOutlined>
          }
        >
          <WorkflowAvatarModal
            setAvatar={setAvatar}
            setAvatarModal={setAvatarModal}
            avatar={avatar}
          />
        </Modal>
      ) : null}
    </div>
  );
};

export default WorkflowSettings;
