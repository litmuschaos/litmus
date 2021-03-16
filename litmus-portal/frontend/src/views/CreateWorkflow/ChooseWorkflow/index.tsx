import { Typography } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import { ButtonFilled, InputField, Modal, ButtonOutlined } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ButtonOutline from '../../../components/Button/ButtonOutline';
import PredifinedWorkflows from '../../../components/PredifinedWorkflows';
import workflowsList from '../../../components/PredifinedWorkflows/data';
import { WorkflowData } from '../../../models/redux/workflow';
import useActions from '../../../redux/actions';
import * as TemplateSelectionActions from '../../../redux/actions/template';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import { validateWorkflowName } from '../../../utils/validate';
import useStyles from './styles';

// import { getWkfRunCount } from "../../utils";

interface ChooseWorkflowProps {
  isEditable?: boolean;
}

const ChooseWorkflow: React.FC<ChooseWorkflowProps> = ({ isEditable }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const workflow = useActions(WorkflowActions);
  const template = useActions(TemplateSelectionActions);
  const isDisable = useSelector(
    (state: RootState) => state.selectTemplate.isDisable
  );
  const selectedTemplateID = useSelector(
    (state: RootState) => state.selectTemplate.selectedTemplateID
  );
  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );

  const [open, setOpen] = React.useState(false);
  const isSuccess = React.useRef<boolean>(false);
  const [workflowDetails, setWorkflowData] = useState({
    workflowName: 'Personal Workflow Name',
    workflowDesc: 'Personal Description',
  });

  const WorkflowNameChangeHandler = (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    setWorkflowData({
      workflowName: (event.target as HTMLInputElement).value,
      workflowDesc: workflowDetails.workflowDesc,
    });
  };

  const WorkflowDescriptionChangeHandler = (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    setWorkflowData({
      workflowName: workflowDetails.workflowName,
      workflowDesc: (event.target as HTMLInputElement).value,
    });
  };

  const handleSave = () => {
    if (isSuccess.current) {
      workflow.setWorkflowDetails({
        name: workflowDetails.workflowName,
        description: workflowDetails.workflowDesc,
      });
      setOpen(false);
    }
  };

  /*
	const { analyticsData } = useSelector(
		(state: RootState) => state
	);
  */

  if (validateWorkflowName(workflowDetails.workflowName) === false)
    isSuccess.current = true;
  else isSuccess.current = false;

  useEffect(() => {
    workflow.setWorkflowDetails({
      name: 'Personal Workflow Name',
      description: 'Personal Workflow Description',
      yaml: '#You can start creating your own workflow from here.',
      weights: [],
      link: '',
      id: '',
      isCustomWorkflow: true,
      chaosEngineChanged: false,
    });
  }, []);

  // Sets workflow details based on user clicks
  const selectWorkflow = (index: number) => {
    template.selectTemplate({ selectedTemplateID: index, isDisable: false });

    const timeStampBasedWorkflowName: string = isEditable
      ? `argowf-chaos-${workflowsList[index].title}-${Math.round(
          new Date().getTime() / 1000
        )}`
      : workflowData.name;

    workflow.setWorkflowDetails({
      name: timeStampBasedWorkflowName,
      link: workflowsList[index].chaosWkfCRDLink,
      id: workflowsList[index].workflowID,
      yaml: 'none',
      description: isEditable
        ? workflowsList[index].description
        : workflowData.description,
      isCustomWorkflow: isEditable
        ? workflowsList[index].isCustom
        : workflowData.isCustomWorkflow,
      isRecurring: false,
    });

    setWorkflowData({
      workflowName: timeStampBasedWorkflowName,
      workflowDesc: workflowsList[index].description,
    });

    if (workflowsList[index].isCustom === true) {
      setOpen(true);
    }
  };

  // Set pre-highlighter for initial render based on isDisable field
  useEffect(() => {
    const index = selectedTemplateID;

    const timeStampBasedWorkflowName: string = isEditable
      ? `argowf-chaos-${workflowsList[index].title}-${Math.round(
          new Date().getTime() / 1000
        )}`
      : workflowData.name;

    workflow.setWorkflowDetails({
      name: timeStampBasedWorkflowName,
      link: workflowsList[index].chaosWkfCRDLink,
      id: workflowsList[index].workflowID,
      yaml: 'none',
      description: workflowsList[index].description,
      isCustomWorkflow: isEditable
        ? workflowsList[index].isCustom
        : workflowData.isCustomWorkflow,
      isRecurring: false,
    });

    setWorkflowData({
      workflowName: timeStampBasedWorkflowName,
      workflowDesc: workflowsList[index].description,
    });
  }, [isDisable]);

  return (
    <div>
      <div className={classes.root}>
        <Typography className={classes.heading}>
          <strong>{t('createWorkflow.chooseWorkflow.header')}</strong>
        </Typography>
        <Typography className={classes.description}>
          {t('createWorkflow.chooseWorkflow.info')}
        </Typography>
        <Divider variant="middle" className={classes.horizontalLine} />
        <div className={classes.cards}>
          <Typography className={classes.totalWorkflows}>
            {workflowsList.length}{' '}
            {t('createWorkflow.chooseWorkflow.preDefined')}
          </Typography>
          <PredifinedWorkflows
            callbackOnSelectWorkflow={(index: number) => {
              selectWorkflow(index);
            }}
            workflows={workflowsList}
            isCustomWorkflowVisible
          />
          <div className={classes.paddedTop}>
            <ButtonFilled
              data-cy="EditWorkflowButton"
              onClick={() => {
                setOpen(true);
              }}
              variant="success"
              disabled={isDisable}
            >
              <div>{t('createWorkflow.chooseWorkflow.button.edit')}</div>
            </ButtonFilled>
            <Typography className={classes.saved} display="inline">
              <strong>
                <span> &nbsp; &nbsp; &#10003;</span> &nbsp;{' '}
                {t('createWorkflow.chooseWorkflow.saved')} &quot;
                <Typography
                  id="SetName"
                  className={classes.selectionName}
                  display="inline"
                >
                  <strong>{workflowDetails.workflowName}</strong>
                </Typography>
                &quot;
              </strong>
            </Typography>
          </div>
        </div>
      </div>
      <Modal
        data-cy="WorkflowDetailsModal"
        open={open}
        onClose={() => setOpen(false)}
        width="70%"
        modalActions={
          <ButtonOutlined onClick={() => setOpen(false)}>
            &#x2715;
          </ButtonOutlined>
        }
      >
        <div className={classes.modal}>
          <Typography className={classes.modalHeading} display="inline">
            {t('createWorkflow.chooseWorkflow.modalHeading')}{' '}
            <strong>
              {t('createWorkflow.chooseWorkflow.modalHeadingStrong')}
            </strong>
          </Typography>
          <div className={classes.modalContainerBody}>
            <div className={classes.inputDiv}>
              <div data-cy="WorkflowNameInput">
                <InputField
                  // id="filled-workflowname-input"
                  label={t('createWorkflow.chooseWorkflow.label.workflowName')}
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
                  disabled={!isEditable}
                  onChange={WorkflowNameChangeHandler}
                  value={workflowDetails.workflowName}
                />
              </div>
              <div aria-details="spacer" style={{ margin: '1rem 0' }} />
              <div data-cy="WorkflowDescriptionInput">
                <InputField
                  // id="filled-workflowdescription-input"
                  label={t('createWorkflow.chooseWorkflow.label.desc')}
                  fullWidth
                  InputProps={{
                    disableUnderline: true,
                  }}
                  value={workflowDetails.workflowDesc}
                  onChange={WorkflowDescriptionChangeHandler}
                  multiline
                  rows={12}
                />
              </div>
            </div>
            <div
              className={classes.buttons}
              data-cy="WorkflowDetailsModalButtons"
            >
              <ButtonOutline
                handleClick={() => setOpen(false)}
                isDisabled={false}
              >
                <div>{t('createWorkflow.chooseWorkflow.button.cancel')}</div>
              </ButtonOutline>

              <ButtonFilled
                variant="success"
                disabled={!isSuccess.current}
                onClick={() => handleSave()}
              >
                <div>{t('createWorkflow.chooseWorkflow.button.save')}</div>
              </ButtonFilled>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChooseWorkflow;
