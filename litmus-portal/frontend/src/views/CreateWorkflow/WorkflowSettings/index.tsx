import { Avatar, Typography } from '@material-ui/core';
import { ButtonOutlined, InputField, Modal } from 'litmus-ui';
import localforage from 'localforage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import data from '../../../components/PredifinedWorkflows/data';
import capitalize from '../../../utils/capitalize';
import { validateWorkflowName } from '../../../utils/validate';
import useStyles from './styles';

interface ChooseWorkflowRadio {
  selected: string;
  id?: string;
}

interface WorkflowDetailsProps {
  name: string;
  description: string;
  icon: string;
}

const WorkflowSettings: React.FC = () => {
  const classes = useStyles();

  const [avatarModal, setAvatarModal] = useState<boolean>(false);
  const [workflowDetails, setWorkflowDetails] = useState<WorkflowDetailsProps>({
    name: 'Workflow Name',
    description: 'Workflow Description',
    icon: '',
  });

  const { t } = useTranslation();

  // Loading Workflow Related Data for Workflow Settings
  useEffect(() => {
    localforage.getItem('selectedScheduleOption').then((value) =>
      // Map over the list of predefined workflows and extract the name and detail
      data.map((w) => {
        if (w.workflowID.toString() === (value as ChooseWorkflowRadio).id) {
          setWorkflowDetails({
            name: w.title,
            description: w.details,
            icon: w.urlToIcon,
          });
        }
        return null;
      })
    );
  }, [workflowDetails]);

  // Workflow Name change handler
  const WorkflowNameChangeHandler = () =>
    // event: React.ChangeEvent<{ value: string }>
    {};

  // Workflow Description change handler
  const WorkflowDescriptionChangeHandler = () =>
    // event: React.ChangeEvent<{ value: string }>
    {};

  const handleClose = () => {
    setAvatarModal(false);
  };

  return (
    <div className={classes.root}>
      <div className={classes.headerDiv}>
        <Typography className={classes.header}>
          {t('createWorkflow.chooseWorkflow.settings')}
        </Typography>
        <Typography className={classes.description}>
          {t('createWorkflow.chooseWorkflow.description1')}{' '}
          {workflowDetails.name
            .split('-')
            .map((text) => `${capitalize(text)} `)}
          <br />
          {t('createWorkflow.chooseWorkflow.description2')}
        </Typography>
      </div>
      <div className={classes.avatarDiv}>
        <div className={classes.avatarImgDiv}>
          <Avatar
            variant="square"
            className={classes.avatar}
            data-cy="avatar"
            alt="User"
            src={workflowDetails.icon}
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
                validateWorkflowName(workflowDetails.name)
                  ? t('createWorkflow.chooseWorkflow.validate')
                  : ''
              }
              variant={
                validateWorkflowName(workflowDetails.name) ? 'error' : 'primary'
              }
              onChange={WorkflowNameChangeHandler}
              value={workflowDetails.name}
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
            value={workflowDetails.description}
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
          <div
            style={{
              padding: '2.5rem',
              fontSize: '2rem',
              marginBottom: '15rem',
            }}
          >
            Modal
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

// Modal Content

/* <WorkflowAvatarModal
    setAvatar={setWorkflowDetails}
    setAvatarModal={setAvatarModal}
    avatar={workflowDetails.icon}
  /> */

export default WorkflowSettings;
