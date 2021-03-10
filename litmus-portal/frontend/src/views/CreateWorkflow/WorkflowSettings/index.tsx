import { Avatar, Typography } from '@material-ui/core';
import { ButtonOutlined, InputField, Modal } from 'litmus-ui';
import localforage from 'localforage';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import data from '../../../components/PredifinedWorkflows/data';
import { ChooseWorkflowRadio } from '../../../models/localforage/radioButton';
import { WorkflowDetailsProps } from '../../../models/localforage/workflow';
import useActions from '../../../redux/actions';
import * as AlertActions from '../../../redux/actions/alert';
import capitalize from '../../../utils/capitalize';
import { validateWorkflowName } from '../../../utils/validate';
import useStyles from './styles';

const WorkflowSettings = forwardRef((_, ref) => {
  const classes = useStyles();

  const [avatarModal, setAvatarModal] = useState<boolean>(false);

  // Workflow States
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [CRD, setCRD] = useState<string>('');
  const [icon, setIcon] = useState<string>('');

  const { t } = useTranslation();
  const alert = useActions(AlertActions);

  const checkForStoredData = () => {
    localforage.getItem('workflow').then((workflow) => {
      // If data is present set all the data to local state for the UI to display
      if (workflow && (workflow as WorkflowDetailsProps).name !== '') {
        setName((workflow as WorkflowDetailsProps).name);
      }
      if (workflow && (workflow as WorkflowDetailsProps).description !== '') {
        setDescription((workflow as WorkflowDetailsProps).description);
      }
      if (workflow && (workflow as WorkflowDetailsProps).icon !== '') {
        setIcon((workflow as WorkflowDetailsProps).icon);
      }
    });
  };

  const initializeWithDefault = () => {
    localforage.getItem('selectedScheduleOption').then((value) =>
      // Map over the list of predefined workflows and extract the name and detail
      data.map((w) => {
        if (w.workflowID.toString() === (value as ChooseWorkflowRadio).id) {
          setName(w.title);
          setDescription(w.details);
          setCRD(w.chaosWkfCRDLink);
          setIcon(w.urlToIcon);
        }
        return null;
      })
    );
    /** Store a boolean value in local storage to serve as an indication
     *  whether user already has edited data or not
     */

    localforage.setItem('hasSetWorkflowData', false);
  };

  // Loading Workflow Related Data for Workflow Settings
  useEffect(() => {
    /** Retrieving saved data from index DB,
     *  if user has already edited the details then it will fetch the stored data
     *  and call checkForStoredData()
     *  else it will initializeWithDefault()
     */
    localforage.getItem('hasSetWorkflowData').then((isDataPresent) => {
      return isDataPresent ? checkForStoredData() : initializeWithDefault();
    });
  }, []);

  // Workflow Name Change Handler
  const nameChangeHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    localforage.setItem('hasSetWorkflowData', true);
  };

  // Workflow Description Change Handler
  const descriptionChangeHandle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDescription(event.target.value);
    localforage.setItem('hasSetWorkflowData', true);
  };

  const handleClose = () => {
    setAvatarModal(false);
  };

  function onNext() {
    /** Creating an object to be stored in local forage for iterative fetching
     *  Used in cases where users need to return back to previous page
     *  and wants the edited data stored/saved
     */
    const workflowDetails: WorkflowDetailsProps = {
      name,
      description,
      CRD,
      icon,
    };
    localforage.setItem('workflow', workflowDetails);
    if (validateWorkflowName(name)) {
      alert.changeAlertState(true); // Workflow Name is not valid and user clicked on Next
      return false;
    }
    return true;
  }

  useImperativeHandle(ref, () => ({
    onNext,
  }));

  return (
    <div className={classes.root}>
      <div className={classes.headerDiv}>
        <Typography className={classes.header}>
          {t('createWorkflow.chooseWorkflow.settings')}
        </Typography>
        <Typography className={classes.description}>
          {t('createWorkflow.chooseWorkflow.description1')}{' '}
          <i>
            <strong>
              {name.split('-').map((text) => `${capitalize(text)} `)}
            </strong>
          </i>
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
            src={icon}
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
                validateWorkflowName(name)
                  ? t('createWorkflow.chooseWorkflow.validate')
                  : ''
              }
              variant={validateWorkflowName(name) ? 'error' : 'primary'}
              onChange={nameChangeHandle}
              value={name}
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
            value={description}
            onChange={descriptionChangeHandle}
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
});

// Modal Content

/* <WorkflowAvatarModal
    setAvatar={setWorkflowDetails}
    setAvatarModal={setAvatarModal}
    avatar={workflowDetails.icon}
  /> */

export default WorkflowSettings;
