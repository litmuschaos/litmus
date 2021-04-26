import React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Typography from '@material-ui/core/Typography';
import { ButtonOutlined } from 'litmus-ui';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import { useTranslation } from 'react-i18next';
import General from '../TuneWorkflowSteps/General';
import SteadyState from '../TuneWorkflowSteps/SteadyState';
import TargetApplication from '../TuneWorkflowSteps/TargetApplication';
import useStyles from './styles';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import { WorkflowManifest } from '../../../../models/redux/workflow';
import { RootState } from '../../../../redux/reducers';
import useActions from '../../../../redux/actions';

interface ConfigurationStepperProps {
  experimentIndex: number;
  closeStepper: () => void;
  isCustom: boolean | undefined;
}

// getStepContent renders the stepper components
// for custom and predefined workflows
function getStepContent(
  step: number,
  engineIndex: number,
  isCustom: boolean | undefined,
  gotoStep: (page: number) => void,
  closeStepper: () => void
): React.ReactNode {
  if (isCustom) {
    switch (step) {
      case 0:
        return <General gotoStep={gotoStep} />;
      case 1:
        return (
          <TargetApplication
            isCustom
            engineIndex={engineIndex}
            gotoStep={gotoStep}
          />
        );
      case 2:
        return (
          <SteadyState
            isCustom
            engineIndex={engineIndex}
            gotoStep={gotoStep}
            closeStepper={closeStepper}
          />
        );
      default:
        return <General gotoStep={gotoStep} />;
    }
  } else {
    switch (step) {
      case 0:
        return (
          <TargetApplication
            isCustom={false}
            engineIndex={engineIndex}
            gotoStep={gotoStep}
          />
        );
      case 1:
        return (
          <SteadyState
            isCustom={false}
            engineIndex={engineIndex}
            gotoStep={gotoStep}
            closeStepper={closeStepper}
          />
        );
      default:
        return (
          <TargetApplication
            isCustom={false}
            engineIndex={engineIndex}
            gotoStep={gotoStep}
          />
        );
    }
  }
}

const ConfigurationStepper: React.FC<ConfigurationStepperProps> = ({
  experimentIndex,
  closeStepper,
  isCustom,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  // State variable to handle Stepper Steps
  const [activeStep, setActiveStep] = React.useState(0);

  // Steps of stepper for custom and predefined workflows
  const steps = isCustom
    ? [
        'General',
        'Target Application',
        'Define the steady state for this application',
      ]
    : ['Target Application', 'Define the steady state for this application'];

  const gotoStep = (page: number) => {
    setActiveStep(page);
  };
  const workflow = useActions(WorkflowActions);
  const manifest: WorkflowManifest = useSelector(
    (state: RootState) => state.workflowManifest
  );

  const deleteExperiment = () => {
    /**
     * Workflow manifest saved in redux state
     */
    const wfManifest = YAML.parse(manifest.manifest);

    /**
     * Get template name according to the experiment index
     */
    const templateName = wfManifest.spec.templates[experimentIndex].name;

    /**
     * Get the workflow name according to the experiment index
     */
    const wfName = YAML.parse(manifest.engineYAML).metadata.name;

    /**
     * if the template is a revert-chaos template
     * the engine name is removed from the
     * revert-chaos template args
     */
    if (
      wfManifest.spec.templates[
        wfManifest.spec.templates.length - 1
      ].name.includes('revert-')
    ) {
      const argument = wfManifest.spec.templates[
        wfManifest.spec.templates.length - 1
      ].container.args[0].replace(wfName, '');
      wfManifest.spec.templates[
        wfManifest.spec.templates.length - 1
      ].container.args[0] = argument;
    }

    /**
     * Remove the experiment name from steps
     */
    wfManifest.spec.templates[0].steps.forEach(
      (data: any, stepIndex: number) => {
        data.forEach((step: any, index: number) => {
          if (step.name === templateName) {
            data.splice(index, 1);
          }
        });
        if (data.length === 0) {
          wfManifest.spec.templates[0].steps.splice(stepIndex, 1);
        }
      }
    );

    /**
     * Remove the chaos engine from the overall manifest
     * according to the experiment index
     */
    wfManifest.spec.templates.splice(experimentIndex, 1);

    /**
     * Set the updated manifest to redux state
     */
    workflow.setWorkflowManifest({
      manifest: YAML.stringify(wfManifest),
      engineYAML: '',
    });
    closeStepper();
  };

  return (
    <div className={classes.root}>
      <div>
        <ButtonOutlined onClick={closeStepper} style={{ float: 'right' }}>
          &#x2715;
        </ButtonOutlined>
      </div>
      <div className={classes.deleteExpDiv}>
        <Typography className={classes.editExpText}>
          {t('createWorkflow.tuneWorkflow.verticalStepper.editExp')}
        </Typography>
        <ButtonOutlined
          onClick={() => {
            deleteExperiment();
          }}
          className={classes.deleteBtn}
        >
          <img
            src="./icons/delete-exp.svg"
            alt="delete"
            className={classes.deleteIcon}
          />
          <Typography color="error" className={classes.deleteExpText}>
            {t('createWorkflow.tuneWorkflow.verticalStepper.deleteExp')}
          </Typography>
        </ButtonOutlined>
      </div>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel className={classes.stepperLabel}>{label}</StepLabel>
            <StepContent>
              <Typography>
                {getStepContent(
                  index,
                  experimentIndex,
                  isCustom,
                  gotoStep,
                  closeStepper
                )}
              </Typography>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

export default ConfigurationStepper;
