import { useLazyQuery } from '@apollo/client';
import {
  Avatar,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@material-ui/core';
import { ButtonOutlined, InputField, Modal } from 'litmus-ui';
import localforage from 'localforage';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import config from '../../../config';
import { GET_EXPERIMENT_DATA, GET_TEMPLATE_BY_ID } from '../../../graphql';
import { ExperimentDetail } from '../../../models/graphql/chaoshub';
import { ChooseWorkflowRadio } from '../../../models/localforage/radioButton';
import { WorkflowDetailsProps } from '../../../models/localforage/workflow';
import useActions from '../../../redux/actions';
import * as AlertActions from '../../../redux/actions/alert';
import * as ImageRegistryActions from '../../../redux/actions/image_registry';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import capitalize from '../../../utils/capitalize';
import { getProjectID } from '../../../utils/getSearchParams';
import { validateWorkflowName } from '../../../utils/validate';
import parsed from '../../../utils/yamlUtils';
import useStyles from './styles';

const WorkflowSettings = forwardRef((_, ref) => {
  const classes = useStyles();
  const [avatarModal, setAvatarModal] = useState<boolean>(false);
  const [displayRegChange, setDisplayRegChange] = useState(true);
  const projectID = getProjectID();
  // Workflow States
  const [name, setName] = useState<string>('');
  const [descriptionHeader, setDescriptionHeader] = useState<JSX.Element>(
    <></>
  );
  const [description, setDescription] = useState<string>('');
  const [icon, setIcon] = useState<string>('');
  const [CRDLink, setCRDLink] = useState<string>('');
  // Actions
  const workflowAction = useActions(WorkflowActions);
  const workflowData = useSelector((state: RootState) => state.workflowData);
  const { manifest, isUploaded } = useSelector(
    (state: RootState) => state.workflowManifest
  );
  const imageRegistry = useActions(ImageRegistryActions);
  const imageRegistryData = useSelector(
    (state: RootState) => state.selectedImageRegistry
  );
  const [updateRegistry, setUpdateRegistry] = useState(
    imageRegistryData.update_registry
  );
  const [hubName, setHubName] = useState('');
  // Query to get charts of selected MyHub
  const [getWorkflowDetails] = useLazyQuery<ExperimentDetail>(
    GET_EXPERIMENT_DATA,
    {
      fetchPolicy: 'cache-and-network',
      onCompleted: (data) => {
        if (data.getHubExperiment !== undefined) {
          setName(data.getHubExperiment.metadata.name.toLowerCase());
          setDescription(data.getHubExperiment.spec.categoryDescription);
          setIcon(
            `${config.grahqlEndpoint}/icon/${projectID}/${hubName}/predefined/${data.getHubExperiment.metadata.name}.png`
          );
          setCRDLink(data.getHubExperiment.metadata.name);
        }
      },
    }
  );

  const [getSavedTemplateDetails] = useLazyQuery(GET_TEMPLATE_BY_ID, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data.getWorkflowManifestByID !== undefined) {
        setName(data.getWorkflowManifestByID.templateName);
        setDescription(data.getWorkflowManifestByID.templateDescription);
        setIcon('./avatars/litmus.svg');
        setCRDLink(data.getWorkflowManifestByID.template_id);
        const savedTemplate = data.getWorkflowManifestByID.manifest;
        if (parsed(savedTemplate).length === 0) {
          workflowAction.setWorkflowManifest({
            manifest: savedTemplate,
            isUploaded: true,
          });
        }
      }
    },
  });

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

  const detectHeader = () => {
    return localforage
      .getItem('selectedScheduleOption')
      .then((value) =>
        value && (value as ChooseWorkflowRadio).selected === 'A'
          ? setDescriptionHeader(
              <>{t('createWorkflow.chooseWorkflow.descriptionA')} </>
            )
          : value && (value as ChooseWorkflowRadio).selected === 'B'
          ? setDescriptionHeader(
              <>{t('createWorkflow.chooseWorkflow.descriptionB')} </>
            )
          : value && (value as ChooseWorkflowRadio).selected === 'C'
          ? setDescriptionHeader(
              <>{t('createWorkflow.chooseWorkflow.descriptionC')} </>
            )
          : setDescriptionHeader(
              <>{t('createWorkflow.chooseWorkflow.descriptionD')} </>
            )
      );
  };

  const initializeWithDefault = () => {
    localforage.getItem('selectedScheduleOption').then((value) => {
      // Map over the list of predefined workflows and extract the name and detail
      if ((value as ChooseWorkflowRadio).selected === 'A') {
        localforage.getItem('selectedHub').then((hub) => {
          setHubName(hub as string);
          getWorkflowDetails({
            variables: {
              request: {
                hubName: hub as string,
                projectID,
                chartName: 'predefined',
                experimentName: (value as ChooseWorkflowRadio).id,
                fileType: 'CSV',
              },
            },
          });
        });
        setDisplayRegChange(true);
        workflowAction.setWorkflowManifest({ manifest: '' });
      }
      if ((value as ChooseWorkflowRadio).selected === 'B') {
        getSavedTemplateDetails({
          variables: {
            projectID: getProjectID(),
            templateID: (value as ChooseWorkflowRadio).id,
          },
        });
        setDisplayRegChange(true);
        workflowAction.setWorkflowManifest({ manifest: '' });
      }
      if ((value as ChooseWorkflowRadio).selected === 'C') {
        setName('custom');
        workflowAction.setWorkflowManifest({ manifest: manifest ?? '' });
        setDescription('Custom Chaos Scenario');
        setIcon('./avatars/litmus.svg');
        setDisplayRegChange(true);
      }
      if ((value as ChooseWorkflowRadio).selected === 'D') {
        const wfName = `custom-scenario-${Math.round(
          new Date().getTime() / 1000
        )}`;
        setName(wfName);
        setDescription('Chaos Scenario');
        setIcon('./avatars/litmus.svg');
        setDisplayRegChange(false);
      }

      /** Store a boolean value in local storage to serve as an indication
       *  whether user already has edited data or not
       */

      localforage.setItem('hasSetWorkflowData', false);
    });
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
    alert.changeAlertState(false);
    detectHeader();
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
      icon,
      CRDLink,
    };

    localforage.setItem('workflow', workflowDetails);
    imageRegistry.selectImageRegistry({
      ...imageRegistryData,
      update_registry: updateRegistry,
    });
    if (isUploaded) {
      const workflow = YAML.parse(manifest);
      workflow.metadata.name = name;
      workflowAction.setWorkflowManifest({
        manifest: YAML.stringify(workflow),
      });
    }
    if (!name.length) {
      alert.changeAlertState(true); // Workflow Name is empty and user clicked on Next
      return false;
    }
    if (name.length > 0 && validateWorkflowName(name)) {
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
      <div className={classes.innerContainer}>
        <div>
          <Typography className={classes.header}>
            {t('createWorkflow.chooseWorkflow.settings')}
          </Typography>
          <Typography className={classes.description}>
            {descriptionHeader}
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
              alt="User"
              src={icon}
            />
          </div>
          <div className={classes.inputDiv}>
            <div aria-details="spacer" className={classes.mainDiv}>
              <InputField
                data-cy="WorkflowName"
                title="workflowName"
                label={t('createWorkflow.chooseWorkflow.label.workflowName')}
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
              <InputField
                data-cy="WorkflowNamespace"
                InputProps={{
                  readOnly: true,
                }}
                disabled
                className={classes.nsInput}
                label={t('createWorkflow.chooseWorkflow.label.namespace')}
                value={workflowData.namespace}
              />
            </div>
            <div aria-details="spacer" className={classes.descDiv} />
            <InputField
              data-cy="WorkflowDescription"
              id="filled-workflowdescription-input"
              label={t('createWorkflow.chooseWorkflow.label.desc')}
              fullWidth
              InputProps={{
                disableUnderline: true,
              }}
              value={description}
              onChange={descriptionChangeHandle}
              multiline
              rows={8}
            />
            <div aria-details="spacer" className={classes.checkboxDiv} />
            {displayRegChange && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={updateRegistry}
                    onChange={(event) => {
                      return setUpdateRegistry(event.target.checked);
                    }}
                    className={classes.checkBoxDefault}
                    name="checkedB"
                    color="primary"
                  />
                }
                label={
                  <Typography className={classes.checkBoxText}>
                    {t('createWorkflow.chooseWorkflow.enableRegistry')}
                  </Typography>
                }
              />
            )}
          </div>
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
