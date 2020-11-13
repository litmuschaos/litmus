import { Typography } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ButtonFilled from '../../../components/Button/ButtonFilled';
import ButtonOutline from '../../../components/Button/ButtonOutline';
import InputField from '../../../components/InputField';
import PredifinedWorkflows from '../../../components/PredifinedWorkflows';
import workflowsList from '../../../components/PredifinedWorkflows/data';
import Unimodal from '../../../containers/layouts/Unimodal';
import useActions from '../../../redux/actions';
import * as TemplateSelectionActions from '../../../redux/actions/template';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import { validateWorkflowName } from '../../../utils/validate';
import useStyles, { CssTextField } from './styles';

// import { getWkfRunCount } from "../../utils";

const ChooseWorkflow: React.FC = () => {
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
    });
  }, []);

  // Sets workflow details based on user clicks
  const selectWorkflow = (index: number) => {
    template.selectTemplate({ selectedTemplateID: index, isDisable: false });

    const timeStampBasedWorkflowName: string = `argowf-chaos-${
      workflowsList[index].title
    }-${Math.round(new Date().getTime() / 1000)}`;

    workflow.setWorkflowDetails({
      name: timeStampBasedWorkflowName,
      link: workflowsList[index].chaosWkfCRDLink,
      id: workflowsList[index].workflowID,
      yaml: 'none',
      description: workflowsList[index].description,
      isCustomWorkflow: workflowsList[index].isCustom,
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

    const timeStampBasedWorkflowName: string = `argowf-chaos-${
      workflowsList[index].title
    }-${Math.round(new Date().getTime() / 1000)}`;
    workflow.setWorkflowDetails({
      name: timeStampBasedWorkflowName,
      link: workflowsList[index].chaosWkfCRDLink,
      id: workflowsList[index].workflowID,
      yaml: 'none',
      description: workflowsList[index].description,
      isCustomWorkflow: workflowsList[index].isCustom,
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
              handleClick={() => {
                setOpen(true);
              }}
              isPrimary={false}
              isDisabled={isDisable}
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
      <Unimodal open={open} handleClose={() => setOpen(false)} hasCloseBtn>
        <div>
          <Typography className={classes.modalHeading} display="inline">
            {t('createWorkflow.chooseWorkflow.modalHeading')}{' '}
            <strong>
              {t('createWorkflow.chooseWorkflow.modalHeadingStrong')}
            </strong>
          </Typography>
          <div className={classes.modalContainerBody}>
            <div className={classes.inputDiv}>
              <InputField
                // id="filled-workflowname-input"
                label={t('createWorkflow.chooseWorkflow.label.workflowName')}
                styles={{
                  width: '100%',
                }}
                data-cy="inputWorkflow"
                helperText={
                  validateWorkflowName(workflowDetails.workflowName)
                    ? 'Should not contain spaces or upper case letters'
                    : ''
                }
                success={isSuccess.current}
                validationError={validateWorkflowName(
                  workflowDetails.workflowName
                )}
                // className={classes.textfieldworkflowname}
                handleChange={WorkflowNameChangeHandler}
                value={workflowDetails.workflowName}
              />
              <div className={classes.inputAreaDescription}>
                <CssTextField
                  id="filled-workflowdescription-input"
                  label={t('createWorkflow.chooseWorkflow.label.desc')}
                  InputProps={{
                    disableUnderline: true,
                    classes: {
                      input: classes.resize,
                    },
                  }}
                  data-cy="inputWorkflowDescription"
                  className={classes.textfieldworkflowdescription}
                  value={workflowDetails.workflowDesc}
                  onChange={WorkflowDescriptionChangeHandler}
                  multiline
                  rows={12}
                />
              </div>
            </div>
            <div className={classes.buttons}>
              <div className={classes.cancelButton}>
                <ButtonOutline
                  handleClick={() => setOpen(false)}
                  isDisabled={false}
                >
                  <div>{t('createWorkflow.chooseWorkflow.button.cancel')}</div>
                </ButtonOutline>
              </div>
              <div className={classes.saveButton}>
                <ButtonFilled
                  isPrimary={false}
                  isDisabled={!isSuccess.current}
                  handleClick={() => handleSave()}
                >
                  <div>{t('createWorkflow.chooseWorkflow.button.save')}</div>
                </ButtonFilled>
              </div>
            </div>
          </div>
        </div>
      </Unimodal>
    </div>
  );
};

export default ChooseWorkflow;
